// handle if custom payment method is removed but already saved to chrome.storage
// unrelated to this file but fix upsell opportunity items bug that prevents item buttons from loading sometimes
// fix light mode styles
// make take payment popup while disabled to explain why its disabled

let darkMode = false;
if (window.getComputedStyle(document.querySelector('body')).backgroundColor === 'rgb(31, 31, 31)') {
    darkMode = true;
}

const settingsBox = document.createElement('fieldset');
settingsBox.innerHTML = '\
    <legend id="legendText">RepairShopr+ Settings</legend>\
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

const legend = document.getElementById('legendText');
if (darkMode) {
    settingsBox.style = 'border: 2px solid #ccc !important;';
    legend.style = 'color: whitesmoke !important;';
    document.querySelector('.slider').classList.toggle('darkmode-slider');
}

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

const defaultPaymentDropdownContainer = document.getElementById('defaultPaymentDropdownContainer');
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
        updatedUI.checked = data.updatedPaymentUI;
        if (data.defaultPayment !== undefined) {
            defaultPayment.value = data.defaultPayment;
        } else {
            defaultPayment.value = paymentMethodVal.value;
            saveState();
        }

        if (updatedUI.checked) {
            updateUI();
        }
        
        paymentMethod.value = data.defaultPayment;
        if (data.defaultPayment !== 'none') {
            paymentMethod.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            const nonePaymentMethod = document.createElement('option');
            nonePaymentMethod.disabled = true;
            nonePaymentMethod.selected = true;
            nonePaymentMethod.value = 'none';
            nonePaymentMethod.textContent = 'Select payment method';
            paymentMethod.insertBefore(nonePaymentMethod, paymentMethod.firstChild);

            const paymentButton = document.getElementById('take-payment');
            paymentButton.disabled = true;
            paymentMethod.addEventListener('change', function() {
                if (paymentMethod.value !== 'none') {
                    paymentButton.disabled = false;
                }
            })
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
    document.querySelector('.subnavbar').style.marginBottom = '10px';
    document.querySelector('.col-md-12.mbl').style.marginBottom = 0;
    document.querySelector('.tooltipper.right.mrl').remove();

    // Payment method selection box
    const paymentMethodContainer = document.createElement('div');
    paymentMethodContainer.classList.add('form-group');

    const paymentMethodLabel = document.createElement('label');
    paymentMethodLabel.classList.add('string', 'optional');
    paymentMethodLabel.textContent = 'Payment Method';

    paymentMethod.parentNode.insertBefore(paymentMethodContainer, paymentMethod);
    paymentMethodContainer.appendChild(paymentMethodLabel);
    paymentMethodContainer.appendChild(paymentMethod);

    // Payment secured box
    document.querySelector('.col-md-2.offset1').children[2].remove();
    const cardSecuredText = document.createElement('p');
    const cashSecuredText = document.createElement('p');
    cardSecuredText.textContent = 'Browser communication protected by strong SSL';
    cashSecuredText.textContent = 'Browser communication protected by strong SSL';
    cardSecuredText.style = 'margin-top: 6px; font-size: 14px; font-weight: 700;';
    cashSecuredText.style = 'margin-top: 6px; font-size: 14px; font-weight: 700;';
    const ccBox = document.querySelector('.fa-credit-card');
    const cashBox = document.querySelector('.fa-money-bill');
    ccBox.appendChild(cardSecuredText);
    cashBox.appendChild(cashSecuredText);
    ccBox.style = 'width: 400px; text-align: center; text-wrap: nowrap;';
    cashBox.style = 'width: 400px; text-align: center; text-wrap: nowrap;';

    // Amount Tendered
    const tenderedBox = document.querySelector('.cashOnly');
    tenderedBox.classList.add('tenderedBox');

}