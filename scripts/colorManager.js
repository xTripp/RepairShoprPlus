// Monitor the element selected from the context menu
let lastRightClickedElement = null;
document.addEventListener("contextmenu", (event) => {
    lastRightClickedElement = event.target;
});

// Main cycle for dynamic color setting
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // If an element was right clicked and a request message was received from background.js, return the element's JS path
    if (message.action === "getElementPath" && lastRightClickedElement) {
        sendResponse({elementPath: getJSPath(lastRightClickedElement)});
    }

    // If all is successful set the color based on user input
    if (message.action === "colorizeElement") {
        showColorPicker(message.elementPath);
    }
    
});

// Apply all saved colors for elements that are present on the page


// Color Picker Modal
function showColorPicker(elementPath) {
    // Check if modal already exists
    if (document.getElementById("colorModal")) {
        document.getElementById("colorModal").style.display = "flex";
        return;
    }

    // Create the modal HTML
    const modal = document.createElement("div");
    modal.id = "colorModal";
    modal.innerHTML = `
        <div class="color-modal-content">
            <p>Enter a CSS color for the element:</p>
            <input type="text" id="colorModalInput" placeholder="e.g., SeaGreen">
            <p><a href="https://www.w3schools.com/cssref/css_colors.php" target="_blank">Click here for valid colors</a></p>
            <button id="colorModalConfirm">OK</button>
            <button id="colorModalCancel">Cancel</button>
        </div>
    `;

    // Style the modal (scoped to avoid affecting other elements)
    const style = document.createElement("style");
    style.textContent = `
        #colorModal {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex; justify-content: center; align-items: center;
            z-index: 9999;
        }
        .color-modal-content {
            background: white; padding: 20px; border-radius: 8px;
            text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        #colorModalInput {
            margin: 10px 0; padding: 5px; width: 80%;
            border: 1px solid #ccc; border-radius: 4px;
            font-size: 14px;
        }
        #colorModalConfirm, #colorModalCancel {
            margin: 5px; padding: 8px 12px;
            cursor: pointer; font-size: 14px;
            border: none; border-radius: 4px;
        }
        #colorModalConfirm {
            background: #28a745; color: white;
        }
        #colorModalCancel {
            background: #dc3545; color: white;
        }
        #colorModalConfirm:hover {
            background: #218838;
        }
        #colorModalCancel:hover {
            background: #c82333;
        }
    `;

    // Append modal and styles to the page
    document.body.appendChild(modal);
    document.head.appendChild(style);

    // Event listeners for buttons
    document.getElementById("colorModalConfirm").addEventListener("click", function () {
        const userColor = document.getElementById("colorModalInput").value.trim();
        const temp = document.createElement("div");
        temp.style.color = userColor;

        if (temp.style.color) {
            document.querySelector(elementPath).style.backgroundColor = userColor;
            modal.remove(); // Remove modal after setting the color
        } else {
            alert("Invalid CSS color. Please enter a valid color.");
        }
    });

    document.getElementById("colorModalCancel").addEventListener("click", function () {
        modal.remove(); // Remove modal on cancel
    });
}

// Returns a string with the JS path of an element
function getJSPath(element) {
    let path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.nodeName.toLowerCase();
        if (element.id) {
            selector += `#${element.id}`;
            path.unshift(selector);
            break;
        } else {
            let siblingIndex = 1;
            let sibling = element;
            while (sibling.previousElementSibling) {
                sibling = sibling.previousElementSibling;
                if (sibling.nodeName.toLowerCase() === selector) {
                    siblingIndex++;
                }
            }
            if (siblingIndex > 1) {
                selector += `:nth-child(${siblingIndex})`;
            }
        }
        path.unshift(selector);
        element = element.parentNode;
    }
    return path.join(" > ");
}