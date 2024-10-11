function BKM_margins_stacked_half_dot() {
    var doc = app.activeDocument;
    var page = doc.layoutWindows[0].activePage;

    // Save the original measurement units and set to points
    var originalUnits = app.scriptPreferences.measurementUnit;
    app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

    // Ensure the necessary layers exist
    var textLayer = doc.layers.itemByName("Layer 1");
    var spacersLayer = doc.layers.itemByName("Spacers");
    if (!spacersLayer.isValid) {
        spacersLayer = doc.layers.add({ name: "Spacers", printable: false });
    }

    // Get the page dimensions in points
    var pageWidth = page.bounds[3] - page.bounds[1];
    var pageHeight = page.bounds[2] - page.bounds[0];

    // Desired ratio for the logo width relative to page size
    var desiredLogoRatio = 0.86635; // Adjusted ratio

    // Calculate the desired logo width and margins based on the page size
    var desiredLogoWidth = pageWidth * desiredLogoRatio;
    var marginSize = (pageWidth - desiredLogoWidth) / 2;

    // Calculate the correct point size based on the logo width at 100pt
    var logoWidthAt100pt = 13.325 * 72; // Width of the logo at 100pt in points
    var correctPointSize = (desiredLogoWidth / logoWidthAt100pt) * 100;

    if (correctPointSize > 1296) {
        correctPointSize = 1296;
        alert("Point size exceeds InDesign's maximum limit of 1296 pt. Adjusting to the maximum allowed size.");
    }

    // Delete any existing guides on the current page
    page.guides.everyItem().remove();

    // Set margins and column grid
    with (page.marginPreferences) {
        top = marginSize;
        bottom = marginSize;
        left = marginSize;
        right = marginSize;
        columnCount = 2;
        columnGutter = marginSize / 4;
    }

    // Add basic guides
    var addGuide = function (location, orientation) {
        page.guides.add(undefined, { location: location, orientation: orientation });
    };
    addGuide(marginSize / 2, HorizontalOrVertical.VERTICAL);
    addGuide(pageWidth - marginSize / 2, HorizontalOrVertical.VERTICAL);
    addGuide(marginSize / 2, HorizontalOrVertical.HORIZONTAL);
    addGuide(pageHeight - marginSize / 2, HorizontalOrVertical.HORIZONTAL);

    // Set interior guides at 18.38% of the page width from the left and right
    var leftGuidePosition = pageWidth * 0.14199583333333335;
    var rightGuidePosition = pageWidth - (pageWidth * 0.14199583333333335);

    addGuide(leftGuidePosition, HorizontalOrVertical.VERTICAL);
    addGuide(rightGuidePosition, HorizontalOrVertical.VERTICAL);

    // Create text box with Unicode character "E003" before the text and a line break after it
    var textBox = page.textFrames.add(textLayer, undefined, undefined, {
        geometricBounds: [
            marginSize,
            marginSize / 2,
            marginSize + (pageHeight - marginSize * 2) / 2,
            pageWidth - marginSize / 2
        ],
        contents: "\uE003\nLOREM\nIPSUM"
    });

    with (textBox.texts[0]) {
        pointSize = correctPointSize;
        appliedFont = app.fonts.item("BKM Facade\tRegular");
        capitalization = Capitalization.ALL_CAPS;
        leading = correctPointSize * 0.8;
    }

    textBox.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    textBox.textFramePreferences.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;

    // Arrange circles on "Spacers" layer, stacked and aligned with the bottom margin
    var centerX = pageWidth / 2;
    var bottomY = pageHeight - marginSize; // Bottom margin position
    var smallCircleSize = marginSize / 4;
    var mediumCircleSize = marginSize / 2;
    var largeCircleSize = marginSize;

    var addCircle = function (size, yOffset) {
        page.ovals.add({
            itemLayer: spacersLayer,
            geometricBounds: [bottomY - yOffset - size, centerX - size / 2, bottomY - yOffset, centerX + size / 2],
            fillColor: doc.swatches.item("Black"),
            transparencySettings: { blendMode: BlendMode.NORMAL, opacity: 50 },
            strokeWeight: 0,
            strokeColor: doc.swatches.item("None") // Ensure no stroke is applied
        });
    };

    // Adjusted stacking for the snowman effect
    addCircle(largeCircleSize, 0);  // Large circle at the bottom
    addCircle(mediumCircleSize, largeCircleSize); // Medium circle above the large circle
    addCircle(smallCircleSize, largeCircleSize + mediumCircleSize); // Small circle above the medium circle

    // Restore the original measurement units
    app.scriptPreferences.measurementUnit = originalUnits;
}

// Run the function
BKM_margins_stacked_half_dot();
