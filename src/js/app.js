const mmcol = $('#metamap-output');
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
    // console.log(post.text);

    const html = 
    `<div class='post'>
        <div class='post-body'>${finalHtml.join('')}</div>
        <div class='post-num'><span>${i + 1}<span></div>
        <div class='author'><span>${authorName}</span></div>
    </div>`;
    display.push(html);
}
mmcol.append(display);