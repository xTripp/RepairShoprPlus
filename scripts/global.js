chrome.storage.local.get(['global24hTimeState', 'colorCodedState'], function(result) {
    if (result.global24hTimeState) {
        window.addEventListener('load', function () {
            var timeRegex = /(\d{1,2}):(\d{2})\s?(AM|PM)/gi;
    
            function convertTo24Hour(time) {
                var match;
    
                // run until all time matches are found
                while ((match = timeRegex.exec(time)) !== null) {
                    var [_, hour, minute, meridiem] = match;
                    var hour24 = parseInt(hour);
    
                    if (meridiem.toUpperCase() === 'PM' && hour24 !== 12) {
                        hour24 += 12;
                    } else if (meridiem.toUpperCase() === 'AM' && hour24 === 12) {
                        hour24 = 0;
                    }
    
                    var convertedTime = hour24.toString().padStart(2, '0') + ':' + minute;
                    time = time.replace(match[0], convertedTime);
                }
    
                return time;
            }
    
            // find all elements containing text
            var elements = document.body.getElementsByTagName('*');
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                for (var j = 0; j < element.childNodes.length; j++) {
                    var node = element.childNodes[j];
                    if (node.nodeType === 3) { // text node
                        var text = node.nodeValue;
                        var newText = convertTo24Hour(text);
                        if (newText !== text) {
                            element.replaceChild(document.createTextNode(newText), node);
                        }
                    }
                }
            }
        });
    }


    if (result.colorCodedState) {
        // Initialize all current system issues, statuses, and techs and save them to chrome storage
        const url = new URL(window.location.href);
        if (url.hostname.endsWith(".repairshopr.com") && url.pathname === "/tickets") {
            let status = [], issue = [], tech = [];
            const firstTicket = document.querySelector("#bhv-ticketTable tbody tr");
    
            // Get all custom issues, statuses, and techs and store them in their own arrays
            firstTicket.querySelectorAll("td").forEach(td => {
                if (td.querySelector("b.tablesaw-cell-label") && td.querySelector("b.tablesaw-cell-label").innerText.includes("Status")) {
                    status = JSON.parse(td.querySelector('span[data-bip-collection]').getAttribute('data-bip-collection')).map(arr => arr[1]);
                }
                if (td.querySelector("b.tablesaw-cell-label") && td.querySelector("b.tablesaw-cell-label").innerText.includes("Issue")) {
                    issue = JSON.parse(td.querySelector('span[data-bip-collection]').getAttribute('data-bip-collection')).map(arr => arr[1]);
                }
                if (td.querySelector("b.tablesaw-cell-label") && td.querySelector("b.tablesaw-cell-label").innerText.includes("Tech")) {
                    tech = JSON.parse(td.querySelector('span[data-bip-collection]').getAttribute('data-bip-collection')).map(arr => arr[1]);
                }
            });
    
            // Retrieve existing bipcolors and update storage
            chrome.storage.local.get(["bipcolors"], (data) => {
                let colors = data.bipcolors || {}; // Retrieve existing colors or initialize an empty object
    
                // Helper function to add missing entries
                function addMissingEntries(category, categoryName) {
                    category.forEach(item => {
                        if (!(item in colors)) {
                            colors[item] = [null, categoryName];
                        }
                    });
                }
    
                addMissingEntries(status, "status");
                addMissingEntries(issue, "issue");
                addMissingEntries(tech, "tech");
    
                chrome.storage.local.set({bipcolors: colors});
            });
        }
    }
});