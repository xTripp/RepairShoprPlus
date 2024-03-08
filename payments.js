//dont forget to handle if custom payment method is removed but already saved to chrome.storage

const settingsBox = document.createElement('fieldset');
settingsBox.innerHTML = '\
    <legend>RepairShopr+ Settings</legend>\
    <table>\
        <tbody>\
            <tr>\
                <td>\
                    <label class="switch">\
                        <input id="option1" type="checkbox">\
                        <span class="slider"></span>\
                    </label>\
                </td>\
                <td>\
                    <div class="option-text" data-tooltip="Makes stylistic changes to the UI">Enable updated UI</div>\
                </td>\
            </tr>\
        </tbody>\
    </table>\
    <div style="margin: 20px 0px; font-size: 16px;" id="defaultPaymentDropdownContainer">\
        Default payment method:\
    </div>\
    <button type="button" class="btn btn-success" id="apply">Apply</button>\
    ';
const sidePanel = document.querySelector('.col-md-2.offset1');
sidePanel.appendChild(settingsBox);

const defaultPaymentDropdownContainer = document.getElementById('defaultPaymentDropdownContainer');
const paymentMethod = document.getElementById('payment_payment_method_id');
const paymentMethodVal = paymentMethod.value;
const defaultPaymentDropdown = paymentMethod.cloneNode(true);
defaultPaymentDropdown.id = 'defaultPaymentDropdown';
defaultPaymentDropdown.removeAttribute('include_blank');
defaultPaymentDropdown.removeAttribute('name');
const noneOption = document.createElement('option');
noneOption.value = 'none';
noneOption.textContent = 'None (Manual selection required before payment)';
defaultPaymentDropdown.insertBefore(noneOption, defaultPaymentDropdown.firstChild);
defaultPaymentDropdownContainer.appendChild(defaultPaymentDropdown);

const applyButton = document.getElementById('apply');
applyButton.addEventListener('click', function() {
    saveState();
    location.reload();
});

const updatedUI = document.getElementById('option1');
const defaultPayment = document.getElementById('defaultPaymentDropdown');
loadState();


function loadState() {
    chrome.storage.local.get(['updatedPaymentUI', 'defaultPayment'], function(data) {
        if (data.updatedPaymentUI !== undefined) {
            updatedUI.checked = data.updatedPaymentUI;
        } else {
            defaultPayment.value = paymentMethodVal.value;
            saveState();
        }
        if (data.defaultPayment !== undefined) {
            defaultPayment.value = data.defaultPayment;
        } else {
            defaultPayment.value = paymentMethodVal.value;
            saveState();
        }

        if (updatedUI.checked) {
            updateUI();
        }
        
        if (defaultPayment.value !== 'none') {
            paymentMethod.value = defaultPayment.value;
            const event = new Event('change', { bubbles: true });
            paymentMethod.dispatchEvent(event);
        } else {
            
        }
    });
}

function saveState() {
    chrome.storage.local.set({
        updatedPaymentUI: updatedUI.checked,
        defaultPayment: defaultPayment.value
    });
}

function updateUI() {
    console.log('update');
}