class Item {
    constructor() {
        this.row = document.createElement('tr');
        this.name = document.createElement('td');
        this.upc = document.createElement('td');
        this.itemInputBox = document.createElement('input');
        this.upcInputBox = document.createElement('input');
        this.actionButton = document.createElement('button');
        this.addItem = this.addItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
    }

    create(itemValue, upcValue) {
        const action = document.createElement('td');
    
        const itemInputWrapper = document.createElement('div');
        itemInputWrapper.classList.add('input-wrapper');
        this.itemInputBox.classList.add('input-box');
        this.itemInputBox.setAttribute('type', 'text');
        this.itemInputBox.setAttribute('placeholder', 'Item name (will display in the add/view charges window)');
        const itemInputUnderline = document.createElement('span');
        itemInputUnderline.classList.add('underline');
        itemInputWrapper.appendChild(this.itemInputBox);
        itemInputWrapper.appendChild(itemInputUnderline);
    
        const upcInputWrapper = document.createElement('div');
        upcInputWrapper.classList.add('input-wrapper');
        this.upcInputBox.classList.add('input-box');
        this.upcInputBox.setAttribute('type', 'text');
        this.upcInputBox.setAttribute('placeholder', 'UPC Code (internal code assigned to the item)');
        const upcInputUnderline = document.createElement('span');
        upcInputUnderline.classList.add('underline');
        upcInputWrapper.appendChild(this.upcInputBox);
        upcInputWrapper.appendChild(upcInputUnderline);
    
        this.actionButton.classList.add('action-button', 'create');
        this.actionButton.addEventListener('click', this.addItem);
        this.actionButton.textContent = '✓';

        this.name.appendChild(itemInputWrapper);
        this.upc.appendChild(upcInputWrapper);
        action.appendChild(this.actionButton);
    
        this.row.appendChild(this.name);
        this.row.appendChild(this.upc);
        this.row.appendChild(action);
    
        document.querySelector('tbody').insertBefore(this.row, tableAnchor);

        if (itemValue && upcValue) {
            this.itemInputBox.value = itemValue;
            this.upcInputBox.value = upcValue;
            this.actionButton.click();
        }
    }

    // Character limit?
    addItem() {
        if (this.itemInputBox.value.trim() !== '' && this.upcInputBox.value.trim() !== '') {
            this.name.innerHTML = this.itemInputBox.value;
            this.upc.innerHTML = this.upcInputBox.value;
    
            this.actionButton.removeEventListener('click', this.addItem);
            this.actionButton.addEventListener('click', this.removeItem);
            this.actionButton.classList.remove('create');
            this.actionButton.classList.add('delete');
            this.actionButton.textContent = 'Ｘ';

            this.row.style.cursor = 'all-scroll';
            this.row.draggable = true;
            this.row.addEventListener('dragstart', dragStart);
            this.row.addEventListener('dragover', dragOver);
            this.row.addEventListener('dragend', dragEnd);
        } else {
            if (this.itemInputBox.value.trim() == '') {
                this.itemInputBox.classList.add('invalid');
                this.itemInputBox.addEventListener('animationend', function() {
                    this.classList.remove('invalid');
                }, { once: true });

                this.itemInputBox.classList.add('invalid-placeholder');
                this.itemInputBox.setAttribute('placeholder', 'Item name is a required field');
            }
            if (this.upcInputBox.value.trim() == '') {
                this.upcInputBox.classList.add('invalid');
                this.upcInputBox.addEventListener('animationend', function() {
                    this.classList.remove('invalid');
                }, { once: true });

                this.upcInputBox.classList.add('invalid-placeholder');
                this.upcInputBox.setAttribute('placeholder', 'Item UPC is a required field');
            }
        }

        saveState();
    }

    removeItem() {
        this.row.remove();
        saveState();
    }
}


// ENTRY POINT
document.addEventListener('DOMContentLoaded', loadState);

const itemTable = document.getElementById('upsell-items');
const tableAnchor = document.getElementById('anchor');
const addButton = document.getElementById('addButton');
addButton.addEventListener('click', createItem);

function createItem() {
    if (!document.querySelector('.create')) {
        const item = new Item();
        item.create();
    }
}

function loadState() {
    chrome.storage.local.get(['items'], function(result) {
        const items = result.items;

        if (items) {
            Object.keys(items).forEach(item => new Item().create(items[item]['item'], items[item]['upc']));
        }
    });
}

function saveState() {
    const itemRows = Array.from(itemTable.querySelectorAll('tr')).slice(1, -1);
    const items = itemRows.map(row => ({
        item: row.cells[0].textContent,
        upc: row.cells[1].textContent
    }));

    chrome.storage.local.set({items: items});
}


let row;
function dragStart(event) {  
    row = event.target; 
}

function dragOver(event) {
    const e = event;
    e.preventDefault(); 

    let children = Array.from(e.target.parentNode.parentNode.children);

    if (children.indexOf(e.target.parentNode) > children.indexOf(row)) {
        e.target.parentNode.after(row);
    } else {
        e.target.parentNode.before(row);
    }
}

function dragEnd() {
    saveState();
}
