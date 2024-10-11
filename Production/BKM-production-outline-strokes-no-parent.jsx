if (app.documents.length > 0) {
    var doc = app.activeDocument;

    // Function to ungroup items
    function ungroupItems(pageItemCollection) {
        for (var j = pageItemCollection.length - 1; j >= 0; j--) {
            var item = pageItemCollection[j];
            if (item.constructor.name === "Group") {
                item.ungroup();
            }
        }
    }

    // Function to convert text frames to outlines
    function convertTextFramesToOutlines(pageItemCollection) {
        for (var j = 0; j < pageItemCollection.length; j++) {
            var item = pageItemCollection[j];
            if (item instanceof TextFrame) {
                item.createOutlines();
            }
        }
    }


    // Process for document pages
    for (var i = 0; i < doc.pages.length; i++) {
        var page = doc.pages[i];
        ungroupItems(page.allPageItems);
        convertTextFramesToOutlines(page.textFrames);
    }

    
    alert("Outline Achieved!");
} else {
    alert("No document found. Please open a document and try again.");
}
