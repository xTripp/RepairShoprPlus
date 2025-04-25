document.addEventListener('DOMContentLoaded', function () {
    // Define all buttons from the DOM
    const logo = document.getElementById('logo');
    const legacyTicketToggle = document.getElementById('option1');
    const lastUpdatedToggle = document.getElementById('option3');
    const chargesLinkToggle = document.getElementById('option4');
    const forceSingleToggle = document.getElementById('option5');
    const registerHistoryToggle = document.getElementById('option6');
    const upsellOpportunityToggle = document.getElementById('option7');
    const global24hTimeToggle = document.getElementById('option8');
    const paymentSettingsToggle = document.getElementById('option9');
    const colorCodedToggle = document.getElementById('option10');
    const upsellOpportunityConfig = document.getElementById('config7');
    const colorCodedConfig = document.getElementById('config10');
    const applyButton = document.getElementById('apply');

    logo.addEventListener('click', loadSettingsPage);

    upsellOpportunityConfig.addEventListener('click', () => {
        chrome.tabs.create({url: chrome.runtime.getURL('/../pages/app/upsell.html')});
    });
    colorCodedConfig.addEventListener('click', () => {
        chrome.tabs.create({url: chrome.runtime.getURL('/../pages/app/colors.html')});
    });

    // Load and set toggle states from storage
    chrome.storage.local.get([
        'legacyTicketState', 'lastUpdatedState', 'chargesLinkState', 'forceSingleState',
        'registerHistoryState', 'upsellOpportunityState', 'global24hTimeState',
        'paymentSettingsState', 'colorCodedState'
    ], result => {
        legacyTicketToggle.checked = !!result.legacyTicketState;
        lastUpdatedToggle.checked = !!result.lastUpdatedState;
        chargesLinkToggle.checked = !!result.chargesLinkState;
        forceSingleToggle.checked = !!result.forceSingleState;
        registerHistoryToggle.checked = !!result.registerHistoryState;
        upsellOpportunityToggle.checked = !!result.upsellOpportunityState;
        global24hTimeToggle.checked = !!result.global24hTimeState;
        paymentSettingsToggle.checked = !!result.paymentSettingsState;
        colorCodedToggle.checked = !!result.colorCodedState;
    });

    // When the apply button is pressed, save all settings currently
    applyButton.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            chrome.storage.local.set({
                legacyTicketState: legacyTicketToggle.checked,
                lastUpdatedState: lastUpdatedToggle.checked,
                chargesLinkState: chargesLinkToggle.checked,
                forceSingleState: forceSingleToggle.checked,
                registerHistoryState: registerHistoryToggle.checked,
                upsellOpportunityState: upsellOpportunityToggle.checked,
                global24hTimeState: global24hTimeToggle.checked,
                paymentSettingsState: paymentSettingsToggle.checked,
                colorCodedState: colorCodedToggle.checked
            });

            window.close();

            if (tabs[0].url.includes('repairshopr')) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    });
});


// Render all inner settings page content and button control
function loadSettingsPage() {
    const body = document.querySelector('.menu');
    body.classList.add('settings-body');
    const footer = document.querySelector('.footer');
    footer.classList.add('settings-footer');

    footer.innerHTML = `
        <div><button id="exportButton">Copy Full Settings Backup Code</button></div>
        <div><button id="exportColorsButton">Copy Colors-only Backup Code</button></div>
        <div><input id="backupCodeInput" type="text" placeholder="Paste any backup code here"><button id="importButton">Import</button></div>
    `;

    getSettings(bodyContent => {
        body.innerHTML = bodyContent;
    });

    // Generate backup codes for all settings and color settings
    document.getElementById('exportButton').addEventListener('click', function () {
        generateBackupCode(backup => {
            navigator.clipboard.writeText(backup);
        });
        showSuccess(this, 'Full backup code copied!');
    });

    document.getElementById('exportColorsButton').addEventListener('click', function () {
        generateColorBackupCode(backup => {
            navigator.clipboard.writeText(backup);
        });
        showSuccess(this, 'Color backup code copied!');
    });

    // Detect long press to copy raw JSON
    let pressTimer;
    const exportButton = document.getElementById('exportButton');
    const exportColorsButton = document.getElementById('exportColorsButton');

    exportButton.addEventListener('mousedown', function () {
        pressTimer = setTimeout(() => {
            // Long press detected, copy raw JSON
            chrome.storage.local.get(null, items => {
                const jsonBackup = JSON.stringify(items, null, 2);
                navigator.clipboard.writeText(jsonBackup);
                showSuccess(exportButton, 'Debug code copied');
            });
        }, 2000);
    });
    exportButton.addEventListener('mouseup', () => clearTimeout(pressTimer));
    exportButton.addEventListener('mouseout', () => clearTimeout(pressTimer));

    exportColorsButton.addEventListener('mousedown', function () {
        pressTimer = setTimeout(() => {
            // Long press detected, copy raw JSON for colors
            chrome.storage.local.get(['colors', 'bipcolors'], items => {
                const jsonBackup = JSON.stringify(items, null, 2);
                navigator.clipboard.writeText(jsonBackup);
                showSuccess(exportColorsButton, 'Debug code copied');
            });
        }, 2000);
    });
    exportColorsButton.addEventListener('mouseup', () => clearTimeout(pressTimer));
    exportColorsButton.addEventListener('mouseout', () => clearTimeout(pressTimer));

    // Handle importing codes or raw JSON
    document.getElementById('importButton').addEventListener('click', function () {
        const input = document.getElementById('backupCodeInput');
        const code = input.value.trim();
        input.className = '';
        input.value = '';
    
        if (!code) return;
    
        try {
            let parsed;
    
            // Check if the code is base64 encoded
            if (isBase64(code)) {
                const decoded = decodeBackupCode(code);
                parsed = JSON.parse(decoded);
            } else {
                parsed = JSON.parse(code);  // Assume it is raw JSON
            }
    
            let keysToImport = parsed;
    
            // If it's just a color backup, filter keys
            if (Object.keys(parsed).every(key => ['colors', 'bipcolors'].includes(key))) {
                keysToImport = {};
                if (parsed.colors) keysToImport.colors = parsed.colors;
                if (parsed.bipcolors) keysToImport.bipcolors = parsed.bipcolors;
            }
    
            // Store the parsed keys in local storage
            chrome.storage.local.set(keysToImport, () => {
                input.classList.add('valid-placeholder');
                input.setAttribute('placeholder', 'Settings imported successfully!');
            });
    
        } catch (error) {
            input.classList.add('invalid-placeholder');
            input.setAttribute('placeholder', 'Invalid backup code. Try again.');
        }
    });
    
    function isBase64(str) {
        try {
            return btoa(atob(str)) === str;
        } catch (err) {
            return false;
        }
    }    
}

// Print out all settings in a readable format
function getSettings(callback) {
    chrome.storage.local.get(null, items => {
        let html = '';
        for (let key in items) {
            html += `<p>${key}: ${JSON.stringify(items[key])}</p>`;
        }
        callback(html);
    });
}

// Generate a backup code for all settings
function generateBackupCode(callback) {
    chrome.storage.local.get(null, items => {
        const encoded = encodeBackupData(JSON.stringify(items));
        callback(encoded);
    });
}

// Generate a backup code for only colors
function generateColorBackupCode(callback) {
    chrome.storage.local.get(['colors', 'bipcolors'], items => {
        const encoded = encodeBackupData(JSON.stringify(items));
        callback(encoded);
    });
}

function encodeBackupData(data) {
    return btoa(data);
}

function decodeBackupCode(data) {
    return atob(data);
}

// Display a success message when the backup code is successfully decoded
function showSuccess(button, message) {
    button.textContent = message;
    button.classList.add('success');
    button.addEventListener('animationend', () => {
        button.classList.remove('success');
    }, {once: true});
}