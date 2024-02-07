class Item {
    constructor() {

    }

    create() {
        const data = document.createElement('tr');
        const name = document.createElement('td');
        const upc = document.createElement('td');
        const action = document.createElement('td');
    
        const itemInputWrapper = document.createElement('div');
        itemInputWrapper.classList.add('input-wrapper');
        const itemInputBox = document.createElement('input');
        itemInputBox.classList.add('input-box');
        itemInputBox.setAttribute('type', 'text');
        itemInputBox.setAttribute('placeholder', 'Item name (will display in the add/view charges window)');
        const itemInputUnderline = document.createElement('span');
        itemInputUnderline.classList.add('underline');
        itemInputWrapper.appendChild(itemInputBox);
        itemInputWrapper.appendChild(itemInputUnderline);
    
        const upcInputWrapper = document.createElement('div');
        upcInputWrapper.classList.add('input-wrapper');
        const upcInputBox = document.createElement('input');
        upcInputBox.classList.add('input-box');
        upcInputBox.setAttribute('type', 'text');
        upcInputBox.setAttribute('placeholder', 'UPC Code (internal code assigned to the item)');
        const upcInputUnderline = document.createElement('span');
        upcInputUnderline.classList.add('underline');
        upcInputWrapper.appendChild(upcInputBox);
        upcInputWrapper.appendChild(upcInputUnderline);
    
        const actionButton = document.createElement('button');
        actionButton.classList.add('action-button', 'create');
        actionButton.textContent = '✓';
        actionButton.addEventListener('click', addItem);
    
        function addItem() {
            const actionButton = document.querySelector('.create');
            actionButton.classList.remove('create');
            actionButton.classList.add('delete');
            actionButton.textContent = 'Ｘ';
        }

        name.appendChild(itemInputWrapper);
        upc.appendChild(upcInputWrapper);
        action.appendChild(actionButton);
    
        data.appendChild(name);
        data.appendChild(upc);
        data.appendChild(action);
    
        document.querySelector('tbody').insertBefore(data, tableAnchor);
    }
}


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
