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

        // Migrate any chrome.storage.local data to chrome.storage.sync safely if possible
        chrome.storage.sync.getBytesInUse(null, function (bytes) {
            if (chrome.runtime.lastError) {
                console.error('chrome.storage.sync is unavailable:', chrome.runtime.lastError);
                return; // Exit if sync is not available
            }

            // Get all data from local storage
            chrome.storage.local.get(null, function (localData) {
                if (chrome.runtime.lastError) {
                    console.error('Error accessing chrome.storage.local:', chrome.runtime.lastError);
                    return; // Exit if local storage can't be accessed
                }

                if (Object.keys(localData).length === 0) {
                    console.log('No data found in chrome.storage.local to migrate.');
                    return; // Exit if there's no data to migrate
                }

                console.log('Migrating data from chrome.storage.local to chrome.storage.sync...');
                console.log(localData);

                // Check if there's enough space in chrome.storage.sync
                let dataSize = new Blob([JSON.stringify(localData)]).size;
                if (bytes + dataSize > 100000) { // 100KB sync limit
                    console.error('Not enough space in chrome.storage.sync. Migration aborted.');
                    return; // Exit if sync storage is full
                }

                // Store data in chrome.storage.sync
                chrome.storage.sync.set(localData, function () {
                    if (chrome.runtime.lastError) {
                        console.error('Error migrating data to chrome.storage.sync:', chrome.runtime.lastError);
                        return; // Exit if sync fails
                    }

                    console.log('Data successfully migrated to chrome.storage.sync.');

                    // Verify data integrity before clearing local storage
                    chrome.storage.sync.get(null, function (syncedData) {
                        if (chrome.runtime.lastError) {
                            console.error('Error verifying sync data:', chrome.runtime.lastError);
                            return; // Exit if verification fails
                        }

                        if (JSON.stringify(syncedData) === JSON.stringify(localData)) {
                            console.log('Migration verified. Clearing local storage...');
                            chrome.storage.local.clear(function () {
                                if (chrome.runtime.lastError) {
                                    console.error('Error clearing chrome.storage.local:', chrome.runtime.lastError);
                                    return;
                                }
                                console.log('Local storage cleared after successful migration.');
                            });
                        } else {
                            console.warn('Migration verification failed. Local storage NOT cleared.');
                        }
                    });
                });
            });
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
        chrome.storage.sync.get(['colorCodedState'], function(result) {
            if (result.colorCodedState) {
                // Get the path for the selected element
                chrome.tabs.sendMessage(tab.id, {action: "getElementPath"}, (response) => {
                    if (response && response.elementPath) {
                        // Send the colorized request
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
        // Check if color coded state is enabled
        chrome.storage.sync.get(['colorCodedState'], function(result) {
            if (result.colorCodedState) {
                // Get the path for the selected element
                chrome.tabs.sendMessage(tab.id, {action: "getElementPath"}, (response) => {
                    if (response && response.elementPath) {
                        // Remove the saved color from storage
                        chrome.storage.sync.get(['colors'], (colorResult) => {
                            if (colorResult.colors && colorResult.colors[response.elementPath]) {
                                delete colorResult.colors[response.elementPath];
        
                                // Save the updated object back to storage
                                chrome.storage.sync.set({ colors: colorResult.colors }, () => {
                                    chrome.tabs.sendMessage(tab.id, {action: "uncolorizeElement"});
                                });
                            } else {
                                chrome.tabs.sendMessage(tab.id, {action: "elementNotFound"});
                            }
                        });
                    }
                });
            } else {
                chrome.tabs.sendMessage(tab.id, {action: "enableCCElements"});
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