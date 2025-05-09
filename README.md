# RepairShopr+ Chrome Extension
This extension makes changes to how the RepairShopr System functions and adds new features and improvements.


### ---> CURRENT VERSION V1.7 <---

**V1.7 (5/13/25):**
- NEW FEATURE: Color-coded Elements (BETA)
  - Adds a RS+ option to the context menu (right-click) anywhere on the RepairShopr site that allows for assigning a color to the selected element
  - All system issues, statuses, and techs on the ticket page have the ability to be color-coded from the config page linked to the right of the Color-coded option in the RS+ settings menu
  - This feature has more improvements coming and more will be released at a later date
- RepairShopr+ is now available on Mozilla Firefox and Microsoft Edge
  - Please note that both the Firefox and Edge editions of RS+ are unoptimized. They have been tested for functionality but you may encounter visual bugs and formatting issues (mostly with Firefox)
  - Data can be transfered using the backup/import feature released in v1.6 (for more information see version 1.6 page on the RS+ home page)
- Bug Fixes
  - Fixed a bug in the closing counts autofill for the POS open/close page where it would input extra currency separators causing RS to default to "0.00"
  - Fixed the variance calculator on the POS open/close page to make it more clear
  - Autofill checkboxes on the POS open/close page now support any number of payment methods instead of just CC and quick (autofill checkboxes will need to be reset after the update)
- Other Improvements
  - Added a home button to the RS+ settings menu to pull up the RS+ info pages
  - Added an Update/Welcome page navigation side bar
  - Added an About page
- The Quick links feature has been removed and deprecated. If/when a solution is found it will return


### TO-DO'S:

**Pre-Update Items:**
- TODO Fix the sidebar formatting on info pages

**Bug Tracker:**
- TODO Fix the debug settings export
- TODO Fix colorManager.js and colors.js functionality (Probably need to close the colors page when changes are being made on RS because the autosave feature breaks everything)
- TODO Fix ticket table and charges button observers to load dynamically instead of using a .5s timeout
- TODO Fix non-critical error Unchecked runtime.lastError: Cannot create item with duplicate id uncolorizeElement that occurs randomly with no stack trace
- TODO Fix non-critical error with cloneNode and with addItemButton -> ChangesMade that occur on the tickets page
- TODO Fix the charges button issue requiring a page refresh and instead update the first ticket to reload the ticket table server-side

**Update Ideas:**
- TODO Color coding conditional formatting
- TODO Font color dynamic or manual customization
- TODO MobileSentrix integration for POs and inventory item creation


### Previous Updates:

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
  - This option will force tickets to stay on one line for a compact style
- Added settings tool-tips


**V1.2 (11/6/23):**
- NEW FEATURE: Charges Button
  - If the charges column is added to the ticket page, the charges will become a button to quickly add charges to the selected ticket
- Other bug fixes


**V1.1 (10/11/23):**
- NEW FEATURE: QuickLinks (DEPRECATED)
  - QuickLinks will appear to the right of each ticket and will open all links in the ticket's most recent comment
- NEW FEATURE: Settings Popup Menu
  - Click on the extension icon on the top right of your chrome window for toggleable settings


**V1.0 (9/19/23):**
- Changes customer name links on "tickets" page to redirect to the ticket page instead of the customer's page