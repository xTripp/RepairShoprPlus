chrome.storage.sync.get(['paymentSettingsState'], function(result) {
    if (result.paymentSettingsState) {
        //handle the page theme for style changes
        let darkMode = false;
        if (window.getComputedStyle(document.querySelector('body')).backgroundColor === 'rgb(31, 31, 31)') {
            darkMode = true;
        }

        // hide settings window checkbox
        const hideCheckboxContainer = document.createElement('div');
        hideCheckboxContainer.className = 'ui-checkbox-container';
        hideCheckboxContainer.style.margin = "-25px 0 25px 0";

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'ui-checkbox';

        const labelText = document.createElement('div');
        labelText.className = 'ui-checkbox-text';
        labelText.textContent = 'Hide settings';

        hideCheckboxContainer.appendChild(checkbox);
        hideCheckboxContainer.appendChild(labelText);

        checkbox.addEventListener('click', function() {
            saveState();
            if (checkbox.checked) {
                settingsBox.style.display = 'none';
            } else {
                settingsBox.style.display = 'block';
            }
        });

        // create settings container
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
        sidePanel.append(hideCheckboxContainer);
        sidePanel.appendChild(settingsBox);

        const legend = document.getElementById('legendText');
        if (darkMode) {
            settingsBox.style = 'border: 2px solid #ccc !important;';
            legend.style = 'color: whitesmoke !important;';
            document.querySelector('.slider').classList.toggle('darkmode-slider');
            document.querySelector('.option-text').classList.toggle('darkmode-option-text');
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

        // extension settings elements
        const updatedUI = document.getElementById('option1');
        const defaultPayment = document.getElementById('defaultPaymentDropdown');
        const applyButton = document.getElementById('apply');
        applyButton.addEventListener('click', function() {
            saveState();
            location.reload();
        });

        loadState();


        function loadState() {
            chrome.storage.sync.get(['paymentSettingsHidden', 'updatedPaymentUI', 'defaultPayment'], function(data) {
                // set values of the settings loaded from chrome.storage
                checkbox.checked = data.paymentSettingsHidden;
                updatedUI.checked = data.updatedPaymentUI;
                if (data.defaultPayment !== undefined) {
                    defaultPayment.value = data.defaultPayment;
                } else {
                    // on first install/update this will run and set the chrome.storage default value since there is not one assigned already
                    defaultPayment.value = paymentMethodVal;
                    saveState();
                    location.reload();
                }

                if (checkbox.checked) {
                    settingsBox.style.display = 'none';
                } else {
                    settingsBox.style.display = 'block';
                }

                if (updatedUI.checked) {
                    updateUI();
                }
                
                // handle the value of default selected payment method
                paymentMethod.value = data.defaultPayment;
                if (data.defaultPayment !== 'none') {
                    // if the selected default shows/hides parts of the page, this will update it to reflect that
                    paymentMethod.dispatchEvent(new Event('change', { bubbles: true }));
                } else {
                    // create the default none value as a payment option
                    const nonePaymentMethod = document.createElement('option');
                    nonePaymentMethod.disabled = true;
                    nonePaymentMethod.selected = true;
                    nonePaymentMethod.value = 'none';
                    nonePaymentMethod.textContent = 'Select payment method';
                    paymentMethod.insertBefore(nonePaymentMethod, paymentMethod.firstChild);

                    // disable the payment button until a valid payment method is selected
                    const paymentButton = document.getElementById('take-payment');
                    paymentButton.value = 'Select a payment method first';
                    paymentButton.disabled = true;
                    paymentMethod.addEventListener('change', function() {
                        if (paymentMethod.value !== 'none') {
                            paymentButton.value = 'Take Payment';
                            paymentButton.disabled = false;
                        }
                    });
                }
            });
        }

        function saveState() {
            chrome.storage.sync.set({
                paymentSettingsHidden: checkbox.checked,
                updatedPaymentUI: updatedUI.checked,
                defaultPayment: defaultPayment.value
            });
        }

        function updateUI() {
            // top bar compact
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

            // Amount tendered box
            const tenderedBox = document.querySelector('.cashOnly');
            tenderedBox.classList.add('tenderedBox');

            const tenderedBoxInput = document.querySelector('.bhv-tendery');
            tenderedBoxInput.classList.add('tenderedBoxInput');
            tenderedBoxInput.value = null;

            const tenderedBoxLabel = tenderedBox.querySelector('label');
            tenderedBoxLabel.style.color = '#555';
        }
    }
});