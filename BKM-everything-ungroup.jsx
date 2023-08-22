#target indesign

var doc = app.activeDocument;

function ungroupItems(item) {
    if(item.constructor.name === "Group") {
        try {
            // try to ungroup, if it fails, it might be a group inside a group
            item.ungroup();
        } catch (e) {
            // in case of nested groups
            for(var i = 0; i < item.pageItems.length; i++) {
                ungroupItems(item.pageItems[i]);
            }
        }
    }
}

for(var i = 0; i < doc.pages.length; i++) {
    var page = doc.pages[i];
    for(var j = page.allPageItems.length-1; j >= 0 ; j--) {
        ungroupItems(page.allPageItems[j]);
    }
}

for(var i = 0; i < doc.masterSpreads.length; i++) {
    var masterSpread = doc.masterSpreads[i];
    for(var j = masterSpread.allPageItems.length-1; j >= 0 ; j--) {
        ungroupItems(masterSpread.allPageItems[j]);
    }
}
