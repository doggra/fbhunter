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
  var last_type;

  entries.each(function(i) {

    var entry_type = $(this).attr("type");
    if ((entry_type == "AND") && (last_type == "OR")) {
      url += "/union"
    }
    last_type = entry_type;

    var entry_select = $(this).children('td.select').children('select.entry-select').children('option:selected').val();
    var entry_text = $(this).children('td.text').children('input.entry-text').val().replace(" ", "+");;

    // Skip entry if no text provided
    if (entry_text == "" || entry_text == undefined || entry_text == null) {
      return true;
    } else {
      iterations++;
    }

    if (entry_select == 'liked') {
      url += "/str/"+entry_text+"/pages-named/likers"
    } else if (entry_select == 'member_of') {
      url += "/str/"+entry_text+"/groups-named/members"
    } else if (entry_select == 'follower_of') {
      url += "/str/"+entry_text+"/users-named/followers"
    } else if (entry_select == 'current_job') {
      url += "/str/"+entry_text+"/pages-named/employees/present"
    } else if (entry_select == 'past_job') {
      url += "/str/"+entry_text+"/pages-named/employees/past"
    // Same as current job?
    } else if (entry_select == 'work_at') {
      url += "/str/"+entry_text+"/pages-named/employees/present"
    } else if (entry_select == 'lives_in') {
      url += "/str/"+entry_text+"/pages-named/residents/present"
    } else if (entry_select == 'lived_in') {
      url += "/str/"+entry_text+"/pages-named/residents/past"
    }

  });

  // Add "intersect" to URL for queries with more than one keyword.
  if (iterations++ > 1) {
    url += "/intersect"
  }

  return url
}


function add_new_entry(placeholder, type) {

  var last_entry = $('.entry').eq(-1);
  var last_or_entries = $('.entry[type="OR"]');
  var last_or_entry;

  if (last_or_entries.length > 0) {
    last_or_entry = last_or_entries.eq(-1)
  } else {
    last_or_entry = $('.entry').eq(0);
  }

  var new_entry = placeholder.clone(true);
  new_entry.attr("type", type);
  new_entry.children('.condition').html('<button class="btn btn-sm btn-link">'+type+'</button>');

  if (type == "AND") {
    last_entry.after(new_entry);
  } else if (type == "OR") {
    last_or_entry.after(new_entry);
  }

  new_entry.children('td.text').children('input.entry-text').on("change paste keyup", function (event) {
    $(this).attr('value', $(this).val());
  });


  new_entry.children('td.select').children('select.entry-select').on("change", function (event) {
    var opt = $(this).children("option:selected");
    $(this).children('option[selected="selected"]').removeAttr("selected");
    opt.attr("selected", "selected");
  });

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
  // Also clear placeholders select/text inputs.
  var placeholder = $(".entry").clone(true).eq(0);
  placeholder.children('td.text').children('input.entry-text').attr('value', '');
  placeholder.children('td.select').children('select.entry-select').children('option[selected="selected"]').removeAttr('selected');

  $('.entry-select').on("change", function (event) {
    var opt = $(this).children("option:selected");
    $(this).children('option[selected="selected"]').removeAttr("selected");
    opt.attr("selected", "selected");
  });

  $('.entry-text').on("change paste keyup", function (event) {
    $(this).attr('value', $(this).val());
  });

  // Add new ADD entry.
  $("#and-btn").click(function () {
    add_new_entry(placeholder, "AND");
  });

  // Add new OR entry.
  $("#or-btn").click(function () {
    add_new_entry(placeholder, "OR");
  });

  // Search!
  $("#search-form").submit(function(){
    send_message("save_bg_storage", $("#search-box").html());
    send_message("search", build_URL());
  });

  // Export!
  $("#export-btn").click(function () {
    send_message("export", build_URL());
  });

  // Save query
  $("#save-btn").click(function () {

    first_entry = $(".entry-text").eq(0);

    var storage = chrome.storage.local;
    var query_name = $("#save_query_name").val();
    var search_box = $("form#search-form table#search tbody").html();

    if (first_entry.val() == '') {
      var status = $('#status_notify');
      status.text('Please specify search filters first.');
      setTimeout(function() {
        status.text('');
      }, 1250);
      return
    }
    if (query_name == '') {
      var status = $('#status_notify');
      status.text('Please specify query name.');
      setTimeout(function() {
        status.text('');
      }, 1250);
      return
    }

    


    var obj = {};
    obj[query_name] = build_URL();
    storage.set(obj, function () {
      var status = $('#status_notify');
      status.text('Query saved.');
      setTimeout(function() {
        status.text('');
      }, 1250);
    });
  });

  // Options page
  $('#go-to-options-btn').click(function() {
    if (chrome.runtime.openOptionsPage) {
      // New way to open options pages, if supported (Chrome 42+).
      chrome.runtime.openOptionsPage();
    } else {
      // Reasonable fallback.
      window.open(chrome.runtime.getURL('options.html'));
    }
  });
}

$(document).ready(function () {
  send_message('get_bg_storage', '');
  set_event_handlers();
});
