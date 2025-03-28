chrome.storage.local.get(null, function (result) {
    // Extract all keys that end with "Autofill" dynamically
    const autofillKeys = Object.keys(result).filter(key => key.endsWith('AutofillState'));
    const requiredKeys = ['registerHistoryState', 'pennies', 'nickels', 'dimes', 'quarters', 'ones', 'twos', 'fives', 'tens', 'twenties', 'fifties', 'hundreds', ...autofillKeys];

    // Fetch all the relevant values from chrome.storage.local
    chrome.storage.local.get(requiredKeys, function (result) {
        // Retrieve and declare existing values from chrome storage
        const {
            registerHistoryState,
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
            hundreds,
        } = result;

        // Initialize dict of counts for placeholders
        const counts = { pennies, nickels, dimes, quarters, ones, twos, fives, tens, twenties, fifties, hundreds };

        // Initialize autofillStates dynamically from autofill keys
        const autofillStates = autofillKeys.reduce((acc, key) => {
            acc[key] = result[key];
            return acc;
        }, {});

        // countElements contains all input boxes on the page
        const countElements = document.querySelectorAll('input[id^="register"].string.optional.form-control');

        // Add AutofillState keys dynamically for any new input elements
        Array.from(countElements).slice(11).forEach((element) => {
            const elementName = `${element.getAttribute('name').match(/\[([^\]]+)\]/)?.[1]}AutofillState`;
            if (!(elementName in autofillStates)) {
                autofillStates[elementName] = false;
            }
        });

        const expectedCashBal = parseFloat(document.querySelector('#register-form > div:nth-last-child(2) > div:nth-child(1) > h3').textContent.split('$')[1]);
        const cashPanel = document.querySelector('.panel-body');
        const currentCashBal = document.getElementById('current-total');
        const submitButton = document.querySelector("#register-form > div:last-child > div > input");

        let autofillCheckboxes = {};

        // Create autofill checkboxes for all custom payment input fields
        Object.keys(autofillStates).forEach(stateName => {
            const paymentInputBox = document.getElementById(`register_close_${stateName.replace('AutofillState', '')}`);
            
            // If the input box for the autofill is present, create the checkbox
            if (paymentInputBox) {
                paymentInputBox.style.marginBottom = 0;
                const autofillCheckbox = createAutofillCheckbox(stateName, paymentInputBox);
                autofillCheckbox.checked = autofillStates[stateName];
                autofillCheckboxes[stateName] = autofillCheckbox;
            }
        });

        // Inserts placeholders in all text boxes containing the previous open/close counts
        if (registerHistoryState) {
            submitButton.addEventListener('click', saveState);
            setPlaceholders();

            // Calculate and display current register variance
            if (location.toString().endsWith('close')) {
                cashPanel.appendChild(document.createElement('br'));
                const variance = cashPanel.appendChild(Object.assign(document.createElement('span'), { className: 'h5' }));
                
                updateBal();

                // Watch for changes to any cash input fields and update the balance if one is detected
                const observer = new MutationObserver(updateBal);
                observer.observe(currentCashBal, { childList: true, subtree: true });

                // Check the expected balance against the current balance to calculate the register variance and write a formatted string displaying the information
                function updateBal() {
                    const varianceValue = parseFloat(expectedCashBal - parseFloat(currentCashBal.textContent));
                    const formattedVariance = Math.abs(varianceValue).toFixed(2);

                    let statusText = '';
                    if (varianceValue > 0) {
                        statusText = 'Under expected';
                        variance.style.color = 'red';
                    } else if (varianceValue < 0) {
                        statusText = 'Over expected';
                        variance.style.color = 'green';
                    } else {
                        statusText = '';
                        variance.style.color = 'green';
                    }

                    variance.textContent = `Variance: $${formattedVariance} ${statusText}`;
                }
            }
        }

        // Autofill balances if checkboxes are enabled
        function autofillInput(stateName, onCheck = false) {
            const balElement = [...document.getElementById(`register_close_${stateName.replace('AutofillState', '')}`).parentElement.parentElement.children]
                .find(child => child.id !== `register_close_${stateName.replace('AutofillState', '')}`);
            const countIndex = Object.keys(autofillStates).indexOf(stateName) + 11; // starting at index 11 for autofill items

            if (countElements[countIndex] && (autofillStates[stateName] || onCheck)) {
                countElements[countIndex].value = normalizeMoney(balElement.textContent.split(' ').pop());
            }
        }
        Object.keys(autofillCheckboxes).forEach(stateName => {
            autofillInput(stateName);
        });

        // Function to set placeholders based on open/close states
        function setPlaceholders() {
            let countText = '';

            // Display the correct string depending on the current page URL
            if (location.toString().endsWith('open')) {
                countText = 'Closed with';
            } else if (location.toString().endsWith('close')) {
                countText = 'Opened with';
            }

            // Display the previous drawer count for a specific denomination. If none, display 0
            Object.keys(counts).forEach((k, i) => {
                const placeholderValue = counts[k] !== undefined && counts[k] !== "" ? `${countText}: ${counts[k]}` : `${countText}: 0`;
                countElements[i].setAttribute('placeholder', placeholderValue);
            });
        }

        // Function to create an autofill checkbox
        function createAutofillCheckbox(stateName, container) {
            const checkboxContainer = document.createElement('div');
            checkboxContainer.style.marginTop = "-10px";
            checkboxContainer.className = 'ui-checkbox-container';
        
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'ui-checkbox';
        
            const labelText = document.createElement('div');
            labelText.className = 'ui-checkbox-text';
            labelText.textContent = 'Autofill';
        
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(labelText);
        
            container.insertAdjacentElement('beforebegin', checkboxContainer);

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    autofillInput(stateName, true);
                }
            });
        
            return checkbox;
        }

        // Function to save the state of all fields
        function saveState() {
            const currCount = {};

            // Save all cash counts
            Object.keys(counts).forEach((k, i) => currCount[k] = countElements[i].value);

            const state = { ...currCount };

            // Save all autofill states
            Object.keys(autofillCheckboxes).forEach(stateName => {
                const autofillCheckbox = autofillCheckboxes[stateName];
                state[stateName] = autofillCheckbox?.checked || false;
            });

            chrome.storage.local.set(state);
        }
    });
});


// This function normalizes money values
// ex. $1,234.56 -> 1234.56
function normalizeMoney(value) {
    // Remove all non-numeric characters except dots and commas
    value = value.replace(/[^\d.,]/g, '');

    // Determine the correct decimal separator based on the string's contents
    const decimalSeparator = value.includes(',') && value.includes('.') ?
        (value.lastIndexOf(',') > value.lastIndexOf('.') ? ',' : '.') :
        (value.includes(',') ? ',' : '.');

    // Remove unnecessary dots or commas not followed by a number
    let normalizedValue = value.replace(/(,|\.)+(?=\d+(\.|,))/g, '');

    // Replace the remaining dot or comma with the determined decimal separator
    normalizedValue = normalizedValue.replace(/(,|\.)/, decimalSeparator);

    return normalizedValue;
}