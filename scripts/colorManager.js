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

    // If an element was right clicked and a request message was received from background.js, return the element's JS path
    if (message.action === "getElementPath" && lastRightClickedElement) {
        sendResponse({elementPath: getJSPath(lastRightClickedElement)});
    }

    // Remove the color from a custom colored element
    if (message.action === "uncolorizeElement") {
        let element = document.querySelector(message.elementPath);
    
        if (element) {
            chrome.storage.local.get(["colors"], (data) => {
                let colors = data.colors || {};
    
                // Remove the stored color data
                if (colors[message.elementPath]) {
                    delete colors[message.elementPath];
                    chrome.storage.local.set({colors}, () => {
                        element.style.backgroundColor = "";
                    });
                } else {
                    alert("The element you selected does not currently have a custom color set or the element cannot be modified. Check the RS+ color configuration menu in the options window for the element you are trying to modify.");
                }
            });
        } else {
            alert("Something went wrong. This element cannot be modified at this time.");
            console.warn("[RS+] Element not found:", message.elementPath);
        }
    }

    // If all steps were completed successfully in the background script then set the color based on user input
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
                chrome.storage.local.get(["colors"], (data) => {
                    let colors = data.colors || {}; // Retrieve existing colors or initialize an empty object

                    // Add or update the path entry. Use the element value attribute as a fallback element identifier if there is no element text
                    colors[message.elementPath] = [nickname, color, element.textContent || element.value];

                    chrome.storage.local.set({colors});
                });
            }

            askForNickname();
        } else {
            alert("Something went wrong. This element cannot be modified at this time");
            console.warn("[RS+] Element not found:", message.elementPath);
        }
    }
});

// Apply all saved colors for elements that are present on the page if color coding is enabled
chrome.storage.local.get(['colorCodedState'], function (result) {
    if (result.colorCodedState) {
        chrome.storage.local.get(["colors"], (data) => {
            if (!data.colors) return;
            console.log(data.colors)

            // Apply the saved colors to each element saved in chrome.storage
            Object.entries(data.colors).forEach(([path, [_, color, savedText]]) => {
                let element = document.querySelector(path);
                
                // Validate the element by both JS path and text/value matching
                if (element && isCorrectElement(element, savedText)) {
                    element.style.backgroundColor = color;
                }
            });
        });

        // Observe changes to the ticket table and reload colored elements if changes were detected
        const ticketTable = document.getElementById('bhv-ticketTable');
        if (ticketTable && !ticketTable._mutationObserver2) {
            const observer = new MutationObserver(() => setBIPColors());
            observer.observe(ticketTable, {childList: true, subtree: true});
            ticketTable._mutationObserver2 = observer;
        }

        // Function to set colors for best in place elements
        function setBIPColors() {
            chrome.storage.local.get(["bipcolors"], (data) => {
                if (!data.bipcolors) return;

                // Apply the saved colors to each element saved in chrome.storage
                Object.entries(data.bipcolors).forEach(([text, color]) => {
                    let elements = document.querySelectorAll(".best_in_place");

                    // Validate the element by text/value matching
                    elements.forEach((element) => {
                        if (isCorrectElement(element, text)) {
                            element.style.backgroundColor = color[0];
                        }
                    });
                });
            });
        }
        setBIPColors();
    }
});

// Element text/value validation function
function isCorrectElement(element, expectedText) {
    if (!element) return false;

    // Get the text content or value, ensuring it is not null before using replace
    const actualText = (element.textContent && element.textContent.trim()) || (element.value && element.value.trim()) || '';

    // Normalize the text for a more reliable match
    const normalizedActualText = actualText.replace(/\s+/g, ' ').trim().toLowerCase();
    const normalizedExpectedText = expectedText.replace(/\s+/g, ' ').trim().toLowerCase();

    return normalizedActualText.includes(normalizedExpectedText);
}

// Returns a string with the most reliable JS path of an element
function getJSPath(element) {
    if (!element) return "";

    let path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.nodeName.toLowerCase();

        // Use ID if available for uniqueness
        if (element.id) {
            selector += `#${element.id}`;
            path.unshift(selector);
            break;
        } else {
            let siblingIndex = 1;
            let sibling = element;
            while (sibling.previousElementSibling) {
                sibling = sibling.previousElementSibling;
                if (sibling.nodeName.toLowerCase() === element.nodeName.toLowerCase()) {
                    siblingIndex++;
                }
            }

            if (siblingIndex > 1) {
                selector += `:nth-of-type(${siblingIndex})`;
            }
        }

        path.unshift(selector);
        element = element.parentNode;

        // Handle Shadow DOM elements
        if (element && element.nodeType === Node.DOCUMENT_FRAGMENT_NODE && element.host) {
            element = element.host;
        }
    }
    return path.join(" > ");
}