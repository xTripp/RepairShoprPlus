const issueTable = document.getElementById("issue-table");
const statusTable = document.getElementById("status-table");
const techTable = document.getElementById("tech-table");
const customTable = document.getElementById("custom-table");

let bipcolors = {};
let customColors = {};

// Function to convert named colors to hex
const nameToHex = (color) => {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = color;
    return ctx.fillStyle.toLowerCase();
};

// Function to handle inserting rows into the appropriate table
const insertRow = (table, key, nickname, color, text, category) => {
    const row = table.insertRow();
    const colorCell = row.insertCell(0);
    colorCell.style.padding = "0";
    const nameCell = row.insertCell(1);

    // Create color input
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.classList.add("color-input")

    // Convert named colors to hex before assigning them
    colorInput.value = color && color !== "#ffffff" ? nameToHex(color) : "#ffffff";;

    // This counter is used to determine if the user is trying to delete an element or just remove the color
    let rightClickCount = 0;

    // Function to update the color cell value and background. A value of null will change the input box to represent no color
    const updateColorStyle = (newColor) => {
        if (!newColor || newColor === "#ffffff") {
            colorInput.value = "#ffffff";
            colorInput.style.background = `linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 50%, #ccc 50%, #ccc 75%, transparent 75%, transparent)`;
            colorInput.style.backgroundSize = "10px 10px";
        } else {
            const hexColor = nameToHex(newColor);
            colorInput.value = hexColor;
            colorInput.style.background = hexColor;
        }
    };    
    updateColorStyle(color);

    // Update local object and input background on change
    colorInput.addEventListener("input", function() {
        const newColor = colorInput.value;
        updateColorStyle(newColor);
        rightClickCount = 0; // Reset right-click count when manually changing color

        // Save the new color to the correct key saved in chrome.storage and preserve all other values
        if (table === customTable) {
            customColors[key] = [nickname, newColor, text];
            chrome.storage.local.set({colors: customColors});
        } else {
            bipcolors[key] = [newColor, category];
            chrome.storage.local.set({bipcolors: bipcolors});
        }
    });

    // Remove color on right-click, second right-click deletes the element
    colorInput.addEventListener("contextmenu", function(event) {
        event.preventDefault();
        rightClickCount++;

        // Handle each right click appropriately
        if (rightClickCount === 1) {
            updateColorStyle(null);

            if (table === customTable) {
                customColors[key] = [nickname, null, text];
                chrome.storage.local.set({colors: customColors});
            } else {
                bipcolors[key] = [null, category];
                chrome.storage.local.set({bipcolors: bipcolors});
            }
        } else if (rightClickCount === 2) {
            // Remove item from correct table
            if (table === customTable) {
                delete customColors[key];
                chrome.storage.local.set({colors: customColors}, () => {
                    row.remove();
                });
            } else {
                delete bipcolors[key];
                chrome.storage.local.set({bipcolors: bipcolors}, () => {
                    row.remove();
                });
            }
        }
    });

    // Enable drag and drop functionality
    colorInput.draggable = true;

    colorInput.addEventListener("dragstart", function(event) {
        event.dataTransfer.setData("text/plain", colorInput.value);
    });

    colorInput.addEventListener("dragover", function(event) {
        event.preventDefault();
    });

    colorInput.addEventListener("drop", function(event) {
        event.preventDefault();
        const newColor = event.dataTransfer.getData("text/plain");
        colorInput.value = newColor;
        updateColorStyle(newColor);

        // Preserve existing data while modifying the color value
        if (table === customTable) {
            customColors[key] = [nickname, newColor, text];
            chrome.storage.local.set({colors: customColors});
        } else {
            bipcolors[key] = [newColor, category];
            chrome.storage.local.set({bipcolors: bipcolors});
        }
    });

    colorCell.appendChild(colorInput);
    nameCell.textContent = nickname || key;
};

// Fetch bipcolors data
chrome.storage.local.get(["bipcolors"], function(result) {
    // If the config page is loaded before the bip values are read from the tickets page, display this error box
    if (!result.bipcolors || Object.keys(result.bipcolors).length === 0) {
        document.querySelector(".bip-tables").innerHTML =
            "<div class=\"missing-vals\">No table values found! Refresh the tickets page, then reload this page and try again.</div>";
        return;
    }

    // Load color values locally
    bipcolors = result.bipcolors;

    // Insert each value into the correct color table
    Object.entries(bipcolors).forEach(([key, value]) => {
        const [color, category] = value;
        let targetTable;

        switch (category) {
            case "issue":
                targetTable = issueTable;
                break;
            case "status":
                targetTable = statusTable;
                break;
            case "tech":
                targetTable = techTable;
                break;
        }

        insertRow(targetTable, key, key, color, null, category);
    });
});

// Fetch custom colors data
chrome.storage.local.get(["colors"], function(result) {
    if (result.colors) {
        // Load color values locally
        customColors = result.colors;

        Object.entries(customColors).forEach(([key, value]) => {
            const [nickname, color, text] = value;
            insertRow(customTable, key, nickname, color, text, "custom");
        });
    }
});

// Save all colors every second
setInterval(() => {
    chrome.storage.local.get(["bipcolors", "colors"], (result) => {
        const storageColors = result.colors || {};

        // Remove any keys from local customColors that no longer exist in storage
        Object.keys(customColors).forEach((key) => {
            if (!(key in storageColors)) {
                delete customColors[key];
            }
        });

        // Update or add new/changed custom colors from storage
        Object.entries(storageColors).forEach(([key, value]) => {
            if (!customColors[key] || JSON.stringify(customColors[key]) !== JSON.stringify(value)) {
                customColors[key] = value;
            }
        });

        // Merge bipcolors without deleting local entries
        const updatedBIPColors = { ...result.bipcolors, ...bipcolors };

        // Save updated data back to chrome.storage
        chrome.storage.local.set({
            bipcolors: updatedBIPColors,
            colors: customColors
        });
        bipcolors = updatedBIPColors;
    });
}, 1000);
