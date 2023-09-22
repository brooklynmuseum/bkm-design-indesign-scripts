// Check if a document is open
if (app.documents.length > 0) {
    var doc = app.activeDocument;

    // Modal box to get number of variations
    var variations = prompt("Enter the number of color variations (max 100):", "5");
    
    var adjustC = confirm("Adjust C?");
    var adjustM = confirm("Adjust M?");
    var adjustY = confirm("Adjust Y?");
    var adjustK = confirm("Adjust K?");
    
    if (variations && !isNaN(variations) && variations > 0 && variations <= 100) {
        
        // Get the selected object's fill color
        if (doc.selection.length === 1 && doc.selection[0].hasOwnProperty('fillColor')) {
            var selectedColor = doc.selection[0].fillColor;
            doc.selection[0].remove();  // Delete the selected object
    
            if (selectedColor.space == ColorSpace.CMYK) {
                var c = selectedColor.colorValue[0];
                var m = selectedColor.colorValue[1];
                var y = selectedColor.colorValue[2];
                var k = selectedColor.colorValue[3];
    
                var squareSize = 1.5;  // Size of the squares
                var margin = 0.5;  // Page margin
                var gap = 0.25;    // Gap between squares
                var squaresPerRow = 8;  // Maximum squares in one row
                var rowGap = 0;  // Gap between rows

                // Calculate the required number of rows based on the variations
                var numRows = Math.ceil(variations / squaresPerRow);
                
                // Adjust the page width to fit the squares
                doc.documentPreferences.pageWidth = (squareSize * squaresPerRow) + (gap * (squaresPerRow - 1)) + (margin * 2);

                // Adjust the page height based on number of rows
                doc.documentPreferences.pageHeight = (numRows * (squareSize + 0.6)) + (rowGap * (numRows - 1)) + (margin * 2);

                // Start at the page margin for x and y position
                var xPos = margin;
                var yPos = margin;
                
                for (var i = 0; i < variations; i++) {
                    var newC = adjustC ? c + i : c;
                    var newM = adjustM ? m + i : m;
                    var newY = adjustY ? y + i : y;
                    var newK = adjustK ? k + i : k;

                    newC = newC > 100 ? 100 : newC;
                    newM = newM > 100 ? 100 : newM;
                    newY = newY > 100 ? 100 : newY;
                    newK = newK > 100 ? 100 : newK;
    
                    var colorName = "C" + newC + "_M" + newM + "_Y" + newY + "_K" + newK;
    
                    var square = doc.pages[0].rectangles.add({
                        geometricBounds: [yPos, xPos, yPos + squareSize, xPos + squareSize],
                        fillColor: doc.colors.add({
                            name: colorName,
                            space: ColorSpace.CMYK,
                            colorValue: [newC, newM, newY, newK]
                        }),
                        fillTint: 100,
                        strokeWeight: 0
                    });
    
                    var label = doc.pages[0].textFrames.add({
                        geometricBounds: [yPos + squareSize + 0.1, xPos, yPos + squareSize + 0.6, xPos + squareSize],
                        contents: "C:" + newC + " M:" + newM + " Y:" + newY + " K:" + newK
                    });
                    label.texts[0].justification = Justification.CENTER_ALIGN;
                    label.texts[0].pointSize = 8;
    
                    // Check if we need to move to a new row
                    if ((i + 1) % squaresPerRow == 0) {
                        xPos = margin;  // Reset x position for the new row
                        yPos += (squareSize + 0.6 + rowGap);  // Adjust y position for the new row
                    } else {
                        xPos += squareSize + gap;  // Adjust x position for next square in the same row
                    }
                }

                alert("Color squares and labels generated successfully!");
    
            } else {
                alert("Selected object's color is not in CMYK color space.");
            }
    
        } else {
            alert("Please select an object with a fill color.");
        }

    } else {
        alert("Please enter a valid number between 1 and 100.");
    }

} else {
    alert("No document is open.");
}
