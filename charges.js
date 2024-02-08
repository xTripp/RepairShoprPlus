const popupDisplay = document.getElementById('ajax-modal-alt');
const observer = new MutationObserver(mutationsList => {
    mutationsList.forEach(mutation => {
        if (mutation.attributeName === 'style') {
            const style = popupDisplay.getAttribute('style');
            if (style.includes('display: block')) {
                chrome.storage.local.get(['items'], function(result) {
                    if (result.items) {
                        createItems(result.items);
                    }
                });
            }
        }
    });
});

observer.observe(popupDisplay, {attributes: true});


function createItems(items) {
    const chargesWindow = popupDisplay.querySelector('.modal-content');
    const upsellItemsWrapper = document.createElement('div');
    
    chargesWindow.appendChild(upsellItemsWrapper);
}

function addCharge() {
    
}

function removeCharge() {

}
