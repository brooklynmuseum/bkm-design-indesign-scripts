if (app.documents.length > 0) {
    var doc = app.activeDocument;

    // Function to convert text frames to outlines
    function convertTextFramesToOutlines(pageItemCollection) {
        for (var j = 0; j < pageItemCollection.length; j++) {
            var item = pageItemCollection[j];
            if (item instanceof TextFrame) {
                item.createOutlines();
            }
        }
    }

    // Convert text in document pages
    for (var i = 0; i < doc.pages.length; i++) {
        convertTextFramesToOutlines(doc.pages[i].textFrames);
    }

    // Convert text in master pages
    for (var k = 0; k < doc.masterSpreads.length; k++) {
        var masterSpread = doc.masterSpreads[k];
        for (var m = 0; m < masterSpread.pages.length; m++) {
            convertTextFramesToOutlines(masterSpread.pages[m].textFrames);
        }
    }

    alert("Text converted to outlines successfully!");
} else {
    alert("No active document found. Please open a document and try again.");
}
