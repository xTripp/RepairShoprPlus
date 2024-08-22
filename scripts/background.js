chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.tabs.create({url: '/../pages/install/welcome.html'});
    }
    if (details.reason === 'update') {
        chrome.tabs.create({url: '/../pages/install/update.html'});
    }
});