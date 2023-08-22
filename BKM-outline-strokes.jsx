if (app.documents.length > 0) {
    var doc = app.activeDocument;

    // Function to outline strokes for a collection of page items
    function outlineStrokes(pageItemCollection) {
        for (var j = 0; j < pageItemCollection.length; j++) {
            var item = pageItemCollection[j];
            if (item.strokeWeight > 0) {  // Check if the item has a stroke
                item.convertStrokeToFill();
            }
        }
    }

    // Outline strokes in document pages
    for (var i = 0; i < doc.pages.length; i++) {
        outlineStrokes(doc.pages[i].allPageItems);
    }

    // Outline strokes in master pages
    for (var k = 0; k < doc.masterSpreads.length; k++) {
        var masterSpread = doc.masterSpreads[k];
        for (var m = 0; m < masterSpread.pages.length; m++) {
            outlineStrokes(masterSpread.pages[m].allPageItems);
        }
    }

    alert("Strokes converted to outlines successfully!");
} else {
    alert("No active document found. Please open a document and try again.");
}
