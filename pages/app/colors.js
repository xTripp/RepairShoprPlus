const issueTable = document.getElementById("issue-table");
const statusTable = document.getElementById("status-table");
const techTable = document.getElementById("tech-table");

let bipcolors = {};

chrome.storage.sync.get(["bipcolors"], function (result) {
    if (!result.bipcolors){
        document.querySelector(".bip-tables").innerHTML = "<div class=\"missing-vals\">No table values found! Refresh the tickets page, then reload this page and try again.</div>";
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

        // Update local bipcolors object on change
        colorInput.addEventListener("input", function () {
            bipcolors[key] = [colorInput.value, category];
        });

        colorCell.appendChild(colorInput);
        nameCell.textContent = key;
    });
});

// Save all colors every second
setInterval(() => {
    chrome.storage.sync.set({bipcolors});
}, 2000);
