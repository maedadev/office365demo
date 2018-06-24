var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');

/* GET /users */
router.get('/', async function(req, res, next) {
  let params = { title: '社員', active: { users: true } };

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
      const result = await client
      .api('/users')
      .top(10)
      .get();

      params.users = result.value;
      params.debug = JSON.stringify(params.users, null, 2);
      res.render('users', params);
    } catch (err) {
      params.message = '社員を取得できませんでした。';
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