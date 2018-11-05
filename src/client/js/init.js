const addMetaMapData = () => {
    const codeSet = new Set(customCodes);
    const codeArr = [];
    const display = [];

    for (let i = 0; i < mmdata.length; i++) {
        const post = mmdata[i];
        const entries = post.entities;
        const conceptGroup = new Map();
        const conceptArray = [];
        const finalHtml = [];
        let raw = post.text.replace(/  /g, ' ').trim();
        let tx;

        // Get author name and remove from text
        const authorNameStartIdx = raw.lastIndexOf('[');
        const authorName = raw.substr(authorNameStartIdx + 1, 100).replace(']','');
        raw = raw.substr(0, authorNameStartIdx);

        // Group concepts by their start index
        for (const entry of entries) {
            const indices = { start: entry.start, stop: (entry.start + entry.length) };
            const group = conceptGroup.get(entry.start);
            codeSet.add(entry.evList[0].conceptInfo.preferredName.toLowerCase());

            if (group) {
                if (group.stop < indices.stop) {
                    group.stop = indices.stop;
                } 
                group.concepts.push(entry);
            }
            else {
                conceptGroup.set(entry.start, {
                    concepts: [ entry ],
                    start: indices.start,
                    stop: indices.stop
                });
            }
        }

        conceptGroup.forEach(x => conceptArray.push(x));

        if (!conceptArray.length) continue;

        // Get initial phrase if not starting with mm concept
        const len = conceptArray.length;
        if (conceptArray[0].start > 0) {
            tx = raw.substr(0, conceptArray[0].start - 1).trim();
            finalHtml.push(`<span>${tx}</span>`);
        }

        for (let i = 0; i < len; i++) {
            const val = conceptArray[i];
            const next = i + 1 < len ? conceptArray[i + 1] : undefined;
            tx = raw.substr(val.start, (val.stop - val.start) + 1).trim();
            finalHtml.push(`<span class='concept'>${tx}</span>`);

            if (next && next.start - 1 > val.stop) {
                tx = raw.substr(val.stop + 1, (next.start - val.stop) - 1).trim();
                finalHtml.push(`<span>${tx}</span>`);
            }
        }

        // Get final phrase if not end with mm concept
        if (conceptArray[len - 1].stop < raw.length) {
            tx = raw.substr(conceptArray[len - 1].stop + 1, raw.length).trim();
            finalHtml.push(`<span>${tx}</span>`);
        }
        // console.log(conceptArray);

        const html = 
        `<div class='row post-wrapper'>
            <div class='post col-md-4'>
                <div class='post-body'>${finalHtml.join('')}</div>
                <div class='post-num'><span>${i + 1}<span></div>
                <div class='author'><span>${authorName}</span></div>
            </div>
            <div class='user user-1 col-md-4 mh-100'> 
                <input class='select-code' type='text' />
            </div>
            <div class='user user-2 col-md-4 mh-100'> 
                <input class='select-code' type='text' />
            </div>
        </div>`;
        display.push(html);
    }
    $('#metamap-output').append(display);

    // Add the codes metamap extracted and alpha sort
    codeSet.forEach(x => codeArr.push({ value: x, name: x }));
    return codeArr;
}

const initializeUi = (sortedCodes) => {

    // Initialize the input taggers
    $('.user-1 .select-code').each((i, x) => {
        const $x = $(x);
        $x.selectize({
            options: sortedCodes,
            delimiter: ',',
            labelField: 'name',
            placeholder: 'Choose codes',
            plugins: ['remove_button'],
            searchField: ['name'],
            items: getUserCodes(1, i),
            create: (input) => toObject(input),
            onItemAdd: () => calculateKappa(),
            onItemRemove: () => calculateKappa()
        });
    })

    $('.user-2 .select-code').each((i, x) => {
        const $x = $(x);
        $x.selectize({
            options: sortedCodes,
            delimiter: ',',
            labelField: 'name',
            placeholder: 'Choose codes',
            plugins: ['remove_button'],
            searchField: ['name'],
            items: getUserCodes(2, i),
            create: (input) => toObject(input),
            onItemAdd: () => calculateKappa(),
            onItemRemove: () => calculateKappa()
        });
    });

    // Toggle metamap result highlighting on click
    $('#show-results-metamap').change(function() {
        toggleShown('.post', this.checked);
    });

    // Toggle results for user 1
    $('#show-results-user-1').change(function() {
        toggleShown('.user-1 .select-code', this.checked);
    });

    // Toggle results for user 2
    $('#show-results-user-2').change(function() {
        toggleShown('.user-2 .select-code', this.checked);
    });

    // Toggle kappa score shown
    $('#show-kappa-score').change(function() {
        toggleShown('#main', this.checked);
    });

    // Toggle comparison tables shown
    $('#show-comparison-tables').change(function() {
        toggleShown('#metamap-output', this.checked);
    });

    // Uncheck metamap results show
    $('#show-results-metamap')
        .prop('checked', false)
        .trigger('change');

    // Check user results shown
    $('#show-results-user-1,#show-results-user-2')
        .prop('checked', true)
        .trigger('change');

    // Hide kappa scores and comparison tables
    $('#show-kappa-score,#show-comparison-tables')
        .prop('checked', false)
        .trigger('change');

    // Results to JSON on click
    $('#get-user-1-json').click(() => displayJson(1));
    $('#get-user-2-json').click(() => displayJson(2));

    // Close JSON button
    $('.close').click(function() {
        const $p = $(this).parent();
        $p.find('.json').remove();
        $p.removeClass('show-result');
    });
}

const selectionsToJson = (userId) => {
    const $elem = $(`.user-${userId}`);
    const vals = [];

    $elem.each((i, x) => {
        const $items = $(x).find('.selectize-input .item');
        const arr = [];
        $items.each((j, v) => arr.push(toObject($(v).data('value'))));
        vals.push(arr);
    });
    return vals;
};

const displayJson = (userId) => {
    const $elem = $(`#user-${userId}-json`);
    const json = JSON.stringify(selectionsToJson(userId));
    const $jsonEl = $(`<div class='json'>${json}</div>`)
    $elem.append($jsonEl).addClass('show-result');
}

const calculateKappa = () => {
    const $posts =$('.post-wrapper');
    const user1Codes = selectionsToJson(1);
    const user2Codes = selectionsToJson(2);
    const mm = { };
    const user1 = { };
    const user2 = { };
    const YES = 2;
    const NO = 1;
    const getClass= x => x === YES ? 'has-data' : '';

    // Remove any previous comparisons
    $('.comparison-table').remove()

    for (let i = 0; i < mmdata.length; i++) {
        const post = mmdata[i];
        const mmConcepts = new Set();
        const codes = new Set();
        const $rows = [];
        for (let j = 0; j < post.entities.length; j++) {
            const entity = post.entities[j];
            for (let k = 0; k < entity.evSet.length; k++) {
                const concept = entity.evSet[k].text;
                codes.add(concept);
                mmConcepts.add(concept);
            }
        }
        user1Codes[i].forEach(x => codes.add(x.value));
        user2Codes[i].forEach(x => codes.add(x.value));
        sorted = Array.from(codes).sort();
        sorted.forEach((a) => {
            const prop = `${i}_${a}`
            mm[prop] = mmConcepts.has(a) ? YES : NO;
            user1[prop] = user1Codes[i].find(x => x.value === a) ? YES : NO;
            user2[prop] = user2Codes[i].find(x => x.value === a) ? YES : NO;

            // Create DOM table
            const $row = 
            `<div class='row'>
                <div class='col-md-3'>${a}</div>
                <div class='col-md-3 ${getClass(mm[prop])}'></div>
                <div class='col-md-3 ${getClass(user1[prop])}'></div>
                <div class='col-md-3 ${getClass(user2[prop])}'></div>
            </div>`;
            $rows.push($row);
        });
        const $table = $(
            `<div class='comparison-table container-fluid'>
                <div class='row'>
                    <div class='col-md-3 col-header'></div>
                    <div class='col-md-3 col-header'>MetaMap</div>
                    <div class='col-md-3 col-header'>Coder 1</div>
                    <div class='col-md-3 col-header'>Coder 2</div>
                </div>
                ${$rows.join('')}
            </div>`);
        $($posts[i]).after($table);
    }

    const usersScore = Cohen.prototype.kappa(user1, user2, 2, 'none');
    const mmAndUser1 = Cohen.prototype.kappa(mm, user1, 2, 'none');
    const mmAndUser2 = Cohen.prototype.kappa(mm, user2, 2, 'none');
    const $top = $('.top-header-row');

    $('#kappa-score-wrapper').remove();
    $top.after(
        `<div id='kappa-score-wrapper'>
            <div class='row'>
                <span>Cohen's Kappa scores</span>
            </div>
            <div class='row'>
                <div class='col-md-6'>MetaMap alignment to Coder 1</div>
                <div class='col-md-6 kappa-score'>${mmAndUser1}</div>
            </div>
            <div class='row'>
                <div class='col-md-6'>MetaMap alignment to Coder 2</div>
                <div class='col-md-6 kappa-score'>${mmAndUser2}</div>
            </div>
            <div class='row'>
                <div class='col-md-6'>Coders 1 and 2 alignment</div>
                <div class='col-md-6 kappa-score'>${usersScore}</div>
            </div>
        </div>
        `);
};

const getUserCodes = (userId, index) => {
    if (userId === 1 && index <= user1Codes.length - 1) return user1Codes[index].map(x => x.value);
    if (userId === 2 && index <= user2Codes.length - 1) return user2Codes[index].map(x => x.value);
    return null;
}

const toggleShown = (selector, checked) => {
    const $obj = $(selector);
    if (checked) $obj.addClass('show-result');
    else $obj.removeClass('show-result');
}

const toObject = (input) => ({ name: input, value: input});