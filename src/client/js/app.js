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
calculateKappa();

