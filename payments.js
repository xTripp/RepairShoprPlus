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
    <div style="margin: 20px 0px; font-size: 16px;">\
        Default payment method:\
        <select class="select optional form-control" style="margin-top: 5px;" id="defaultPaymentDropdown">\
            <option value="none">None (Manual selection will be required before payment)</option>\
            <option value="cash">Cash</option>\
            <option value="check">Check</option>\
            <option value="credit">Credit Card</option>\
            <option value="quick">Quick</option>\
        </select>\
    </div>\
    <button type="button" class="btn btn-success" id="apply">Apply</button>';
const sidePanel = document.querySelector('.col-md-2.offset1');
sidePanel.appendChild(settingsBox);

const applyButton = document.getElementById('apply');
applyButton.addEventListener('click', saveState);

const updatedUI = document.getElementById('option1');
const defaultPayment = document.getElementById('defaultPaymentDropdown');
const paymentMethod = document.getElementById('payment_payment_method_id');
loadState();


function loadState() {
    chrome.storage.local.get(['updatedPaymentUI', 'defaultPayment'], function(data) {
        if (data.updatedPaymentUI !== undefined) {
            updatedUI.checked = data.updatedPaymentUI;
        }
        if (data.defaultPayment !== undefined) {
            defaultPayment.value = data.defaultPayment;
        }
    });

    if (updatedUI.checked) {
        console.log('updated');
    }
    
    if (defaultPayment.value === paymentMethod.textContent) {
        console.log('method set');
    }
    console.log(updatedUI.checked);
    console.log(defaultPayment.value);
    console.log(paymentMethod.textContent);
}

function saveState() {
    chrome.storage.local.set({
        updatedPaymentUI: updatedUI.checked,
        defaultPayment: defaultPayment.value
    });
    location.reload();
}