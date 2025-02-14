const issueTable = document.getElementById("issue-table");
const statusTable = document.getElementById("status-table");
const techTable = document.getElementById("tech-table");

chrome.storage.sync.get(['bipcolors'], function(result) {
    if (!result.bipcolors) return;
    console.log(result)

    Object.entries(result.bipcolors).forEach(([key, value]) => {
        const [color, category] = value; // Extract color and category name
        let targetTable;

        // Determine which table to insert into based on category
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

        colorCell.style.backgroundColor = color || "transparent";
        // If the color is null, show a checkered pattern (alpha placeholder)
        if (!color) {
            colorCell.style.backgroundImage = "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)";
            colorCell.style.backgroundSize = "10px 10px";
            colorCell.style.backgroundPosition = "0 0, 0 5px, 5px -5px, -5px 0px";
        }
        

        // Set the name in the second column
        nameCell.textContent = key;
    });
});
