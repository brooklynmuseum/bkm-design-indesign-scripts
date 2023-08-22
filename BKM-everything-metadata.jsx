if (app.documents.length !== 0) {
    var doc = app.activeDocument;
    var meta = doc.metadataPreferences;
    var info = [];

    // Name of the document
    info.push("Document Name: " + doc.name);

    // Number of pages
    info.push("Number of Pages: " + doc.pages.length);

    // Document's creation date
    if (meta.documentCreationDate) {
        info.push("Creation Date: " + meta.documentCreationDate);
    }

    // Document's modification date
    if (meta.documentModificationDate) {
        info.push("Modification Date: " + meta.documentModificationDate);
    }

    // Author of the document
    if (meta.author) {
        info.push("Author: " + meta.author);
    }

    // Fonts used in the document
    var usedFonts = doc.fonts.everyItem().name;
    if (usedFonts.length > 0) {
        info.push("Fonts Used:");
        for (var i = 0; i < usedFonts.length; i++) {
            info.push(" - " + usedFonts[i]);
        }
    }

    // Colors used in the document
    var usedColors = [];
    for (var j = 0; j < doc.colors.length; j++) {
        var color = doc.colors[j];
        if (color.space === ColorSpace.RGB) {
            usedColors.push(`RGB(${color.colorValue[0]}, ${color.colorValue[1]}, ${color.colorValue[2]})`);
        } else if (color.space === ColorSpace.CMYK) {
            usedColors.push(`CMYK(${color.colorValue[0]}%, ${color.colorValue[1]}%, ${color.colorValue[2]}%, ${color.colorValue[3]}%)`);
        }
        // You can add more color spaces if needed...
    }

    if (usedColors.length > 0) {
        info.push("Colors Used:");
        for (var k = 0; k < usedColors.length; k++) {
            info.push(" - " + usedColors[k]);
        }
    }

    // Create a text frame on the active page
    var activePage = doc.layoutWindows[0].activePage || doc.pages[0];
    var textFrame = activePage.textFrames.add({
        geometricBounds: [50, 50, 250, 250], // [y1, x1, y2, x2] - Modify as needed
        contents: info.join("\n")
    });

    // Optionally, fit the frame to the content
    textFrame.fit(FitOptions.FRAME_TO_CONTENT);

} else {
    alert("No active document found. Please open a document and try again.");
}
