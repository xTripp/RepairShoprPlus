chrome.storage.sync.get(['global24hTimeState', 'colorCodedState'], function(result) {
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
        
    }
});
