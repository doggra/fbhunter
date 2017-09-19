var queries;

function restore_queries() {
	chrome.storage.local.get(null, function(items) {
		queries = items;
		for (var key in items) {
			if (items.hasOwnProperty(key)) {
				$("table#saved_queries tbody").append("<tr><td>"+key+"</td><td><button class='export_btn btn btn-sm btn-primary' id='export_"+key+"'>Export</button>&nbsp;&nbsp;<button key='"+key+"' class='delete_btn btn btn-sm btn-danger' id='delete_"+key+"'>Delete</button></td></tr>");
			}
		}
	});
}


$(document).ready(function () {

  restore_queries();

  $("#clear_storage").click(function () {
	chrome.storage.local.clear(function() {
	    var error = chrome.runtime.lastError;
	    if (error) {
	        console.error(error);
	    }
	});
	location.reload();
  });

  setTimeout(function () {
	$(".export_btn").click(function () {
		var url = queries[$(this).attr('id').slice(7,)];
		chrome.runtime.sendMessage({
		    from: 'options',
		    subject: 'export',
		    content: url
		});
	});

	$(".delete_btn").click(function () {
		var _id = $(this).attr('key');
		console.log(_id);
		chrome.storage.local.remove([_id],function(){
		 var error = chrome.runtime.lastError;
		    if (error) {
		        console.error(error);
		    }
		})
		location.reload();
	});
  }, 700)
	
});
