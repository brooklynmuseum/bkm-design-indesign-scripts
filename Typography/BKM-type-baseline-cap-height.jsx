// Get the active InDesign document
var doc = app.activeDocument;

// Loop through all text frames in the document
for (var i = 0; i < doc.textFrames.length; i++) {
    var textFrame = doc.textFrames[i];
    
    // Access Text Frame Options > Baseline Options > First Baseline Offset and set to Cap Height
    textFrame.textFramePreferences.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;
}
