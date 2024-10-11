#target indesign

// Get the active document
var doc = app.activeDocument;

// Check if text is selected
if (app.selection.length == 1 && app.selection[0].hasOwnProperty('contents')) {
    var selectedText = app.selection[0];
    var parentFrame = selectedText.parentTextFrames[0];
    var selectedContents = selectedText.contents;

    // Get the original point size of the selected text
    var originalPointSize = selectedText.pointSize;

    // Calculate the new point size (75% of the original)
    var newPointSize = originalPointSize * 0.75;

    // Create a new text frame on the same page
    var page = parentFrame.parentPage;
    var newTextFrame = page.textFrames.add();

    // Set the contents and text properties in the new text frame
    newTextFrame.contents = selectedContents;
    var newText = newTextFrame.texts[0];
    newText.appliedFont = selectedText.appliedFont;
    newText.pointSize = newPointSize; // Apply the scaled-down point size
    newText.leading = selectedText.leading; // Retain the original leading
    newText.fillColor = doc.swatches.item("Paper");

    // Fit the new text frame to its contents
    newTextFrame.fit(FitOptions.FRAME_TO_CONTENT);

    // Get the bounds of the new text frame after fitting
    var textBounds = newTextFrame.geometricBounds;
    var textHeight = textBounds[2] - textBounds[0];

    // Calculate the dimensions of the pill shape (twice the height of the text)
    var pillHeight = textHeight * 2;

    // Create the pill shape (rectangle) behind the text
    var pillShape = page.rectangles.add();
    pillShape.fillColor = doc.swatches.item("Black");
    pillShape.strokeColor = doc.swatches.item("None");
    pillShape.geometricBounds = [
        textBounds[0] - (pillHeight - textHeight) / 2, // Top
        textBounds[1], // Left
        textBounds[2] + (pillHeight - textHeight) / 2, // Bottom
        textBounds[3]  // Right
    ];

    // Ensure the text frame is in front of the rectangle
    newTextFrame.bringToFront();

    // Group the pill shape and the text frame
    var groupItems = [pillShape, newTextFrame];
    var group = page.groups.add(groupItems);

    // Remove the original text from the parent text frame
    selectedText.remove();

    // Insert the group as an anchored object into the original text frame
    var anchoredGroup = group.duplicate();
    anchoredGroup.anchoredObjectSettings.insertAnchoredObject(parentFrame.insertionPoints[selectedText.index], AnchorPosition.INLINE_POSITION);

    // Remove the temporary group on the page
    group.remove();

} else {
    alert("Please select some text within a text frame.");
}
