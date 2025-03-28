chrome.storage.local.get(['upsellOpportunityState'], function(result) {
    if (result.upsellOpportunityState) {
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

        // observer is triggered as soon as add/view charges window is opened
        observer.observe(popupDisplay, {attributes: true});


        function createItems(items) {
            const chargesWindow = popupDisplay.querySelector('.modal-content');
            const upsellItemsWrapper = document.createElement('div');
            upsellItemsWrapper.classList.add('item-wrapper');

            // generate a button for each item saved in the upsell config
            Object.keys(items).forEach(item => {
                const btn = document.createElement('button');
                btn.classList.add('item-btn');
                btn.textContent = '+ ' + items[item]['item'];
                btn.addEventListener('click', function() {
                    addCharge(items[item]['upc']);
                });
                upsellItemsWrapper.appendChild(btn);
            });

            chargesWindow.insertBefore(upsellItemsWrapper, chargesWindow.querySelector('.modal-footer'));
        }

        function addCharge(upc) {
            const nameInput = document.getElementById('ticket_line_item_name');
            const addButton = popupDisplay.querySelector('Input.btn');
            
            nameInput.value = upc;
            addButton.click();
        }
    }
});
