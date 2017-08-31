var bg_storage;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

	// console.log(message);

	if (message.subject == 'save_bg_storage') {
		bg_storage = message.content;
	}

	if (message.subject == 'get_bg_storage') {
		sendResponse({
			subject: 'retrieve_storage',
			response: bg_storage
		});
	}

});