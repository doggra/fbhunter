function send_message(subject, message) {
  chrome.runtime.sendMessage({
    from: 'popup',
    subject: subject,
    content: message
  }, function(response) {

    // Get background storage.
    if (response.subject == 'retrieve_storage') {
      var storage = response.response;
      if (storage != undefined) {
        $("#search-box").html(storage);
        set_event_handlers();
      }
    }

  });
}


function build_URL() {
  var url = "https://facebook.com/search"

  // Iterate through entries and build up URL search query
  var entries = $(".entry");
  var iterations = 0;
  entries.each(function(i) {

    var entry_type = $(this).children('td.select').children('select.entry-type').children('option:selected').val();
    var entry_text = $(this).children('td.text').children('input.entry-text').val();

    // Skip entry if no text provided
    if (entry_text == "" || entry_text == undefined || entry_text == null) {
      return true;
    } else {
      iterations++;
    }

    if (entry_type == 'liked') {
      url += "/str/"+entry_text+"/pages-named/likers"
    } else if (entry_type == 'member_of') {
      url += "/str/"+entry_text+"/groups-named/members"
    } else if (entry_type == 'follower_of') {
      url += "/str/"+entry_text+"/users-named/followers"
    } else if (entry_type == 'current_job') {
      url += "/str/"+entry_text+"/pages-named/employees/present"
    } else if (entry_type == 'past_job') {
      url += "/str/"+entry_text+"/pages-named/employees/past"
    // Same as current job?
    } else if (entry_type == 'work_at') {
      url += "/str/"+entry_text+"/pages-named/employees/present"
    } else if (entry_type == 'lives_in') {
      url += "/str/"+entry_text+"/pages-named/residents/present"
    } else if (entry_type == 'lived_in') {
      url += "/str/"+entry_text+"/pages-named/residents/past"
    }

  });

  // Add "intersect" to URL for queries with more than one keyword.
  if (iterations++ > 1) {
    url += "/intersect"
  }

  return url
}


function add_new_entry(placeholder) {

  var last_entry = $('.entry').eq(-1);
  var new_entry = placeholder.clone(true);

  new_entry.children('.condition').html('<button class="btn btn-sm btn-link">ADD</button>');
  last_entry.after(new_entry);
  return new_entry
}


function set_event_handlers() {

  $(".del-btn").click(function() {
    var entry_to_delete = $(this).parent().parent();
    // Remove entry if not first.
    if (entry_to_delete.get(0) != $(".entry")[0]) {
      entry_to_delete.remove();
    }
  });

  // After declaration of entry event handlers, so these can be copied as well.
  // Alson, clear placeholders text input.
  var placeholder = $(".entry").clone(true).eq(0);
  placeholder.children('td.text').children('input.entry-text').attr('value', '');

  // Extension main event handlers.
  $('.entry-text').on("change paste keyup", function (event) {
    $(this).attr('value', $(this).val());
  });

  // Add new entry.
  $("#and-btn").click(function () {
    var new_entry = add_new_entry(placeholder);
    new_entry.children('td.text').children('input.entry-text').on("change paste keyup", function (event) {
      $(this).attr('value', $(this).val());
    });
  });

  // Search!
  $("#search-btn").click(function () {
    send_message("save_bg_storage", $("#search-box").html());
    chrome.tabs.create({ url: build_URL() });
  });

}


$(document).ready(function () {

  send_message('get_bg_storage');
  set_event_handlers();

});
