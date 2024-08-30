// Returns a string with the JS path of an element
function getJSPath(element) {
    let path = [];
    while (element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      if (element.id) {
        selector += `#${element.id}`;
        path.unshift(selector);
        break;
      } else {
        let siblingIndex = 1;
        let sibling = element;
        while (sibling.previousElementSibling) {
          sibling = sibling.previousElementSibling;
          if (sibling.nodeName.toLowerCase() === selector) {
            siblingIndex++;
          }
        }
        if (siblingIndex > 1) {
          selector += `:nth-child(${siblingIndex})`;
        }
      }
      path.unshift(selector);
      element = element.parentNode;
    }
    return path.join(' > ');
  }