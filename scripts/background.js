chrome.runtime.onInstalled.addListener((details) => {
    // Detect if the extension was just installed or just updated and display the appropriate page
    if (details.reason === 'install') {
        chrome.tabs.create({url: '/../pages/install/welcome.html'});
    }
    if (details.reason === 'update') {
        chrome.tabs.create({url: '/../pages/install/update.html'});

        // temporary code for v1.7 to remove quick links and autofill states from chrome storage
		chrome.storage.local.get(['quickLinksState', 'cardAutofillState', 'quickAutofillState'], function(result) {
			if (result.quickLinksState !== undefined || result.cardAutofillState !== undefined || result.quickAutofillState !== undefined) {
				chrome.storage.local.remove(['quickLinksState', 'cardAutofillState', 'quickAutofillState']);
			}
		});

        // Migrate all local storage data to sync
        chrome.storage.local.get(null, function (localData) {
            if (Object.keys(localData).length > 0) {
                console.log('Migrating data from chrome.storage.local to chrome.storage.sync...');
                console.log(localData)
        
                // Save the data to chrome.storage.sync
                chrome.storage.sync.set(localData, function () {
                    if (chrome.runtime.lastError) {
                        console.error('Error migrating data to chrome.storage.sync:', chrome.runtime.lastError);
                    } else {
                        console.log('Data successfully migrated to chrome.storage.sync.');
            
                        // Optionally clear chrome.storage.local
                        chrome.storage.local.clear(function () {
                            console.log('Local storage cleared after migration.');
                        });
                    }
                });
            } else {
                console.log('No data found in chrome.storage.local to migrate.');
            }
        });
    }

	// Create context menu for custom colors
	chrome.contextMenus.create({
		id: "colorizeElement",
		title: "Set Element Color",
		contexts: ["all"],
		documentUrlPatterns: ["https://*.repairshopr.com/*"]
	});

	// Handle the context menu event
	chrome.contextMenus.onClicked.addListener((info, tab) => {
		if (info.menuItemId === "colorizeElement") {
			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				function: addColorToElement
			});
		}
	});
});