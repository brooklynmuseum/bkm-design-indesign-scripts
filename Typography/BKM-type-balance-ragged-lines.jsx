//Specify how the Balance Ragged Lines feature should balance out the lines in a paragraph

// Keith Gilbert
// www.gilbertconsulting.com
// Modified 2023-03-16

// BKM Edits by Adam O'Reilly
// Modified 2024-10-11 

// InDesign offers the option to turn "Balance Ragged Lines" on or off. By default, ID tries to even out the line lengths
// of the selected text, favoring an "inverted pyramid" shape of the paragraph, with the top lines longer than the bottom
// lines. This script exposes the hidden feature of InDesign that allows you to control the "shape" of the balance.

main();

function main(){
	// First, check to see whether any InDesign documents are open.
	// If no documents are open, display an error message.
	if (app.documents.length > 0) {
		if(app.selection.length != 0){
			// Check to see if there is a proper selection
			switch(app.selection[0].constructor.name) {
				case "InsertionPoint":
				case "Character":
				case "Word":
				case "TextStyleRange":
				case "Line":
				case "Paragraph":
				case "TextColumn":
				case "Text":
					var myText = app.selection[0];
					myDisplayDialog(myText);
					break;
				case "Table":
				case "Cell":
					alert("Please select some text, or choose an insertion point, and try again. This script does not function with table cells, rows or columns selected.");
					break;
				case "Rectangle":
				case "Oval":
				case "Polygon":
				case "GraphicLine":
				case "Image":
				case "PDF":
				case "EPS":
				default:
					alert("Please select some text, or choose an insertion point, and try again.");
					break;
			}
		}
		else {
			alert("Please select some text, or choose an insertion point, and try again.");
		}
	}
	else {
		//No documents are open, so display an error message.
		alert("No InDesign documents are open. Please open a document and try again.")
	}
}

// Function to display a dialog box and collect the type of balancing desired
function myDisplayDialog(myText) {
	// Prompt the user for the desired Balance style
	var myDialog = app.dialogs.add({name:"BalanceRaggedLineStyle", canCancel:true});
	with (myDialog) {
		with (dialogColumns.add()) {
			with (borderPanels.add()) {
				with (dialogRows.add()) {
					staticTexts.add({staticLabel:"Choose a Balance Ragged Line style:"});
				}
				with (dialogRows.add()) {
					var myBalanceRadioButtonGroup = radiobuttonGroups.add();
					with(myBalanceRadioButtonGroup){								
						var myVeeRadioButton = radiobuttonControls.add({staticLabel:"Vee shape (normal)", checkedState:true});	
						var myPyramidRadioButton = radiobuttonControls.add({staticLabel:"Pyramid shape"});
						var myFullRadioButton = radiobuttonControls.add({staticLabel:"Fully balanced"});
						var myNoneRadioButton = radiobuttonControls.add({staticLabel:"No balance"});
					}
				}
				with (dialogRows.add()) {
					staticTexts.add({staticLabel:"(Composition will be changed to the 'Adobe Paragraph Composer' if necessary)"});
				}
			}
		}
	}
	if (myDialog.show() == true) { // User didn't click the cancel button
		switch (myBalanceRadioButtonGroup.selectedButton) {
			case 0:
				var myBalance = "Vee";
				myText.balanceRaggedLines = BalanceLinesStyle.VEE_SHAPE;
			break;
			case 1:
				var myBalance = "Pyramid";
				myText.balanceRaggedLines = BalanceLinesStyle.PYRAMID_SHAPE;
			break;
			case 2:
				var myBalance = "Full";
				myText.balanceRaggedLines = BalanceLinesStyle.FULLY_BALANCED;
			break;
			case 3:
				var myBalance = "None";
				myText.balanceRaggedLines = BalanceLinesStyle.NO_BALANCING;
			break;
		}
		myDialog.destroy();
		myText.composer = "$ID/HL Composer"; // balanceRaggedLines is ignored with the single-line composer active (at least in ID CC 2018 and above, maybe older)
	}
	else {
		myDialog.destroy();
	}
}