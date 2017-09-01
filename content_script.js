
// Checks if element exists.
$.fn.exists = function () {
    return this.length !== 0;
}


function send_message(subject, message) {
	chrome.runtime.sendMessage({subject: subject, content: message});
}


function get_users_ids() {

	var user_ids = [];
	var main_container = $('#initial_browse_result');
	var result_boxes = main_container.find('div#BrowseResultsContainer').siblings().addBack();
	var user_boxes = result_boxes.find('div[data-bt]').not(".FriendButton").not('._pac');

	user_boxes.each(function(i) {
		user_ids.push(JSON.parse($(this).attr('data-bt')).id);
	});

	return user_ids
}


chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {

	if (message.subject == 'export') {

		// Scroll to end of results.
		var scrolling = setInterval(function () {
			window.scrollTo(0,document.body.scrollHeight);
			if ($("#browse_end_of_results_footer").exists()) {
				clearInterval(scrolling);
				send_message('scrape_start', get_users_ids());
			}
		}, 2000);
	}

});