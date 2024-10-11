// Define the function to add random kerning
function applyRandomKerning() {
    var doc = app.activeDocument;
    var selection = app.selection;

    if (selection.length > 0 && selection[0].constructor.name == "TextFrame") {
        var textFrame = selection[0];
        var characters = textFrame.characters;

        for (var i = 0; i < characters.length - 1; i++) {
            var randomKerning = Math.random() * 2000 - 100; // Random kerning between -500 and 1500 units
            characters[i].kerningValue = randomKerning;
        }
    } else {
        alert("Please select a text frame.");
    }
}

// Run the function
applyRandomKerning();
