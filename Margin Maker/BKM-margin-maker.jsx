function main() {
    // Set up the UI dialog with ScriptUI
    var dialog = new Window('dialog', 'BKM Layout Options');
    dialog.orientation = 'column';
    dialog.alignChildren = ['fill', 'top'];
  
    // Array of all layout options
    var layoutOptions = [
        { name: 'Single Line - Half Dot', key: 'single_line_half_dot' },
        { name: 'Single Line - Full Dot', key: 'single_line_full_dot' },
        { name: 'Stacked - Half Dot', key: 'stacked_half_dot' },
        { name: 'Stacked - Full Dot', key: 'stacked_full_dot' }
    ];
  
    // Add dropdown menu with layout options
    var optionNames = [];
    for (var i = 0; i < layoutOptions.length; i++) {
        optionNames.push(layoutOptions[i].name);
    }
    var dropdown = dialog.add('dropdownlist', undefined, optionNames);
    dropdown.selection = 0; // Set default selection
  
    // Add OK and Cancel buttons
    var buttonGroup = dialog.add('group');
    buttonGroup.alignment = 'right';
    var cancelButton = buttonGroup.add('button', undefined, 'Cancel', { name: 'cancel' });
    var okButton = buttonGroup.add('button', undefined, 'OK', { name: 'ok' });
  
    // Show the dialog and get user input
    if (dialog.show() == 1) {
        // Run the selected option
        var selectedOption = layoutOptions[dropdown.selection.index];
        BKM_margins(selectedOption.key);
    }
  }
  
  function BKM_margins(option) {
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
  
    // Get the page dimensions
    var pageWidth = page.bounds[3] - page.bounds[1];
    var pageHeight = page.bounds[2] - page.bounds[0];
  
    var desiredLogoRatio, leftGuideRatio, logoWidthAt100pt;
    if (option === 'stacked_half_dot') {
        desiredLogoRatio = 0.9283875;
        leftGuideRatio = 0.1163;
        logoWidthAt100pt = 13.325 * 72; // Width of the logo at 100pt in points
    } else if (option === 'single_line_full_dot') {
        desiredLogoRatio = 0.85; // Example ratio for full dot
        leftGuideRatio = 0.1;    // Example guide position for full dot
        logoWidthAt100pt = 13.325 * 72;
    } else if (option === 'stacked_full_dot') {
        desiredLogoRatio = 0.886888;
        leftGuideRatio = 0.18368;
        logoWidthAt100pt = 8.0611 * 72; // Width of the logo at 100pt in points
    } else if (option === 'single_line_half_dot') {
        desiredLogoRatio = 0.85; // Example ratio for half dot
        leftGuideRatio = 0.1;    // Example guide position for half dot
        logoWidthAt100pt = 13.325 * 72;
    }
  
    // Calculate the desired logo width and margins based on the page size
    var desiredLogoWidth = pageWidth * desiredLogoRatio;
    var marginSize = (pageWidth - desiredLogoWidth) / 2;
  
    // Calculate the correct point size based on the logo width at 100pt
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
        columnGutter = marginSize / 2;
    }
  
    // Add basic guides
    var addGuide = function (location, orientation) {
        page.guides.add(undefined, { location: location, orientation: orientation });
    };
    addGuide(marginSize / 2, HorizontalOrVertical.VERTICAL);
    addGuide(pageWidth - marginSize / 2, HorizontalOrVertical.VERTICAL);
    addGuide(marginSize / 2, HorizontalOrVertical.HORIZONTAL);
    addGuide(pageHeight - marginSize / 2, HorizontalOrVertical.HORIZONTAL);
  
    // Set interior guides based on the selected option
    var leftGuidePosition = pageWidth * leftGuideRatio;
    var rightGuidePosition = pageWidth - leftGuidePosition;
  
    addGuide(leftGuidePosition, HorizontalOrVertical.VERTICAL);
    addGuide(rightGuidePosition, HorizontalOrVertical.VERTICAL);
  
    // Determine the appropriate Unicode character
    var unicodeChar = "\uE003";
    if (option === 'stacked_half_dot' || option === 'stacked_full_dot') {
        unicodeChar = "\uE004";
    }
  
    // Create text box with the appropriate Unicode character
    var textBox = page.textFrames.add(textLayer, undefined, undefined, {
        geometricBounds: [
            marginSize,
            marginSize / 2,
            marginSize + (pageHeight - marginSize * 2) / 2,
            pageWidth - marginSize / 2
        ],
        contents: unicodeChar + "\nLOREM\nIPSUM"
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
    var smallCircleSize = marginSize / 2;
    var mediumCircleSize = marginSize;
    var largeCircleSize = marginSize * 2;
  
    var addCircle = function (size, yOffset) {
        page.ovals.add({
            itemLayer: spacersLayer,
            geometricBounds: [
                bottomY - yOffset - size,
                centerX - size / 2,
                bottomY - yOffset,
                centerX + size / 2
            ],
            fillColor: doc.swatches.item("Black"),
            transparencySettings: { blendMode: BlendMode.NORMAL, opacity: 50 },
            strokeWeight: 0,
            strokeColor: doc.swatches.item("None") // Ensure no stroke is applied
        });
    };
  
    // Adjusted stacking for the snowman effect
    addCircle(largeCircleSize, 0); // Large circle at the bottom
    addCircle(mediumCircleSize, largeCircleSize); // Medium circle above the large circle
    addCircle(smallCircleSize, largeCircleSize + mediumCircleSize); // Small circle above the medium circle
  
    // Restore the original measurement units
    app.scriptPreferences.measurementUnit = originalUnits;
  }
  
  // Run the main function
  main();
  