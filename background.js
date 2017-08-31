chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {

	console.log(response, sender);

	// // First, validate the message's structure
	// if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
	//   // Enable the page-action for the requesting tab
	//   chrome.pageAction.show(sender.tab.id);
	// }
});

