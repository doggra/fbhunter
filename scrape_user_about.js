var user_scraped_data = {};
var contact_basic = $("ul[data-overviewsection='contact_basic']");
var contact_basic_rows = contact_basic.children();
var accessible_elements = contact_basic.find('span.accessible_elem');


function send_message(subject, message) {
	chrome.runtime.sendMessage({subject: subject, content: message});
}

chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {

	if (message.subject == 'scrape_user') {

		user_scraped_data["Username"] = $("title").text();
		user_scraped_data["URL"] = window.location.href;

		// Basic info
		accessible_elements.each(function() {

			var type = $(this).text();
			var entries = $(this).parent().siblings();
			var temp_data = [];

			entries.each(function() {
				temp_data.push($(this).text());
			});

			user_scraped_data[type] = temp_data.join(", ")

		});
	}
	user_scraped_data['Location'] = $("div:contains('Lives in')").last().children('a').text();
	user_scraped_data['Works at'] = $("div:contains('Works at')").last().children('a').text();
	send_message('user_scraped', { fid: message.fid, message: user_scraped_data });

})