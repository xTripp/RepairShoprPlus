const issueTable = document.getElementById("issue-table");
const statusTable = document.getElementById("status-table");
const techTable = document.getElementById("tech-table");

chrome.storage.sync.get(["bipcolors"], function (result) {
    if (!result.bipcolors) return;

    Object.entries(result.bipcolors).forEach(([key, value]) => {
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

        const row = targetTable.insertRow();
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
        colorInput.style.backgroundColor = color || "transparent";

        if (!color) {
            colorInput.style.border = "3px dashed gray";
        }

        // Event listener to save color changes
        colorInput.addEventListener("input", function () {
            const newColor = colorInput.value;

            chrome.storage.sync.get(["bipcolors"], function (result) {
                const updatedColors = result.bipcolors || {};
                updatedColors[key] = [newColor, category];

                colorInput.style.backgroundColor = color || "transparent";
                console.log("color saved")
                chrome.storage.sync.set({ bipcolors: updatedColors });
            });
        });

        colorCell.appendChild(colorInput);
        nameCell.textContent = key;
    });
});
