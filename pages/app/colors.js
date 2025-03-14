const issueTable = document.getElementById("issue-table");
const statusTable = document.getElementById("status-table");
const techTable = document.getElementById("tech-table");
const customTable = document.getElementById("custom-table");

let bipcolors = {};
let customColors = {};

// Function to handle inserting rows into the appropriate table
const insertRow = (table, key, nickname, color, category, storageObject) => {
    const row = table.insertRow();
    const colorCell = row.insertCell(0);
    const nameCell = row.insertCell(1);

    // Create color input
    colorCell.style.padding = "0";
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = color || "#ffffff";
    colorInput.style.width = "calc(100% - 2px)";
    colorInput.style.margin = "1px";
    colorInput.style.border = "2px inset";
    colorInput.style.cursor = "pointer";

    // Function to update the input background
    const updateColorStyle = (newColor) => {
        if (!newColor || newColor === "#ffffff") {
            colorInput.style.background = `linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 50%, #ccc 50%, #ccc 75%, transparent 75%, transparent)`;
            colorInput.style.backgroundSize = "10px 10px";
            colorInput.style.border = "2px inset gray";
        } else {
            colorInput.style.background = newColor;
            colorInput.style.border = "2px inset";
        }
    };

    // Initialize input with the correct background
    updateColorStyle(color);

    // Update local object and input background on change
    colorInput.addEventListener("input", function() {
        const newColor = colorInput.value;
        updateColorStyle(newColor);
    
        // Preserve existing nickname and category
        const [nickname, , textContent] = storageObject[key] || [null, null, null];
        storageObject[key] = [nickname, newColor, textContent];
    
        // Save to storage
        const storageKey = table === customTable ? "colors" : "bipcolors";
        chrome.storage.sync.set({[storageKey]: storageObject});
    });    

    // Remove color on right-click and update storage
    colorInput.addEventListener("contextmenu", function(event) {
        event.preventDefault();
        colorInput.value = "#ffffff";
        updateColorStyle(null);
        storageObject[key] = [null, category];

        if (table === customTable) {
            chrome.storage.sync.set({colors: storageObject});
        } else {
            chrome.storage.sync.set({bipcolors: storageObject});
        }
    });

    // Enable drag and drop functionality
    colorInput.draggable = true;

    // Set the dragged color when dragging starts
    colorInput.addEventListener("dragstart", function(event) {
        event.dataTransfer.setData("text/plain", colorInput.value);
    });

    // Allow dropping on another color input
    colorInput.addEventListener("dragover", function(event) {
        event.preventDefault();
    });

    // Change color when dropped
    colorInput.addEventListener("drop", function(event) {
        event.preventDefault();
        const newColor = event.dataTransfer.getData("text/plain");
        colorInput.value = newColor;
        updateColorStyle(newColor);
        storageObject[key] = [newColor, category];

        if (table === customTable) {
            chrome.storage.sync.set({ colors: storageObject });
        } else {
            chrome.storage.sync.set({ bipcolors: storageObject });
        }
    });

    colorCell.appendChild(colorInput);
    nameCell.textContent = nickname || key;
};

// Fetch bipcolors data
chrome.storage.sync.get(["bipcolors"], function(result) {
    if (!result.bipcolors) {
        document.querySelector(".bip-tables").innerHTML =
            "<div class=\"missing-vals\">No table values found! Refresh the tickets page, then reload this page and try again.</div>";
        return;
    }

    bipcolors = result.bipcolors;

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

        insertRow(targetTable, key, null, color, category, bipcolors);
    });
});

// Fetch custom colors data
chrome.storage.sync.get(["colors"], function(result) {
    if (result.colors) {
        customColors = result.colors;

        Object.entries(customColors).forEach(([key, value]) => {
            const [nickname, color, _] = value;
            insertRow(customTable, key, nickname, color, "custom", customColors);
        });
    }
});


// Save all colors every 1.2 seconds
setInterval(() => {
    console.log(customColors)
    chrome.storage.sync.set({bipcolors, colors: customColors});
}, 1200);

// Remove entries where the color is null when the user leaves the page
window.addEventListener("beforeunload", () => {
    customColors = Object.fromEntries(
        Object.entries(customColors).filter(([_, value]) => value[0] !== null)
    );

    chrome.storage.sync.set({colors: customColors});
});