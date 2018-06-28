var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');

/* POST /events */
router.post('/', async function(req, res, next) {
  let params = { title: 'イベント', active: { calendar: true } };

  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    params.user = userName;

    // Initialize Graph client
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    try {
    console.log(req.body);
      start = req.body.start_date + 'T' + req.body.start_time + ':00';
      start = start.replace('年', '-').replace('月', '-').replace('日', '');
      end = req.body.end_date + 'T' + req.body.end_time + ':00';
      end = end.replace('年', '-').replace('月', '-').replace('日', '');

      const event = {
        "Subject": req.body.subject,
        "Start": {
          "DateTime": start,
          "TimeZone": 'Tokyo Standard Time'
          },
        "End": {
          "DateTime": end,
          "TimeZone": 'Tokyo Standard Time'
          },
        "Location": {
          "DisplayName": req.body.location
          }
      };

      const result = await client
      .api('/me/events')
      .post(event);
      
      res.send(result.value);
    } catch (err) {
      params.message = '予定を登録できませんでした。';
      params.error = { status: `${err.code}: ${err.message}` };
      params.debug = JSON.stringify(err.body, null, 2);
      res.send(params);
    }
    
  } else {
    // Redirect to home
    res.redirect('/');
  }
});

/* PATCH /events/id */
router.patch('/:id([a-zA-Z0-9=_&-]+)', async function(req, res, next) {
  let params = { title: 'イベント', active: { calendar: true } };

  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    params.user = userName;

    // Initialize Graph client
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    try {
    console.log(req.body);
      start = req.body.start_date + 'T' + req.body.start_time + ':00';
      start = start.replace('年', '-').replace('月', '-').replace('日', '');
      end = req.body.end_date + 'T' + req.body.end_time + ':00';
      end = end.replace('年', '-').replace('月', '-').replace('日', '');

      const event = {
        "Subject": req.body.subject,
        "Start": {
          "DateTime": start,
          "TimeZone": 'Tokyo Standard Time'
          },
        "End": {
          "DateTime": end,
          "TimeZone": 'Tokyo Standard Time'
          },
        "Location": {
          "DisplayName": req.body.location
          }
      };

      const result = await client
      .api('/me/events/' + req.params.id)
      .patch(event);

      res.send(result.value);
    } catch (err) {
      params.message = '予定を更新できませんでした。';
      params.error = { status: `${err.code}: ${err.message}` };
      params.debug = JSON.stringify(err.body, null, 2);
      res.send(params);
    }
    
  } else {
    // Redirect to home
    res.redirect('/');
  }
});

/* DELETE /events/id */
router.delete('/:id([a-zA-Z0-9=_-]+)', async function(req, res, next) {
  let params = { title: 'イベント', active: { calendar: true } };

  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    params.user = userName;

    // Initialize Graph client
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    try {
      console.log(req.body);
      const result = await client
      .api('/me/events/' + req.params.id)
      .delete();

      res.send(result.value);
    } catch (err) {
      params.message = '予定を削除できませんでした。';
      params.error = { status: `${err.code}: ${err.message}` };
      params.debug = JSON.stringify(err.body, null, 2);
      res.send(params);
    }
    
  } else {
    // Redirect to home
    res.redirect('/');
  }
});

/* GET /events */
router.get('/', async function(req, res, next) {
  let params = { title: 'Events', active: { calendar: true } };
  
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    params.user = userName;

    // Initialize Graph client
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    // Set start of the calendar view to today at midnight
    const start = new Date(new Date().setHours(0,0,0));
    // Set end of the calendar view to 7 days from start
    const end = new Date(new Date(start).setDate(start.getDate() + 365));
    
    try {
      const result = await client
      .api(`/me/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`)
      .top(20)
      .orderby('start/dateTime ASC')
      .get();

      params.events = result.value;
      params.events.forEach(function(event) {
        if (event.start.dateTime) {
          let utc = event.start.dateTime.slice(0, 19) + '+00:00';
          let jst = new Date(utc).toLocaleString()
          event.start.dateTimeLocal = jst.slice(0, jst.length -3);
        }
        if (event.end.dateTime) {
          let utc = event.end.dateTime.slice(0, 19) + '+00:00';
          let jst = new Date(utc).toLocaleString()
          event.end.dateTimeLocal = jst.slice(0, jst.length -3);
        }
      });
      res.send({events: params.events});
    } catch (err) {
      params.message = 'Error retrieving events';
      params.error = { status: `${err.code}: ${err.message}` };
      params.debug = JSON.stringify(err.body, null, 2);
      res.send({events: []});
    }
    
  } else {
    res.send({events: []});
  }
});

module.exports = router;