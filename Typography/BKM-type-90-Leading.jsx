// Define the function to set leading to 80% of the font size and first baseline offset to cap height
function setLeadingAndBaseline() {
    var doc = app.activeDocument;
    var selection = app.selection;

    if (selection.length > 0 && selection[0].constructor.name == "TextFrame") {
        var textFrame = selection[0];
        var paragraphs = textFrame.paragraphs;

        for (var i = 0; i < paragraphs.length; i++) {
            var fontSize = paragraphs[i].pointSize;
            var newLeading = fontSize * 0.9;
            paragraphs[i].leading = newLeading;
        }

        // Set the first baseline offset to Cap Height
        textFrame.textFramePreferences.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;
    } else {
        alert("Please select a text frame.");
    }
}

// Run the function
setLeadingAndBaseline();
