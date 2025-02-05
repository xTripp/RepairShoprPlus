// This code was only used for the quick links feature but was deprecated as of v1.7. If the feature is reintroduced uncomment this section and add this file to the manifest content scripts "js" section of the multiple ticket pages entry
/* // makes sure that the code is not run on the 'tickets/#######/edit' or 'tickets/#######/intake_form' pages
if (!window.location.href.endsWith('edit') && !window.location.href.endsWith('intake_form')) {
    const url = window.location.href;
    const authToken = document.getElementsByName('csrf-token')[0].getAttribute('content');
    const ticketInfoTable = document.querySelector('.widget-content');
    const ticketStatus = ticketInfoTable.querySelector('.best_in_place');
    const currentStatus = ticketStatus.textContent;
    const commentList = document.querySelector('.comment-list');
    const commentButton = document.querySelector('.btn-submitComment');

    commentButton.addEventListener('click', resolveStatus);

    const resolvePayload = {
        _method: "put",
        "ticket[status]": "Resolved",
        authenticity_token: authToken,
    };

    // set status to 'Order Parts'
    const payload = {
        _method: "put",
        "ticket[status]": "Order Parts",
        authenticity_token: authToken
    };

    // updates the ticket status so that the ticket updates on all machines
    function resolveStatus() {
        setTimeout(async () => {
            const comment = commentList.firstElementChild;
            const hasLink = comment.querySelectorAll('a:not([class]):not([href*="repairshopr"])').length > 0;

            if (hasLink) {
                try{
                    // if the status is already 'Order Parts', resolve the ticket
                    if (currentStatus === 'Order Parts') {
                        await fetch(url, {
                            method: "PUT",
                            headers: {
                                "Accept": "application/json",
                            },
                            body: new URLSearchParams(resolvePayload)
                        });
                    }
                
                    // set the ticket status to 'Order Parts'
                    await fetch(url, {
                        method: "PUT",
                        headers: {
                            "Accept": "application/json",
                        },
                        body: new URLSearchParams(payload)
                    });
                    ticketStatus.textContent = 'Order Parts';
                } catch (error) {
                    console.error(error);
                }
            }
        }, 500);  // 500ms timeout for new comment to load in the comment list
    }
}
*/

// Manifest portion needed for quicklinks
// "web_accessible_resources": [
//     {
//         "resources": ["/assets/images/link_black.png", "/assets/images/link_white.png"],
//         "matches": ["<all_urls>"]
//     }
// ]