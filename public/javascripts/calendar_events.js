var calendar_events = {};

calendar_events.create_event = function(trigger) {
  var form = $(trigger).closest('.modal').find('form').first();
  var params = form.serializeArray();
  $.post('/events', params, function(json) {
    if (json.error) {
      alert(json.message + "\n" + json.error.status + ': ' + json.error.message);
    } else {
      document.location.reload();
    }
  });
};