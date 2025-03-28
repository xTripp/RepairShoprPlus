chrome.runtime.onInstalled.addListener((details) => {
    // Detect if the extension was just installed or updated and display the appropriate page
    if (details.reason === 'install') {
        chrome.tabs.create({ url: '/../pages/install/welcome.html' });
    }
    if (details.reason === 'update') {
        chrome.tabs.create({ url: '/../pages/install/update.html' });

        // Temporary code for v1.7 to remove quick links and autofill states from Chrome storage
        chrome.storage.local.get(['quickLinksState', 'cardAutofillState', 'quickAutofillState'], function (result) {
            if (result.quickLinksState !== undefined || result.cardAutofillState !== undefined || result.quickAutofillState !== undefined) {
                chrome.storage.local.remove(['quickLinksState', 'cardAutofillState', 'quickAutofillState']);
            }
        });
    }
    
    createContextMenu();
});

// Ensure the context menu is created on extension startup
chrome.runtime.onStartup.addListener(() => {
    createContextMenu();
});

function createContextMenu() {
    chrome.contextMenus.create({
        id: "colorizeElement",
        title: "Set Element Color",
        contexts: ["all"],
        documentUrlPatterns: ["https://*.repairshopr.com/*"]
    });

    chrome.contextMenus.create({
        id: "uncolorizeElement",
        title: "Remove Element Color",
        contexts: ["all"],
        documentUrlPatterns: ["https://*.repairshopr.com/*"]
    });
}

// Handle the context menu event
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "colorizeElement") {
        // Check if color coded state is enabled
        chrome.storage.local.get(['colorCodedState'], function(result) {
            if (result.colorCodedState) {
                // Get the path for the selected element
                chrome.tabs.sendMessage(tab.id, {action: "getElementPath"}, (response) => {
                    if (response && response.elementPath) {
                        // Send the colorize request
                        chrome.tabs.sendMessage(tab.id, {
                            action: "colorizeElement",
                            elementPath: response.elementPath
                        });
                    }
                });
            } else {
                chrome.tabs.sendMessage(tab.id, {action: "enableCCElements"});
            }
        });
    } else if (info.menuItemId === "uncolorizeElement") {
        chrome.storage.local.get(["colorCodedState"], function (result) {
            if (result.colorCodedState) {
                // Get the path for the selected element
                chrome.tabs.sendMessage(tab.id, {action: "getElementPath"}, (response) => {
                    if (response && response.elementPath) {
                        // Send the uncolorize request
                        chrome.tabs.sendMessage(tab.id, {
                            action: "uncolorizeElement",
                            elementPath: response.elementPath,
                        });
                    }
                });
            } else {
                chrome.tabs.sendMessage(tab.id, { action: "enableCCElements" });
            }
        });
    }    
});

// Keep background.js alive using alarms
chrome.alarms.create("keepAlive", {periodInMinutes: 5});
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "keepAlive") {
        console.log("Stayin alive, stayin alive...");
    }
});