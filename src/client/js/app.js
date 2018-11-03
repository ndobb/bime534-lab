// Add posts and metamap results
const codes = addMetaMapData();

// Aggregate user codes and metamap codes
const allCodes = [ ...new Set([ 
    ...codes, 
    ...user1Codes.flat(), 
    ...user2Codes.flat(), 
    ...customCodes.flat()
    ])].sort((a, b) => {
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
    });

// Set initial UI state
initializeUi(allCodes);

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

