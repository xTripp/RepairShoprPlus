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
    upsellItemsWrapper.classList.add('item-wrapper');

    Object.keys(items).forEach(item => {
        let btn = document.createElement('button');
        btn.classList.add('item-btn');
        btn.textContent = '+ ' + items[item]['item'];
        btn.addEventListener('click', addCharge(items[item]['upc']));
        upsellItemsWrapper.appendChild(btn);
    });

    chargesWindow.insertBefore(upsellItemsWrapper, chargesWindow.querySelector('.modal-footer'));
}

function addCharge(upc) {
    
}
