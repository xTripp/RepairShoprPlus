// Monitor the element selected from the context menu
let lastRightClickedElement = null;
document.addEventListener("contextmenu", (event) => {
    lastRightClickedElement = event.target;
});

// Main cycle for dynamic color setting
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "enableCCElements") {
        alert("You must enable the \"Enable Color-coded Elements\" option in the RS+ options menu first.");
    }

    if (message.action === "elementNotFound") {
        alert("The element you selected does not currently have a custom color set or the element cannot be modified. Check the RS+ color configuration menu in the options window for the element you are trying to modify.");
    }

    if (message.action === "uncolorizeElement") {
        alert("The element you selected has been reset. Refresh the page for changes to apply.");
    }

    // If an element was right clicked and a request message was received from background.js, return the element's JS path
    if (message.action === "getElementPath" && lastRightClickedElement) {
        sendResponse({elementPath: getJSPath(lastRightClickedElement)});
    }

    // If all is successful set the color based on user input
    if (message.action === "colorizeElement") {
        let element = document.querySelector(message.elementPath);

        if (element) {
            function askForNickname() {
                const nickname = prompt("Enter a nickname to identify this element:\nNOTE: This name will be used to identify the element on the color config page");

                // If the user cancels the nickname prompt, do nothing
                if (nickname === null || nickname.trim() === "") {
                    alert("Nickname is required for custom elements. Try again.");
                    return;
                }

                askForColor(nickname);
            }

            function askForColor(nickname) {
                const userColor = prompt(
                    "Enter a color name (Blue, SeaGreen, etc.) or hex code (#FF0000) color for this element:\nIf you would like to choose a color later on the config page, then select cancel now\n\nSee this website for all valid colors:\nhttps://www.w3schools.com/cssref/css_colors.php",
                    "RoyalBlue"
                );

                // If the user cancels, store null as the color
                if (userColor === null) {
                    saveColor(nickname, null);
                    return;
                }

                // Create a temporary element to check if the color is valid
                const temp = document.createElement("div");
                temp.style.color = userColor;

                if (temp.style.color) {
                    element.style.backgroundColor = userColor;
                    saveColor(nickname, userColor);
                } else {
                    alert("Invalid CSS color. Please enter a valid color name or hex code.\n\nSee this website for all valid colors:\nhttps://www.w3schools.com/cssref/css_colors.php");
                    askForColor(nickname);
                }
            }

            function saveColor(nickname, color) {
                chrome.storage.sync.get(["colors"], (data) => {
                    let colors = data.colors || {}; // Retrieve existing colors or initialize empty object

                    // Add or update the path entry
                    colors[message.elementPath] = [nickname, color, element.textContent];

                    chrome.storage.sync.set({colors});
                });
            }

            askForNickname();
        } else {
            alert("Something went wrong. This element cannot be modified at this time");
            console.warn("[RS+] Element not found:", message.elementPath);
        }
    }
});

// Apply all saved colors for elements that are present on the page
chrome.storage.sync.get(['colorCodedState'], function(result) {
    if (result.colorCodedState) {
        chrome.storage.sync.get(["colors"], (data) => {
            if (!data.colors) return;
        
            Object.entries(data.colors).forEach(([path, [_, color, savedText]]) => {
                let element = document.querySelector(path);
                if (element && element.textContent.trim() === savedText.trim()) {
                    element.style.backgroundColor = color;
                }
            });
        });        

        // Observe changes to the ticket table and reload colored elements if detected
        const ticketTable = document.getElementById('bhv-ticketTable');
        if (ticketTable && !ticketTable._mutationObserver2) {
            const observer = new MutationObserver(() => setBIPColors());
            observer.observe(ticketTable, {childList: true});
            ticketTable._mutationObserver2 = observer;
        }

        // Set colors for each "best in place" element on the page
        function setBIPColors() {
            chrome.storage.sync.get(["bipcolors"], (data) => {
                if (!data.bipcolors) return;
            
                Object.entries(data.bipcolors).forEach(([text, color]) => {
                    let elements = document.querySelectorAll(".best_in_place");
                    
                    elements.forEach((element) => {
                        if (element.textContent.trim() === text.trim()) {
                            element.style.backgroundColor = color[0];
                        }
                    });
                });            
            });
        }
        setBIPColors();
    }
});

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