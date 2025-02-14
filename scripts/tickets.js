// replace the customer link with the corresponding ticket link and observe all changes made to the tickets to make sure the links stay set correctly
function replaceCustomerLink(row) {
    const customerLink = Array.from(row.querySelectorAll('a')).find(link => link.href.includes('/customers/'));
    const ticketLink = Array.from(row.querySelectorAll('a')).find(link => link.href.includes('/tickets/'));

    // clone the customer link and update its href
    const newCustomerLink = customerLink.cloneNode(true);
    newCustomerLink.href = ticketLink.href;

    // replace the old customer link with the new one
    customerLink.parentNode.replaceChild(newCustomerLink, customerLink);

    // detect changes to the other ticket table fields and set a new observer if there isn't one already
    if (!row._mutationObserver) {
        const config = { subtree: true, attributes: true, attributeFilter: ['data-bip-value'] };
        const observer = new MutationObserver(() => {
            setTimeout(() => {
                initializeTicketTable();
            }, 500);
        });

        observer.observe(row, config);
        row._mutationObserver = observer;
    }
}


// Quick links is deprecated as of V1.7 since no viable solution fixes its functionality.
// tickets.css has been removed from the manifest but the file is still in the /styles directory and assets are still available in the /assets/images directory
// if this is re-enabled make sure to include 'quickLinksState' in chrome.storage.sync.get() in the initializeTicketTable() function

/* // create a quick link for each ticket and direct it to the link that is in the most recent comment if there is one
function createQuickLink(row){
    const buttonContainer = document.createElement('td');
    const qlButton = document.createElement('button');
    const qlPreview = document.createElement('span');
    qlButton.classList.add('qlButton', 'tooltip-container');
    qlPreview.classList.add('tooltip-text');

    // define all visual characteristics of QL button and QL Preview
    const bgColor = window.getComputedStyle(document.body, null).getPropertyValue('color');
    let internalBorder, externalBorder;
    qlPreview.style.left = '30%';
    if (bgColor === 'rgb(51, 51, 51)') {
        qlButton.style.backgroundImage = `url(${chrome.runtime.getURL('/../assets/images/link_black.png')})`;
        qlButton.style.backgroundColor = 'white';
        qlButton.style.border = '2px solid #eaeaea';
        internalBorder = '2px solid #0277bd';
        externalBorder = '2px solid #ff8f00';
    } else {
        qlButton.style.backgroundImage = `url(${chrome.runtime.getURL('/../assets/images/link_white.png')})`;
        qlButton.style.backgroundColor = 'rgb(54, 54, 54)';
        qlButton.style.border = '2px solid transparent';
        internalBorder = '2px solid #4fc3f7';
        externalBorder = '2px solid #ffca28';
    }

    // get JSON response from the ticket's qv_extra url. The JSON response will return the last note on the ticket
    // TODO: this assumes that the ticket links must be on column 4 but that isn't always the case, fix this 
    const ticketQvDataURL = row.querySelector('td:nth-child(4) a[href^="/tickets/"]') + '/qv_extra';
    fetch(ticketQvDataURL)
        .then(response => {
            if (!response.ok) {
                console.log(`Error ${response.status}: Did not receive 'ok' response from request @ ${ticketQvDataURL}`);
            }
            return response.json();
        })
        .then(data => {
            const lastComm = data.ticket.lastComment.body;
            const links = Array.from(new DOMParser().parseFromString(lastComm, 'text/html').querySelectorAll('a[href]'));
            
            if (links.length > 0) {
                if (links[0].hostname) {
                    qlPreview.textContent = links[0].hostname;
                } else {
                    qlPreview.textContent = links[0];
                }
                qlPreview.style.minWidth = 'fit-content';

                // determine if the link is internal or external
                if (window.location.hostname === links[0].hostname) {
                    qlButton.style.border = internalBorder;
                } else {
                    qlButton.style.border = externalBorder;
                }

                // open each link in the comment
                qlButton.addEventListener('click', function() {
                    links.forEach(link => {
                        const url = link.getAttribute('href');
                        window.open(url, '_blank');
                    });
                });
            } else {
                qlPreview.textContent = 'No link found.';
                qlPreview.style.minWidth = '100px';
            }
        })

    qlButton.appendChild(qlPreview);
    buttonContainer.appendChild(qlButton);
    row.appendChild(buttonContainer);
}

// initializes the header for the quick link column
function setQuickLinkHeader() {
    const header = ticketTable.querySelector('thead tr');
    const qlHeaderContainer = document.createElement('th');
    const qlHeader = document.createElement('a');
    const qlTooltip = document.createElement('span');
    const qlTooltipText =
        'A QuickLink will open all links in the most recent note for the selected ticket.<br><br>' +
        '<span style="display: inline-block; width: 8px; height: 8px; background-color: #4fc3f7; border-radius: 50%;"></span>' +
        '<span style="vertical-align: middle;">  Internal Link</span><br>' +
        '<span style="display: inline-block; width: 8px; height: 8px; background-color: #ffca28; border-radius: 50%;"></span>' +
        '<span style="vertical-align: middle;">  External Link</span>';

    qlHeader.classList.add('fas', 'fa-question-circle', 'help-icon', 'tooltip-container');
    qlTooltip.classList.add('tooltip-text');

    qlTooltip.innerHTML = qlTooltipText;

    qlHeader.appendChild(qlTooltip);
    qlHeaderContainer.appendChild(qlHeader);
    header.appendChild(qlHeaderContainer);
} */


// turns each 'charges' field to a button if enabled that is able to add charges directly from the tickets page
function createChargesLink(row) {
    setTimeout(() => {
        // build the charges button
        const chargesWindow = document.getElementById('ajax-modal-alt');
        const charges = row.querySelector('.ticket-charges');
        const rootURL = row.querySelector('.typed-pretty-link').href;
        const chargesURL = rootURL + '/view_charges';
        const chargesLink = document.createElement('a');
        chargesLink.classList.add('btn', 'btn-default', 'btn-sm', 'ajax-modalize-alt', 'bhv-ChargesBtn', 'ticket-charges');

        // set the button and wait for a click
        chargesLink.href = chargesURL;
        chargesLink.innerHTML = charges.innerHTML;
        chargesLink.addEventListener('click', function() {
            setTimeout(() => {
                handleChargesWindow(chargesWindow);
            }, 200);
        });

        charges.parentNode.replaceChild(chargesLink, charges);
    }, 500);
}

// observe if changes are made and listen to button presses
function handleChargesWindow(chargesWindow) {
    let changesMade = false;
    const currentItems = chargesWindow.querySelector('tbody');
    const addItemButton = chargesWindow.querySelector('.btn-success');
    const xButton = chargesWindow.querySelector('.close');
    const closeButton = chargesWindow.querySelector('.btn-default');

    // if items are added or removed from the current items list, then make changesMade true
    const chargesObserver = new MutationObserver(() => changesMade = true);
    addItemButton.addEventListener('click', () => changesMade = true);
    chargesObserver.observe(currentItems, { attributes: true });    

    // reload the page if the charges window was closed and changesMade is true
    xButton.addEventListener('click', function() { changesMade && location.reload() });
    closeButton.addEventListener('click', function() { changesMade && location.reload() });
}


// initializes each row of the ticket table as specified
function initializeTicketTable() {
    const rows = ticketTable.querySelectorAll('tbody tr');
    
    chrome.storage.sync.get(['legacyTicketState', 'lastUpdatedState', 'chargesLinkState', 'forceSingleState'], function(result) {
        // changes the customer link to the ticket link
        if (result.legacyTicketState) {
            rows.forEach((row) => {
                replaceCustomerLink(row);
            });
        }

        // Quick links is deprecated as of V1.7 since no viable solution fixes its functionality.
        /* // inserts quick links onto the end of each row
        if (result.quickLinksState) {
            setQuickLinkHeader();
            rows.forEach((row) => {
                createQuickLink(row);
            });
        } */

        // removes the last updated color tags
        if (result.lastUpdatedState) {
            rows.forEach((row) => {
                const updatedTag = row.querySelector('.badge');
                if (updatedTag) {
                    updatedTag.classList.remove('badge', 'badge-square', 'badge-warning', 'badge-error');
                }
            });
        }

        // replaces the charges text with a button that opens the add/view charges widget
        if (result.chargesLinkState) {
            rows.forEach((row) => {
                createChargesLink(row);
            });
        }

        // forces all tickets onto a single line
        if (result.forceSingleState) {
            const tableParent = document.querySelector("#wrapper > div.main > div > div > div.row");
            const tableContainer = document.querySelector("#wrapper > div.main > div > div");
            tableParent.style.whiteSpace = 'nowrap';
            tableContainer.style.width = 'fit-content';
        }
    });

    // this adds an observer if there is not one already to the ticket table. It will detect changes to the children and reinitilaize the table if triggered
    const hasObserver = ticketTable._mutationObserver;
    if (!hasObserver) {
        const tableObserver = new MutationObserver(() => {
            setTimeout(() => {
                initializeTicketTable();
            }, 500);
        });
        
        tableObserver.observe(ticketTable, {childList: true});
        ticketTable._mutationObserver = tableObserver;
    }
}

// entry point
const ticketTable = document.getElementById('bhv-ticketTable');
initializeTicketTable();
