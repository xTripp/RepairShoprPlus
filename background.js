chrome.runtime.onInstalled.addListener((details) => {
	// Detect if the extension was just installed or just updated and display the appropriate page
	if (details.reason === 'install') {
		chrome.tabs.create({url: 'welcome.html'});
	}
	if (details.reason === 'update') {
		chrome.tabs.create({url: 'update.html'});
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