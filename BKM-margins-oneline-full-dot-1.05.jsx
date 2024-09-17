function BKM_margins_stacked_half_dot() {
    var doc = app.activeDocument;
    var page = doc.layoutWindows[0].activePage;

    // Ensure the necessary layers exist
    var textLayer = doc.layers.itemByName("Layer 1");
    var marblesLayer = doc.layers.itemByName("Marbles Above the Glass");
    if (!marblesLayer.isValid) {
        marblesLayer = doc.layers.add({ name: "Marbles Above the Glass", printable: false });
    }

    // Get the page dimensions
    var pageWidth = page.bounds[3] - page.bounds[1];
    var pageHeight = page.bounds[2] - page.bounds[0];

    // Desired ratio for the logo width relative to page size
    var desiredLogoRatio = 0.86635; // Adjusted ratio for 20.7924" logo on a 24" page

    // Calculate the desired logo width and margins based on the page size
    var desiredLogoWidth = pageWidth * desiredLogoRatio;
    var marginSize = (pageWidth - desiredLogoWidth) / 2;

    // Calculate the correct point size based on the logo width at 100pt
    var logoWidthAt100pt = 13.325; // Width of the logo at 100pt
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

    // Create text box
    var textBox = page.textFrames.add(textLayer, undefined, undefined, {
        geometricBounds: [marginSize, marginSize, marginSize + (pageHeight - marginSize * 2) / 2, pageWidth - marginSize],
        contents: "LOREM\nIPSUM"
    });

    with (textBox.texts[0]) {
        pointSize = correctPointSize;
        appliedFont = app.fonts.item("BKM\tFacade");
        capitalization = Capitalization.ALL_CAPS;
        leading = correctPointSize * 0.8;
    }

    textBox.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    textBox.textFramePreferences.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;

    // Arrange circles on "Marbles Above the Glass" layer, stacked and aligned with the bottom margin
    var centerX = pageWidth / 2;
    var bottomY = pageHeight - marginSize; // Bottom margin position
    var smallCircleSize = marginSize / 4;
    var mediumCircleSize = marginSize / 2;
    var largeCircleSize = marginSize;

    // Randomly select one of the circles to be gold (1 in 1000 chance)
    var goldenCircleIndex = Math.floor(Math.random() * 1000);
    var fillColor = doc.swatches.item("Black");

    if (goldenCircleIndex <= 2) {
        if (!doc.colors.itemByName("The Golden Marble").isValid) {
            fillColor = doc.colors.add({
                name: "The Golden Marble",
                model: ColorModel.PROCESS,
                space: ColorSpace.CMYK,
                colorValue: [0, 14, 72, 17]
            });
        } else {
            fillColor = doc.colors.itemByName("The Golden Marble");
        }
    }

    var addCircle = function (size, yOffset) {
        page.ovals.add({
            itemLayer: marblesLayer,
            geometricBounds: [bottomY - yOffset - size, centerX - size / 2, bottomY - yOffset, centerX + size / 2],
            fillColor: fillColor,
            transparencySettings: { blendMode: BlendMode.NORMAL, opacity: 50 },
            strokeWeight: 0
        });
    };

    // Adjusted stacking for the snowman effect
    addCircle(largeCircleSize, 0);  // Large circle at the bottom
    addCircle(mediumCircleSize, largeCircleSize); // Medium circle above the large circle
    addCircle(smallCircleSize, largeCircleSize + mediumCircleSize); // Small circle above the medium circle
}

// Run the function
BKM_margins_stacked_half_dot();
