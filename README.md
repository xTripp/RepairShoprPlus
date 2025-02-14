# RepairShopr+ Chrome Extension
This extension makes changes to how the RepairShopr System functions and adds new features and improvements.

### ---> CURRENT VERSION V1.7 <---

**V1.7 (##/##/##):**
- NEW FEATURE: Color-coded Elements (BETA)
  - Adds a RS+ option in the right-click context menu on the RepairShopr site that allows for assigning a color to the selected element
  - All system issues, statuses, and, techs have the ability to be color-coded from the config page linked to the right of the Color-coded option in the settings menu
  - TODO export/import themes
  - TODO remove element color context option
  - TODO sometimes set element color just doesnt work, there are no errors but it wont work until the extension is reloaded
- The Quick links feature has been removed and deprecated. If/when a solution is found it will return
- Bug Fixes
  - Fixed a bug in closing counts autofill for the POS open/close page where it would input extra currency separators causing RS to enter "0.00"
  - Fixed the variance calculator on the POS open/close page to make it more clear
  - Autofill checkboxes on the POS open/close page now support any number of payment methods instead of just CC and quick (autofill options will need to be re-enabled)
  - On Chrome, RS+ settings are now synced with your profile (if Chrome profile sync is enabled) for consistent settings across all your devices. If sync is not enabled, settings will still be saved locally.
  - TODO support edge
  - TODO update welcome/update pages
  - TODO add links to previous updates in welcome/update pages
  - TODO convert charges and ticket table observers to stop using timeout


**V1.6.1 Hotfix (3/15/24):**
- Critical Bug Fixes
  - Fixed bug with payment method disappearing and becoming quick payment on first install/update
  - Fixed bug with default payment method not being set sometimes
- Add-on Features
  - Added a toggle button in the RepairShopr+ main settings popup window for newly introduced payment settings
  - Added a 'Hide settings' checkbox within payment settings to declutter the payment window


**V1.6 (3/13/24):**
- NEW FEATURE: Payment Page Settings
  - Adds a settings window to the payments page with options to modify the page
  - Features a toggleable updated UI option and a default payment option dropdown to set default payment method on page load
- NEW FEATURE: Import/Export RepairShopr+ Settings
  - Allows RepairShopr+ settings to be exported from one computer and loaded to another for simple setup
- Other minor changes


**V1.5 (2/14/24):**
- NEW FEATURE: Item Upsell in Add/View Charges Widget
  - Items added to the upsell config menu will appear as buttons at the bottom of the add/view charges widget
  - The upsell config menu is located next to the "Enable Upsell Opportunities" toggle in the extension popup window
- NEW FEATURE: Site-wide 24-hour Time
  - All AM/PM times will be converted to their 24 hour equivalent format
- Other Improvements
  - Added a welcome page for new installs with instructions on how to use the extension
  - Added an update page for existing users that showcases new features
- Other small fixes


**V1.4 (1/25/24):**
- NEW FEATURE: POS Open/Close History
  - This will display cash the register opened/closed with and adds an active variance calculator while inputting data
- NEW FEATURE: POS CC and Quick Autofill
  - Adds checkboxes for CC and Quick input boxes that when enabled, will autofill the expected value
- Other bug fixes


**V1.3 (1/17/24):**
- NEW FEATURE: Force Single-Line Tickets
  - This option will force tickets to stay on one line for a compact style.
- Added settings tool-tips


**V1.2 (11/6/23):**
- NEW FEATURE: Charges Button
  - If the charges column is added to the ticket page, the charges will become a button to quickly add charges to the selected ticket
- Other bug fixes


**V1.1 (10/11/23):**
- NEW FEATURE: QuickLinks
  - QuickLinks will appear to the right of each ticket and will open all links in the ticket's most recent comment
- NEW FEATURE: Settings Popup Menu
  - Click on the extension icon on the top right of your chrome window for toggleable settings


**V1.0 (9/19/23):**
- Changes customer name links on "tickets" page to redirect to the ticket page instead of the customer's page