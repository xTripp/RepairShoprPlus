document.addEventListener('DOMContentLoaded', function() {
    const logo = document.getElementById('logo');
    const legacyTicketToggle = document.getElementById('option1');
    const quickLinksToggle = document.getElementById('option2');
    const lastUpdatedToggle = document.getElementById('option3');
    const chargesLinkToggle = document.getElementById('option4');
    const forceSingleToggle = document.getElementById('option5');
    const registerHistoryToggle = document.getElementById('option6');
    const upsellOpportunityToggle = document.getElementById('option7');
    const global24hTimeToggle = document.getElementById('option8');
    const upsellOpportunityConfig = document.getElementById('config7');
    const applyButton = document.getElementById('apply');

    // open import/export settings menu when logo is clicked
    logo.addEventListener('click', function() {
        const body = document.querySelector('.menu');
        body.classList.add('settings-body');
        const footer = document.querySelector('.footer');
        footer.classList.add('settings-footer')

        let footerContent = '';
        footerContent += '<div><button id="exportButton" style="width: 100%;">Export Settings Backup Code to Clipboard</button></div>';
        footerContent += '<div><input id="backupCodeInput" style="width: 60%; margin-right: 8px" type="text" placeholder="Paste backup code here"></input><button id="importButton" style="width: 35%">Import Settings</button></div>';
        footer.innerHTML = footerContent;

        getSettings(function(bodyContent) {
            body.innerHTML = bodyContent;
        });

        // generate a base64 backup code and copy it to the clipboard
        document.getElementById('exportButton').addEventListener('click', function() {
            generateBackupCode(function(backupCode) {
                navigator.clipboard.writeText(backupCode);
            });
        });

        // take base64 backup code and restore its contents
        document.getElementById('importButton').addEventListener('click', function() {
            const backupCode = document.getElementById('backupCodeInput').value;
            
            if (backupCode !== '') {
                restoreFromBackupCode(backupCode);
                getSettings(function(bodyContent) {
                    body.innerHTML = bodyContent;
                });
            }
        });
    });

    upsellOpportunityConfig.addEventListener('click', function() {
        const upsellPage = chrome.runtime.getURL('./upsell.html');
        chrome.tabs.create({url: upsellPage});
    });

    chrome.storage.local.get(['legacyTicketState', 'quickLinksState', 'lastUpdatedState', 'chargesLinkState', 'forceSingleState', 'registerHistoryState', 'upsellOpportunityState', 'global24hTimeState'], function(result) {
        legacyTicketToggle.checked = result.legacyTicketState === true;
        quickLinksToggle.checked = result.quickLinksState === true;
        lastUpdatedToggle.checked = result.lastUpdatedState === true;
        chargesLinkToggle.checked = result.chargesLinkState === true;
        forceSingleToggle.checked = result.forceSingleState === true;
        registerHistoryToggle.checked = result.registerHistoryState === true;
        upsellOpportunityToggle.checked = result.upsellOpportunityState === true;
        global24hTimeToggle.checked = result.global24hTimeState === true;
    });

    let legacyTicketState, quickLinksState, lastUpdatedState, chargesLinkState, forceSingleState, registerHistoryState, upsellOpportunityState, global24hTimeState;
    function updateStates() {
        legacyTicketState = legacyTicketToggle.checked;
        quickLinksState = quickLinksToggle.checked;
        lastUpdatedState = lastUpdatedToggle.checked;
        chargesLinkState = chargesLinkToggle.checked;
        forceSingleState = forceSingleToggle.checked;
        registerHistoryState = registerHistoryToggle.checked;
        upsellOpportunityState = upsellOpportunityToggle.checked;
        global24hTimeState = global24hTimeToggle.checked;
    }

    legacyTicketToggle.addEventListener('change', updateStates);
    quickLinksToggle.addEventListener('change', updateStates);
    lastUpdatedToggle.addEventListener('change', updateStates);
    chargesLinkToggle.addEventListener('change', updateStates);
    forceSingleToggle.addEventListener('change', updateStates);
    registerHistoryToggle.addEventListener('change', updateStates);
    upsellOpportunityToggle.addEventListener('change', updateStates);
    global24hTimeToggle.addEventListener('change', updateStates);

    // when the apply button is pressed: save all settings to storage, close the popup window, and refresh the page if on repairshopr
    applyButton.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.storage.local.set({
                legacyTicketState: legacyTicketState,
                quickLinksState: quickLinksState,
                lastUpdatedState: lastUpdatedState,
                chargesLinkState: chargesLinkState,
                forceSingleState: forceSingleState,
                registerHistoryState: registerHistoryState,
                upsellOpportunityState: upsellOpportunityState,
                global24hTimeState: global24hTimeState
            });
            
            window.close();

            if (tabs[0].url.includes('repairshopr')) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    });
})

// take all local values saved and create an html block to display the content
function getSettings(callback) {
    chrome.storage.local.get(null, function(items) {
        let bodyContent = '';
        for (let key in items) {
            bodyContent += `<p>${key}: ${items[key]}</p>`;
        }
        callback(bodyContent);
    });
}

// take all local values and encode its contents into a backup code
function generateBackupCode(callback) {
    chrome.storage.local.get(null, function(items) {
        const backupData = JSON.stringify(items);
        const backupCode = encodeBackupData(backupData);
        callback(backupCode);
    });
}

// decode the backup code into values to be saved locally
function restoreFromBackupCode(backupCode) {
    const decodedData = decodeBackupCode(backupCode);
    const restoredSettings = JSON.parse(decodedData);
    chrome.storage.local.set(restoredSettings);
}

// convert data to a base64 encoded string
function encodeBackupData(data) {
    const backupCode = document.getElementById('backupCodeInput');
    try {
        return btoa(data);
    } catch {
        
    }
}

// convert the base64 encoded string back to its original form
function decodeBackupCode(backupCode) {
    try {
        return atob(backupCode);
    } catch {

    }
}
