// Function to show a notification
function showNotification(message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'assets/icon-48x48.png',
        title: 'Extension Updated!',
        message: message
    });
}

// Listen for the onInstalled event
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'update') {
        console.log('updated');
        const thisVersion = chrome.runtime.getManifest().version;
        const previousVersion = details.previousVersion;
        const message = `Extension updated from ${previousVersion} to ${thisVersion}.`;
        showNotification(message);
    }
});