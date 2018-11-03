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
            create: (input) => toObject(input)
        });
    });

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
            create: (input) => toObject(input)
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

    // Uncheck metamap results show
    $('#show-results-metamap')
        .prop('checked', false)
        .trigger('change');

    // Check user results shown
    $('#show-results-user-1,#show-results-user-2')
        .prop('checked', true)
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