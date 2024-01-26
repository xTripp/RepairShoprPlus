chrome.storage.local.get(['registerHistoryState', 'cardAutofillState', 'quickAutofillState', 'pennies', 'nickels', 'dimes', 'quarters', 'ones', 'twos', 'fives', 'tens', 'twenties', 'fifties', 'hundreds'],
function (result) {
    const {
        registerHistoryState,
        cardAutofillState,
        quickAutofillState,
        pennies,
        nickels,
        dimes,
        quarters,
        ones,
        twos,
        fives,
        tens,
        twenties,
        fifties,
        hundreds
    } = result;
    
    // countElements contains all input boxes on the page. 11 and 12 in countElements is the card and quick input boxes if present.
    const countElements = document.querySelectorAll('input[id^="register"].string.optional.form-control');
    const counts = {
        pennies: pennies,
        nickels: nickels,
        dimes: dimes,
        quarters: quarters,
        ones: ones,
        twos: twos,
        fives: fives,
        tens: tens,
        twenties: twenties,
        fifties: fifties,
        hundreds: hundreds,
    };

    const expectedCashBal = parseFloat(document.querySelector('#register-form > div:nth-last-child(2) > div:nth-child(1) > h3').textContent.split('$')[1]);
    const panel = document.querySelector('.panel-body');
    const currentCashBal = document.getElementById('current-total');
    const cardBal = document.querySelector('#register-form > div:nth-last-child(2) > div:nth-child(2) > h3');
    const quickBal = document.querySelector('#register-form > div:nth-last-child(2) > div:nth-child(3) > h3');
    const submitButton = document.querySelector("#register-form > div:last-child > div > input");

    let cardAutofill, quickAutofill;
    if (cardBal) {
        cardBal.style.marginBottom = 0;
        cardAutofill = createAutofillCheckbox(cardBal);
    }
    if (quickBal) {
        quickBal.style.marginBottom = 0;
        quickAutofill = createAutofillCheckbox(quickBal);
    }


    // inserts placeholders in all text boxes containing the previous open/close counts and enables the variance calculator underneath the current count
    if (registerHistoryState) {
        submitButton.addEventListener('click', saveState);
        setPlaceholders();

        if (location.toString().endsWith('close')) {
            panel.appendChild(document.createElement('br'));
            const variance = panel.appendChild(Object.assign(document.createElement('span'), {className: 'h5'}));
            
            updateBal();

            const observer = new MutationObserver(updateBal);
            observer.observe(currentCashBal, {childList: true, subtree: true})

            function updateBal() {
                variance.textContent = `Variance: $${parseFloat(expectedCashBal - parseFloat(currentCashBal.textContent)).toFixed(2)}`;
            }
        }
    }

    // autofills card total if input box is present and checkbox is enabled
    if (cardBal && cardAutofillState) {
        cardAutofill.checked = cardAutofillState;
        countElements[11].value = cardBal.textContent.split('$')[1];
    }

    // autofills quick total if input box is present and checkbox is enabled
    if (quickBal && quickAutofillState) {
        quickAutofill.checked = quickAutofillState;
        countElements[12].value = parseFloat(quickBal.textContent.split('$')[1]);
    }


    function setPlaceholders() {
        let countText = '';

        if (location.toString().endsWith('open')) {
            countText = 'Closed with';
        } else if (location.toString().endsWith('close')) {
            countText = 'Opened with';
        }

        Object.keys(counts).forEach((k, i) => {
            const placeholderValue = counts[k] !== undefined && counts[k] !== "" ? `${countText}: ${counts[k]}` : `${countText}: 0`;
            countElements[i].setAttribute('placeholder', placeholderValue);
        });
    }

    function createAutofillCheckbox(container) {
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'ui-checkbox-container';
    
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'ui-checkbox';
    
        const labelText = document.createElement('div');
        labelText.className = 'ui-checkbox-text';
        labelText.textContent = 'Autofill';
    
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(labelText);
    
        container.insertAdjacentElement('afterend', checkboxContainer);
    
        return checkbox;
    }

    function saveState() {
        const currCount = {};
        Object.keys(counts).forEach((k, i) => currCount[k] = countElements[i].value);
    
        const state = {...currCount};
    
        if (cardBal) {
            state.cardAutofillState = cardAutofill?.checked || false;
        }
        if (quickBal) {
            state.quickAutofillState = quickAutofill?.checked || false;
        }
    
        chrome.storage.local.set(state);
    }
});
