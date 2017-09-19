var bg_storage;
var scraper_tab;
var users_to_scrape;
var scraped_data = [];
var scraping_phase;
var target_user;


function send_message(subject, message) {
  chrome.runtime.sendMessage({
    from: 'popup',
    subject: subject,
    content: message
  });
}


function sget(d, key) {
	if (d[key] == undefined) {
		return ""
	} else {
		return d[key].replace("|", ":");
	}
}

function download_csv(csv_string) {
	var encodedUri = encodeURI(csv_string);
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", "results.csv");
	document.body.appendChild(link);
	link.click();
}


function scrape_next_user() {

	// Get next user ID.
	target_user = users_to_scrape.pop();

	// Scraping finished!
	if (target_user == undefined) {

		csv_string = "data:text/csv;charset=utf-8,,Facebook ID|Username|URL|Phones|E-mails|Location|Works at|Address|Websites|Social Links|Birthday\n";

		scraped_data.forEach(function(e) {
			var fid = e.fid;
			var d = e.message;
			user_data_string = fid+"|"+
							   sget(d, "Username")+"|"+
							   sget(d, "URL")+"|"+
							   sget(d, "Phones")+"|"+
							   sget(d, "Email")+"|"+
							   sget(d, "Location")+"|"+
							   sget(d, "Works at")+"|"+
							   sget(d, "Address")+"|"+
							   sget(d, "Website")+"|"+
							   sget(d, "Social Links")+"|"+
							   sget(d, "Birthday")+"\r\n";

			csv_string += user_data_string;
		});

		chrome.tabs.remove(scraper_tab);
		download_csv(csv_string);

		scraping_phase = undefined;

		return 
	}

	// Go to users about pages.
	var user_about = "https://www.facebook.com/profile.php?id="+target_user+"&sk=about";
	chrome.tabs.update(scraper_tab, {url: user_about});

}


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

	console.log(message);

	if (message.subject == 'search') {
		chrome.tabs.create({ url: message.content });
	}

	if (message.subject == 'export') {
		chrome.tabs.create({ url: message.content }, function(tab) {
			scraper_tab = tab.id;
			scraping_phase = 0;
		});
	}

	if (message.subject == 'scrape_start') {

		// Save user IDs for scraping and start scraping.
		users_to_scrape = message.content;
		scrape_next_user();
	}

	if (message.subject == 'user_scraped') {
		scraped_data.push(message.content);
		scrape_next_user();
	}

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


chrome.tabs.onUpdated.addListener(function (tabId , info) {
  if (info.status === 'complete') {
    if (scraper_tab == tabId) {
    	if (scraping_phase == 0) {

    		chrome.tabs.sendMessage(scraper_tab, {
				subject: 'export'
			});

			scraping_phase = 1;

    	} else if (scraping_phase == 1) {

			chrome.tabs.sendMessage(scraper_tab, {
				subject: 'scrape_user',
				fid: target_user
			});

    	}
		
    }
  }
});