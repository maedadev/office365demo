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

module.exports = router;