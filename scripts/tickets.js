// replace the customer link with the corresponding ticket link and observe all changes made to the tickets to make sure the links stay set correctly
function replaceCustomerLink(row) {
  // TODO: this assumes that the customer and ticket links must be on columns 3 and 4 but that isn't always the case, fix this
  const customerLink = row.querySelector('td:nth-child(3) a[href^="/customers/"]');
  const ticketLink = row.querySelector('td:nth-child(4) a[href^="/tickets/"]');

  const newCustomerLink = customerLink.cloneNode(true);
  newCustomerLink.textContent = customerLink.textContent;
  newCustomerLink.href = ticketLink.href;

  customerLink.parentNode.replaceChild(newCustomerLink, customerLink);

  // this will detect changes to the status and tech fields and set a new observer if there is not one already
  const hasObserver = row._mutationObserver;
  if (!hasObserver) {
    const config = {subtree: true, attributes: true, attributeFilter: ['data-bip-value']};
    const observer = new MutationObserver(() => {
      setTimeout(initializeTicketTable, 500);
    });

    observer.observe(row, config);
    row._mutationObserver = observer;
  }
}

// create a quick link for each ticket and direct it to the link that is in the most recent comment if there is one
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
    qlButton.style.backgroundImage = `url(${chrome.runtime.getURL('/assets/link_black.png')})`;
    qlButton.style.backgroundColor = 'white';
    qlButton.style.border = '2px solid #eaeaea';
    internalBorder = '2px solid #0277bd';
    externalBorder = '2px solid #ff8f00';
  } else {
    qlButton.style.backgroundImage = `url(${chrome.runtime.getURL('/assets/link_white.png')})`;
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
}

// turns each 'charges' field to a button that is able to add charges directly from the tickets screen
function createChargesLink(row) {
  setTimeout(() => {
    const chargesWindow = document.getElementById('ajax-modal-alt');
    const charges = row.querySelector('.ticket-charges');
    const rootURL = row.querySelector('.typed-pretty-link').href;
    const chargesURL = rootURL + '/view_charges';
    const chargesLink = document.createElement('a');
    chargesLink.classList.add('btn', 'btn-default', 'btn-sm', 'ajax-modalize-alt', 'bhv-ChargesBtn', 'ticket-charges');
  
    chargesLink.href = chargesURL;
    chargesLink.innerHTML = charges.innerHTML;
    chargesLink.addEventListener('click', function() {
      setTimeout(() => {
        handleChargesWindow(chargesWindow);
      }, 500);  // wait for content to load
    });
  
    charges.parentNode.replaceChild(chargesLink, charges);
  }, 500);  // prevent button from loading before charges values
}

// observe if changes are made and listen to button presses
function handleChargesWindow(chargesWindow) {
  let changesMade = false;
  const currentItems = chargesWindow.querySelector('tbody');
  const addItemButton = chargesWindow.querySelector('.btn-success');
  const xButton = chargesWindow.querySelector('.close');
  const closeButton = chargesWindow.querySelector('.btn-default');

  // if items are added or removed from the current items list, then make changesMade true
  const chargesConfig = {attributes: true};
  const chargesObserver = new MutationObserver(() => {
    changesMade = true;
  });
  addItemButton.addEventListener('click', function() {
    changesMade = true;
  });
  chargesObserver.observe(currentItems, chargesConfig);

  // reload the page if the charges window was closed and changesMade is true
  xButton.addEventListener('click', function() {
    if (changesMade) {
      location.reload();
    }
  });
  closeButton.addEventListener('click', function() {
    if (changesMade) {
      location.reload();
    }
  });
}


// initializes each row of the ticket table as specified
function initializeTicketTable() {
  const rows = ticketTable.querySelectorAll('tbody tr');
  
  chrome.storage.local.get(['legacyTicketState', 'quickLinksState', 'lastUpdatedState', 'chargesLinkState', 'forceSingleState'], function(result) {
    // changes the customer link to the ticket link
    if (result.legacyTicketState) {
      rows.forEach((row) => {
        replaceCustomerLink(row);
      });
    }

    // forces all tickets onto a single line
    if (result.forceSingleState) {
      // TODO: is this failproof? is the tableParent and tableContainer always at this path?
      const tableParent = document.querySelector('#wrapper > div.main > div > div > div.row');
      const tableContainer = document.querySelector('#wrapper > div.main > div > div');
      tableParent.style.whiteSpace = 'nowrap';
      tableContainer.style.width = 'fit-content';
    }

    // inserts quick links onto the end of each row
    if (result.quickLinksState) {
      setQuickLinkHeader();
      rows.forEach((row) => {
        createQuickLink(row);
      });
    }

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
      setTimeout(() => {
        const chargesButton = document.querySelector('.bhv-ChargesBtn');
        const spinner = chargesButton.querySelector('.fa-spin');
        
        // if the charges buttons are stuck on a spinner, this payload will refresh the first ticket in the table to refresh all users
        if (spinner) {
          const authToken = document.getElementsByName('csrf-token')[0].getAttribute('content');
          const firstTicketStatus = document.querySelector('.best_in_place').textContent;
          const firstTicketURL = document.querySelector('.typed-pretty-link').href;
          const refreshPayload = {
            _method: "put",
            "ticket[status]": firstTicketStatus,
            authenticity_token: authToken,
          };

          fetch(firstTicketURL, {
            method: "PUT",
            headers: {
                "Accept": "application/json",
            },
            body: new URLSearchParams(refreshPayload)
          });
        }
      }, 3000);  // wait 3 seconds, then see if the spinner is active
    }
  });

  const hasObserver = ticketTable._mutationObserver;
  if (!hasObserver) {
    const tableConfig = {childList: true};
    const tableObserver = new MutationObserver(() => {
      initializeTicketTable();
    });

    tableObserver.observe(ticketTable, tableConfig);
    ticketTable._mutationObserver = tableObserver;
  }
}

// entry point
const ticketTable = document.getElementById('bhv-ticketTable');
initializeTicketTable();
