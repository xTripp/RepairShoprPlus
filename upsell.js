const itemTable = document.getElementById('upsell-items');
const addButton = document.getElementById('addButton');

addButton.addEventListener('click', createNewRow);

function createNewRow() {
    const data = document.createElement('tr');
    const name = document.createElement('td');
    const upc = document.createElement('td');
    const action = document.createElement('td');

    

    data.appendChild(name);
    data.appendChild(upc);
    data.append(action);

    itemTable.appendChild(data);
}