var calendar_events = {};

calendar_events.open_new_dialog = function() {
  event_vue.event_id = '';
  event_vue.subject = '';
  event_vue.start_date = '';
  event_vue.start_time = '';
  event_vue.end_date = '';
  event_vue.end_time = '';
  event_vue.location = '';
  event_vue.submit_btn = '登録';
  event_vue.action = 'create';
  
  $('#eventDialog').modal('show');
};

calendar_events.submit_event = function() {
  if (event_vue.action == 'create') {
    calendar_events.create_event();
  } else if (event_vue.action == 'update') {
    calendar_events.update_event();
  }
};

calendar_events.create_event = function() {
  var form = $('#eventDialog').find('form').first();
  var params = form.serializeArray();
  $.post('/events', params, function(json) {
    if (json.error) {
      alert(json.message + "\n" + json.error.status + ': ' + json.error.message);
    } else {
      document.location.reload();
    }
  });
  return false;
};

calendar_events.open_edit_dialog = function(event) {
  event_vue.event_id = event.id;
  event_vue.subject = event.subject;
  var start_time = event.start_time;
  if (start_time != '') {
    start_time = new Date(start_time);
    event_vue.start_date = start_time.getFullYear() + '年' + (start_time.getMonth() + 1) + '月' + start_time.getDate() + '日';
    event_vue.start_time = ( '0' + start_time.getHours() ).slice( -2 ) + ':' + ( '0' + start_time.getMinutes() ).slice( -2 );
  }
  var end_time = event.end_time;
  if (end_time != '') {
    end_time = new Date(end_time);
    event_vue.end_date = end_time.getFullYear() + '年' + (end_time.getMonth() + 1) + '月' + end_time.getDate() + '日';
    event_vue.end_time = ( '0' + end_time.getHours() ).slice( -2 ) + ':' + ( '0' + end_time.getMinutes() ).slice( -2 );
  }
  event_vue.location = event.location;
  event_vue.submit_btn = '更新';
  event_vue.action = 'update';
  
  $('#eventDialog').modal('show');
};

calendar_events.update_event = function() {
  var form = $('#eventDialog').find('form').first();
  var params = form.serializeArray();
  $.ajax({
    url: '/events/' + event_vue.event_id,
    method: 'patch',
    data: params,
    success: function() {
      document.location.reload();
    }
  }).fail(function(XMLHttpRequest, textStatus, errorThrown) {
    alert(textStatus + "\n" + XMLHttpRequest.status + ': ' + errorThrown.message);
  });
  return false;
};

calendar_events.delete_event = function(event) {
  var event_id = event.id;
  if (confirm('削除してよろしいですか？')) {
    $.ajax({
      url: '/events/' + event_id,
      method: 'delete',
      success: function() {
        document.location.reload();
      }
    }).fail(function(XMLHttpRequest, textStatus, errorThrown) {
      alert(textStatus + "\n" + XMLHttpRequest.status + ': ' + errorThrown.message);
      document.location.reload();
    });
  }
  return false;
};