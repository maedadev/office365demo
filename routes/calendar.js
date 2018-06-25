// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');

/* GET /calendar */
router.get('/', async function(req, res, next) {
  let params = { title: 'Calendar', active: { calendar: true } };

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

      params.debug = JSON.stringify(params.events, null, 2);

      res.render('calendar', params);
    } catch (err) {
      params.message = 'Error retrieving events';
      params.error = { status: `${err.code}: ${err.message}` };
      params.debug = JSON.stringify(err.body, null, 2);
      res.render('error', params);
    }
    
  } else {
    // Redirect to home
    res.redirect('/');
  }
});

module.exports = router;