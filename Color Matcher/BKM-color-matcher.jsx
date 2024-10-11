// Check if a document is open
if (app.documents.length > 0) {
    var doc = app.activeDocument;

    // Load Benjamin Moore colors JSON file
    var jsonFilePath = File($.fileName).path + "/benjamin-moore.json";
    var jsonFile = new File(jsonFilePath);
    var benjaminMooreColors = [];

    if (jsonFile.exists) {
        jsonFile.open('r');
        var jsonContent = jsonFile.read();
        jsonFile.close();
        // Use eval to parse JSON content
        benjaminMooreColors = eval('(' + jsonContent + ')');
    } else {
        alert("Benjamin Moore colors JSON file not found at: " + jsonFilePath);
    }

    // Variable to store selected Benjamin Moore color name
    var selectedColorName = "";

    // Create a custom dialog
    var dialog = new Window("dialog", "Museum Color Matcher");

    // Add a group for the color visualizer
    var visualizerGroup = dialog.add("group");
    var colorVisualizer = visualizerGroup.add("panel", undefined, "");
    colorVisualizer.size = [100, 100]; // Visualizer size (a square)

    // Add a group for CMYK input fields (in a row) at the top
    var cmykInputGroup = dialog.add("group");
    cmykInputGroup.orientation = "row";

    // Function to add CMYK input fields
    function addCMYKInput(labelText) {
        cmykInputGroup.add("statictext", undefined, labelText + ":");
        var input = cmykInputGroup.add("edittext", undefined, "0");
        input.characters = 3;
        input.maxcharacters = 3;
        return input;
    }

    var cInput = addCMYKInput("C");
    var mInput = addCMYKInput("M");
    var yInput = addCMYKInput("Y");
    var kInput = addCMYKInput("K");

    // Function to update the visualizer color based on CMYK values
    function updateVisualizer() {
        var c = Math.min(100, Math.max(0, parseFloat(cInput.text) || 0));
        var m = Math.min(100, Math.max(0, parseFloat(mInput.text) || 0));
        var y = Math.min(100, Math.max(0, parseFloat(yInput.text) || 0));
        var k = Math.min(100, Math.max(0, parseFloat(kInput.text) || 0));

        // Ensure values are between 0 and 100
        cInput.text = c;
        mInput.text = m;
        yInput.text = y;
        kInput.text = k;

        // Convert CMYK to RGB for visualizing color in the panel
        var rgb = cmykToRgb(c, m, y, k);

        // Update the background color of the visualizer panel
        colorVisualizer.graphics.backgroundColor = colorVisualizer.graphics.newBrush(
            colorVisualizer.graphics.BrushType.SOLID_COLOR,
            [rgb.r / 255, rgb.g / 255, rgb.b / 255, 1] // Normalize RGB to 0-1 range for display
        );
    }

    // CMYK to RGB conversion function
    function cmykToRgb(c, m, y, k) {
        var r = 255 * (1 - c / 100) * (1 - k / 100);
        var g = 255 * (1 - m / 100) * (1 - k / 100);
        var b = 255 * (1 - y / 100) * (1 - k / 100);
        return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
    }

    // RGB to CMYK conversion function
    function rgbToCmyk(r, g, b) {
        var computedC = 0;
        var computedM = 0;
        var computedY = 0;
        var computedK = 0;

        // BLACK
        if (r === 0 && g === 0 && b === 0) {
            computedK = 100;
            return { c: 0, m: 0, y: 0, k: 100 };
        }

        computedC = 1 - (r / 255);
        computedM = 1 - (g / 255);
        computedY = 1 - (b / 255);

        var minCMY = Math.min(computedC, Math.min(computedM, computedY));
        computedC = ((computedC - minCMY) / (1 - minCMY)) * 100;
        computedM = ((computedM - minCMY) / (1 - minCMY)) * 100;
        computedY = ((computedY - minCMY) / (1 - minCMY)) * 100;
        computedK = minCMY * 100;

        return { c: computedC, m: computedM, y: computedY, k: computedK };
    }

    // Hex to RGB conversion function
    function hexToRgb(hex) {
        // Remove '#' if present
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex.split('').map(function (hex) {
                return hex + hex;
            }).join('');
        }
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;
        return { r: r, g: g, b: b };
    }

    // Update visualizer whenever CMYK inputs change
    cInput.onChanging = updateVisualizer;
    mInput.onChanging = updateVisualizer;
    yInput.onChanging = updateVisualizer;
    kInput.onChanging = updateVisualizer;

    // Initial update of the visualizer
    updateVisualizer();

    // Add a group for the search functionality
    var searchGroup = dialog.add("group");
    searchGroup.orientation = "column";
    searchGroup.alignChildren = ["fill", "top"];

    // Add search label and input field
    searchGroup.add("statictext", undefined, "Search Benjamin Moore Colors:");
    var searchInput = searchGroup.add("edittext", undefined, "");
    searchInput.characters = 20;

    // Add listbox to display search results
    var searchResultsList = searchGroup.add("listbox", [0, 0, 300, 100], [], { multiselect: false });

    // Live search functionality
    searchInput.onChanging = function () {
        var query = searchInput.text.toLowerCase();
        searchResultsList.removeAll();
        if (query.length > 0) {
            for (var i = 0; i < benjaminMooreColors.length; i++) {
                var color = benjaminMooreColors[i];
                if (
                    color.name.toLowerCase().indexOf(query) !== -1 ||
                    color.label.toLowerCase().indexOf(query) !== -1
                ) {
                    var listItem = searchResultsList.add("item", color.name + " (" + color.label + ")");
                    listItem.colorData = color;
                }
            }
        }
    };

    // When a color is selected from the search results
    searchResultsList.onChange = function () {
        if (searchResultsList.selection) {
            var color = searchResultsList.selection.colorData;
            // Store the selected Benjamin Moore color name and label
            selectedColorName = color.name + " (" + color.label + ")";
            // Convert hex to RGB
            var rgb = hexToRgb(color.hex);
            // Convert RGB to CMYK
            var cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
            // Update CMYK input fields
            cInput.text = Math.round(cmyk.c);
            mInput.text = Math.round(cmyk.m);
            yInput.text = Math.round(cmyk.y);
            kInput.text = Math.round(cmyk.k);
            // Update the visualizer
            updateVisualizer();
        }
    };

    // Add dropdown for number of variations with multiples of 8 from 8 to 72
    dialog.add("statictext", undefined, "Number of color variations (multiples of 8):");
    var variationsDropdown = dialog.add("dropdownlist", undefined, [
        "8",
        "16",
        "24",
        "32",
        "40",
        "48",
        "56",
        "64",
        "72",
    ]);
    variationsDropdown.selection = 0; // Set default to 8

    // Add the "First Pass" checkbox
    var firstPassCheckbox = dialog.add("checkbox", undefined, "First Pass");
    firstPassCheckbox.value = false; // Default to unchecked

    // Add CMYK checkboxes with respective dropdowns in a list, with individual fine adjustment sliders
    var adjustGroup = dialog.add("group");
    adjustGroup.orientation = "column";
    adjustGroup.alignChildren = "left";

    // Function to add color adjustment row with color square
    function addColorAdjustmentRow(label) {
        var row = adjustGroup.add("group");
        row.orientation = "row";
        row.alignChildren = ["left", "center"];

        // Left-align the "Adjust..." text
        var labelText = row.add("statictext", undefined, label);
        labelText.alignment = "left"; // Ensure left alignment

        // Add color square panel
        var colorPanel = row.add("panel", undefined, "");
        colorPanel.size = [20, 20]; // Small square
        colorPanel.margins = 0;

        // Set color based on label
        var c = 0,
            m = 0,
            y = 0,
            k = 0;

        switch (label) {
            case "Adjust C":
                c = 100;
                break;
            case "Adjust M":
                m = 100;
                break;
            case "Adjust Y":
                y = 100;
                break;
            case "Adjust K":
                k = 100;
                break;
        }

        var rgb = cmykToRgb(c, m, y, k);

        // Set background color of the panel
        colorPanel.graphics.backgroundColor = colorPanel.graphics.newBrush(
            colorPanel.graphics.BrushType.SOLID_COLOR,
            [rgb.r / 255, rgb.g / 255, rgb.b / 255, 1]
        );

        var adjustCheckbox = row.add("checkbox");
        var actionDropdown = row.add("dropdownlist", undefined, ["None", "Increase", "Decrease"]);
        actionDropdown.selection = 0; // Set default to "None"

        // Fine adjustment slider for each CMYK color
        var slider = row.add("slider", undefined, 1, 1, 10);
        slider.preferredSize.width = 100;
        var sliderValueLabel = row.add("statictext", undefined, "1"); // Add value indicator

        slider.onChanging = function () {
            sliderValueLabel.text = Math.round(slider.value); // Update value display
        };

        // Automatically check the checkbox when "Increase" or "Decrease" is selected
        actionDropdown.onChange = function () {
            if (actionDropdown.selection && actionDropdown.selection.text !== "None") {
                adjustCheckbox.value = true;
            }
        };

        return { checkbox: adjustCheckbox, dropdown: actionDropdown, slider: slider, rowGroup: row };
    }

    var cAdjustments = addColorAdjustmentRow("Adjust C");
    var mAdjustments = addColorAdjustmentRow("Adjust M");
    var yAdjustments = addColorAdjustmentRow("Adjust Y");
    var kAdjustments = addColorAdjustmentRow("Adjust K");

    // Align the sliders to the right of the prompt box
    adjustGroup.alignChildren = ["right", "center"];

    // Function to enable or disable controls based on the First Pass checkbox
    function updateControls() {
        var isFirstPass = firstPassCheckbox.value;

        // Disable or enable the variations dropdown
        variationsDropdown.enabled = !isFirstPass;

        // Disable or enable the CMYK adjustment controls
        var adjustmentControls = [
            cAdjustments,
            mAdjustments,
            yAdjustments,
            kAdjustments,
        ];

        for (var i = 0; i < adjustmentControls.length; i++) {
            var adj = adjustmentControls[i];
            adj.checkbox.enabled = !isFirstPass;
            adj.dropdown.enabled = !isFirstPass;
            adj.slider.enabled = !isFirstPass;
        }
    }

    // Initial call to set controls correctly
    updateControls();

    // Add event listener to the First Pass checkbox
    firstPassCheckbox.onClick = function () {
        updateControls();
    };

    // Add Cancel and OK buttons (switched order)
    var buttons = dialog.add("group");
    buttons.orientation = "row";
    buttons.alignment = "right";
    var cancelButton = buttons.add("button", undefined, "Cancel");
    var okButton = buttons.add("button", undefined, "OK");

    // Show the dialog and get user input
    if (dialog.show() == 1) {
        var variations = parseInt(variationsDropdown.selection.text, 10); // Get the dropdown value
        var c = parseFloat(cInput.text);
        var m = parseFloat(mInput.text);
        var y = parseFloat(yInput.text);
        var k = parseFloat(kInput.text);

        if (!isNaN(c) && !isNaN(m) && !isNaN(y) && !isNaN(k)) {
            if (c >= 0 && c <= 100 && m >= 0 && m <= 100 && y >= 0 && y <= 100 && k >= 0 && k <= 100) {

                var squareSize = 1.5; // Size of the squares
                var margin = 0.5; // Page margin
                var gap = 0; // No gap between squares
                var squaresPerRow = 8; // Maximum squares in one row
                var rowGap = 0; // Gap between rows
                var labelHeight = 1.0; // Adjust label height as needed

                if (firstPassCheckbox.value) {
                    // Generate 8 swatches with +/-5 adjustments to CMYK components
                    var adjustmentsArray = [
                        { cAdjust: 0, mAdjust: 0, yAdjust: 0, kAdjust: 0 }, // Original
                        { cAdjust: +5, mAdjust: 0, yAdjust: 0, kAdjust: 0 },
                        { cAdjust: -5, mAdjust: 0, yAdjust: 0, kAdjust: 0 },
                        { cAdjust: 0, mAdjust: +5, yAdjust: 0, kAdjust: 0 },
                        { cAdjust: 0, mAdjust: -5, yAdjust: 0, kAdjust: 0 },
                        { cAdjust: 0, mAdjust: 0, yAdjust: +5, kAdjust: 0 },
                        { cAdjust: 0, mAdjust: 0, yAdjust: -5, kAdjust: 0 },
                        { cAdjust: 0, mAdjust: 0, yAdjust: 0, kAdjust: +5 },
                    ];

                    // Adjust page dimensions
                    var numSwatches = adjustmentsArray.length;
                    var numRows = Math.ceil(numSwatches / squaresPerRow);

                    doc.documentPreferences.properties = {
                        pageWidth: squareSize * squaresPerRow + gap * (squaresPerRow - 1) + margin * 2,
                        pageHeight: numRows * (squareSize + labelHeight + 0.05) + rowGap * (numRows - 1) + margin * 2,
                    };

                    // Start at the page margin for x and y position
                    var xPos = margin;
                    var yPos = margin;

                    for (var i = 0; i < numSwatches; i++) {
                        var adj = adjustmentsArray[i];

                        var newC = c + adj.cAdjust;
                        var newM = m + adj.mAdjust;
                        var newY = y + adj.yAdjust;
                        var newK = k + adj.kAdjust;

                        // Constrain values between 0 and 100
                        newC = Math.max(0, Math.min(100, newC));
                        newM = Math.max(0, Math.min(100, newM));
                        newY = Math.max(0, Math.min(100, newY));
                        newK = Math.max(0, Math.min(100, newK));

                        var colorName = "C" + newC + "_M" + newM + "_Y" + newY + "_K" + newK;

                        try {
                            var fillColor = doc.colors.add({
                                name: colorName,
                                space: ColorSpace.CMYK,
                                colorValue: [newC, newM, newY, newK],
                            });
                        } catch (e) {
                            fillColor = doc.colors.itemByName(colorName);
                        }

                        var square = doc.pages[0].rectangles.add({
                            geometricBounds: [yPos, xPos, yPos + squareSize, xPos + squareSize],
                            fillColor: fillColor,
                            fillTint: 100,
                            strokeWeight: 0, // No stroke
                            strokeColor: doc.swatches.item("None"), // Ensure no stroke color
                        });

                        // Create label for CMYK breakdown and Benjamin Moore name
                        var labelContents =
                            "C:" + newC + " M:" + newM + " Y:" + newY + " K:" + newK;
                        if (selectedColorName && selectedColorName !== "") {
                            labelContents += "\r" + selectedColorName; // Add Benjamin Moore name on the next line
                        }

                        // Adjust geometricBounds to accommodate two lines of text
                        var label = doc.pages[0].textFrames.add({
                            geometricBounds: [
                                yPos + squareSize + 0.05,
                                xPos,
                                yPos + squareSize + labelHeight,
                                xPos + squareSize,
                            ],
                            contents: labelContents,
                        });
                        label.texts[0].justification = Justification.LEFT_ALIGN;
                        label.texts[0].pointSize = 10;

                        // Set the font to "BKM Portico Regular"
                        try {
                            label.texts[0].appliedFont = "BKM Portico\tRegular";
                        } catch (e) {
                            alert(
                                "Font 'BKM Portico Regular' not found. Please ensure the font is installed."
                            );
                            label.texts[0].appliedFont = app.fonts[0]; // Default to the first available font
                        }

                        // Check if we need to move to a new row
                        if ((i + 1) % squaresPerRow == 0) {
                            xPos = margin; // Reset x position for the new row
                            yPos += squareSize + labelHeight + 0.05 + rowGap; // Adjust y position for the new row
                        } else {
                            xPos += squareSize + gap; // Adjust x position for next square in the same row
                        }
                    }

                    alert("Colors generated successfully!");

                } else {
                    // Existing code to generate swatches based on variations and adjustments

                    // Calculate the required number of rows based on the variations
                    var numRows = Math.ceil(variations / squaresPerRow);

                    // Adjust the page width and height to fit the squares
                    doc.documentPreferences.properties = {
                        pageWidth:
                            squareSize * squaresPerRow + gap * (squaresPerRow - 1) + margin * 2,
                        pageHeight:
                            numRows * (squareSize + labelHeight + 0.05) + rowGap * (numRows - 1) + margin * 2,
                    };

                    // Start at the page margin for x and y position
                    var xPos = margin;
                    var yPos = margin;

                    for (var i = 0; i < variations; i++) {
                        var newC = c,
                            newM = m,
                            newY = y,
                            newK = k;

                        // Adjust CMYK values
                        function adjustValue(adjustments, originalValue) {
                            if (
                                adjustments.checkbox.value &&
                                adjustments.dropdown.selection.text !== "None"
                            ) {
                                var adjustment = i * Math.round(adjustments.slider.value);
                                return adjustments.dropdown.selection.text === "Increase"
                                    ? originalValue + adjustment
                                    : originalValue - adjustment;
                            }
                            return originalValue;
                        }

                        newC = adjustValue(cAdjustments, c);
                        newM = adjustValue(mAdjustments, m);
                        newY = adjustValue(yAdjustments, y);
                        newK = adjustValue(kAdjustments, k);

                        // Constrain values between 0 and 100
                        newC = Math.max(0, Math.min(100, newC));
                        newM = Math.max(0, Math.min(100, newM));
                        newY = Math.max(0, Math.min(100, newY));
                        newK = Math.max(0, Math.min(100, newK));

                        var colorName = "C" + newC + "_M" + newM + "_Y" + newY + "_K" + newK;

                        try {
                            var fillColor = doc.colors.add({
                                name: colorName,
                                space: ColorSpace.CMYK,
                                colorValue: [newC, newM, newY, newK],
                            });
                        } catch (e) {
                            fillColor = doc.colors.itemByName(colorName);
                        }

                        var square = doc.pages[0].rectangles.add({
                            geometricBounds: [yPos, xPos, yPos + squareSize, xPos + squareSize],
                            fillColor: fillColor,
                            fillTint: 100,
                            strokeWeight: 0, // No stroke
                            strokeColor: doc.swatches.item("None"), // Ensure no stroke color
                        });

                        // Create label for CMYK breakdown and Benjamin Moore name
                        var labelContents =
                            "C:" + newC + " M:" + newM + " Y:" + newY + " K:" + newK;
                        if (selectedColorName && selectedColorName !== "") {
                            labelContents += "\r" + selectedColorName; // Add Benjamin Moore name on the next line
                        }

                        // Adjust geometricBounds to accommodate two lines of text
                        var label = doc.pages[0].textFrames.add({
                            geometricBounds: [
                                yPos + squareSize + 0.05,
                                xPos,
                                yPos + squareSize + labelHeight,
                                xPos + squareSize,
                            ],
                            contents: labelContents,
                        });
                        label.texts[0].justification = Justification.LEFT_ALIGN;
                        label.texts[0].pointSize = 10;

                        // Set the font to "BKM Portico Regular"
                        try {
                            label.texts[0].appliedFont = "BKM Portico\tRegular";
                        } catch (e) {
                            alert(
                                "Font 'BKM Portico Regular' not found. Please ensure the font is installed."
                            );
                            label.texts[0].appliedFont = app.fonts[0]; // Default to the first available font
                        }

                        // Check if we need to move to a new row
                        if ((i + 1) % squaresPerRow == 0) {
                            xPos = margin; // Reset x position for the new row
                            yPos += squareSize + labelHeight + 0.05 + rowGap; // Adjust y position for the new row
                        } else {
                            xPos += squareSize + gap; // Adjust x position for next square in the same row
                        }
                    }

                    alert("Colors generated successfully!");
                }

            } else {
                alert("Please enter CMYK values between 0 and 100.");
            }
        } else {
            alert("Please enter valid CMYK values.");
        }
    }
} else {
    alert("No document is open.");
}
