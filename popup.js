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
    const paymentSettingsToggle = document.getElementById('option9');
    const upsellOpportunityConfig = document.getElementById('config7');
    const applyButton = document.getElementById('apply');

    logo.addEventListener('click', loadSettingsPage);
    upsellOpportunityConfig.addEventListener('click', function() {
        chrome.tabs.create({url: chrome.runtime.getURL('./upsell.html')});
    });

    chrome.storage.local.get(
        ['legacyTicketState', 'quickLinksState', 'lastUpdatedState', 'chargesLinkState', 'forceSingleState', 'registerHistoryState', 'upsellOpportunityState', 'global24hTimeState', 'paymentSettingsState'],
        function(result) {
            legacyTicketToggle.checked = result.legacyTicketState === true;
            quickLinksToggle.checked = result.quickLinksState === true;
            lastUpdatedToggle.checked = result.lastUpdatedState === true;
            chargesLinkToggle.checked = result.chargesLinkState === true;
            forceSingleToggle.checked = result.forceSingleState === true;
            registerHistoryToggle.checked = result.registerHistoryState === true;
            upsellOpportunityToggle.checked = result.upsellOpportunityState === true;
            global24hTimeToggle.checked = result.global24hTimeState === true;
            paymentSettingsToggle.checked = result.paymentSettingsState === true;
    });

    let legacyTicketState, quickLinksState, lastUpdatedState, chargesLinkState, forceSingleState, registerHistoryState, upsellOpportunityState, global24hTimeState, paymentSettingsState;
    function updateStates() {
        legacyTicketState = legacyTicketToggle.checked;
        quickLinksState = quickLinksToggle.checked;
        lastUpdatedState = lastUpdatedToggle.checked;
        chargesLinkState = chargesLinkToggle.checked;
        forceSingleState = forceSingleToggle.checked;
        registerHistoryState = registerHistoryToggle.checked;
        upsellOpportunityState = upsellOpportunityToggle.checked;
        global24hTimeState = global24hTimeToggle.checked;
        paymentSettingsState = paymentSettingsToggle.checked
    }

    legacyTicketToggle.addEventListener('change', updateStates);
    quickLinksToggle.addEventListener('change', updateStates);
    lastUpdatedToggle.addEventListener('change', updateStates);
    chargesLinkToggle.addEventListener('change', updateStates);
    forceSingleToggle.addEventListener('change', updateStates);
    registerHistoryToggle.addEventListener('change', updateStates);
    upsellOpportunityToggle.addEventListener('change', updateStates);
    global24hTimeToggle.addEventListener('change', updateStates);
    paymentSettingsToggle.addEventListener('change', updateStates);

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
                global24hTimeState: global24hTimeState,
                paymentSettingsState: paymentSettingsState
            });
            
            window.close();

            if (tabs[0].url.includes('repairshopr')) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    });
})

// load import/export settings menu
function loadSettingsPage() {
    const body = document.querySelector('.menu');
    body.classList.add('settings-body');
    const footer = document.querySelector('.footer');
    footer.classList.add('settings-footer')

    let footerContent = '';
    footerContent += '<div><button id="exportButton">Copy Settings Backup Code to Clipboard</button></div>';
    footerContent += '<div><input id="backupCodeInput" type="text" placeholder="Paste backup code here"></input><button id="importButton">Import Settings</button></div>';
    footer.innerHTML = footerContent;

    getSettings(function(bodyContent) {
        body.innerHTML = bodyContent;
    });

    // generate a base64 backup code and copy it to the clipboard
    document.getElementById('exportButton').addEventListener('click', function() {
        generateBackupCode(function(backupCode) {
            navigator.clipboard.writeText(backupCode);
        });
        this.textContent = 'Backup code copied!';
        this.classList.add('success');
        this.addEventListener('animationend', function() {
            this.classList.remove('success');
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
}

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
function restoreFromBackupCode(code) {
    const decodedData = decodeBackupCode(code);
    const backupCode = document.getElementById('backupCodeInput');
    backupCode.className = '';
    backupCode.value = '';
    
    try {
        const restoredSettings = JSON.parse(decodedData);
        chrome.storage.local.set(restoredSettings);
        backupCode.classList.add('valid-placeholder');
        backupCode.setAttribute('placeholder', 'Settings imported successfully!');
    } catch {
        backupCode.classList.add('invalid-placeholder');
        backupCode.setAttribute('placeholder', 'Invalid backup code. Try again.');
    }
}

// convert data to a base64 encoded string
function encodeBackupData(data) {
    return btoa(data);
}

// convert the base64 encoded string back to its original form
function decodeBackupCode(data) {    
    try {
        return atob(data);
    } catch {
        const backupCode = document.getElementById('backupCodeInput');
        backupCode.className = '';
        backupCode.classList.add('invalid-placeholder');
        backupCode.setAttribute('placeholder', 'Invalid backup code. Try again.');
    }
}
