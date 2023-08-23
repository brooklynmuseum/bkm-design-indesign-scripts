(function() {
    // Ensure an InDesign document is open
    if (app.documents.length === 0) {
        alert("Please open a document and try again.");
        return;
    }

    // Reference to the active document
    var doc = app.activeDocument;

    // Determine the output folder
    var outputFolder = Folder.selectDialog("Choose a folder where PNGs should be saved");
    if (!outputFolder) return; // User canceled

    // The resolution at which we're exporting
    var dpi = 72; // You can adjust this if needed

    // Loop through every page in the document
    for (var i = 0; i < doc.pages.length; i++) {
        var page = doc.pages[i];

        // Set which page to export
        app.pngExportPreferences.pageRange = (i + 1).toString();

        // Set PNG export preferences
        app.pngExportPreferences.pngQuality = PNGQualityEnum.HIGH;
        app.pngExportPreferences.exportResolution = dpi;
        app.pngExportPreferences.transparentBackground = false;

        // Calculate dimensions in pixels
        var widthInPoints = page.bounds[3] - page.bounds[1];
        var heightInPoints = page.bounds[2] - page.bounds[0];
        var width = Math.round((widthInPoints / 72) * dpi); // Convert from points to inches and then multiply by DPI to get pixels
        var height = Math.round((heightInPoints / 72) * dpi);

        // Define the new filename based on dimensions
        var newFileName = doc.name.replace(/\.[^\.]+$/, '') + "_" + (i + 1) + "_" + width + "x" + height + "px.png";
        var newFile = File(outputFolder + "/" + newFileName);

        // Export the PNG
        doc.exportFile(ExportFormat.PNG_FORMAT, newFile);

        // Clear preferences for next run
        app.pngExportPreferences.properties = {};
    }

    // Notify the user
    alert("Pages exported successfully!");
})();
