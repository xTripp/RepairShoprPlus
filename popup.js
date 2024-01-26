document.addEventListener('DOMContentLoaded', function() {
    const legacyTicketToggle = document.getElementById('option1');
    const quickLinksToggle = document.getElementById('option2');
    const lastUpdatedToggle = document.getElementById('option3');
    const chargesLinkToggle = document.getElementById('option4');
    const forceSingleToggle = document.getElementById('option5');
    const registerHistoryToggle = document.getElementById('option6');
    const applyButton = document.getElementById('apply');

    chrome.storage.local.get(['legacyTicketState', 'quickLinksState', 'lastUpdatedState', 'chargesLinkState', 'forceSingleState', 'registerHistoryState'], function(result) {
        legacyTicketToggle.checked = result.legacyTicketState === true;
        quickLinksToggle.checked = result.quickLinksState === true;
        lastUpdatedToggle.checked = result.lastUpdatedState === true;
        chargesLinkToggle.checked = result.chargesLinkState === true;
        forceSingleToggle.checked = result.forceSingleState === true;
        registerHistoryToggle.checked = result.registerHistoryState === true;
    });

    let legacyTicketState, quickLinksState, lastUpdatedState, chargesLinkState, forceSingleState, registerHistoryState;
    function updateStates() {
        legacyTicketState = legacyTicketToggle.checked;
        quickLinksState = quickLinksToggle.checked;
        lastUpdatedState = lastUpdatedToggle.checked;
        chargesLinkState = chargesLinkToggle.checked;
        forceSingleState = forceSingleToggle.checked;
        registerHistoryState = registerHistoryToggle.checked;
    }

    legacyTicketToggle.addEventListener('change', updateStates);
    quickLinksToggle.addEventListener('change', updateStates);
    lastUpdatedToggle.addEventListener('change', updateStates);
    chargesLinkToggle.addEventListener('change', updateStates);
    forceSingleToggle.addEventListener('change', updateStates);
    registerHistoryToggle.addEventListener('change', updateStates);

    // when the apply button is pressed: save all settings to storage, close the popup window, and refresh the page if on repairshopr
    applyButton.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.storage.local.set({
                legacyTicketState: legacyTicketState,
                quickLinksState: quickLinksState,
                lastUpdatedState: lastUpdatedState,
                chargesLinkState: chargesLinkState,
                forceSingleState: forceSingleState,
                registerHistoryState: registerHistoryState
            });
            
            window.close();

            if (tabs[0].url.includes('repairshopr')) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    });

})
