// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');

/* GET home page. */
router.get('/', async function(req, res, next) {
  let params = { title: 'Home', active: { home: true } };

  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    params.user = userName;
    params.debug = `User: ${userName}\nAccess Token: ${accessToken}`;
  } else {
    params.signInUrl = authHelper.getAuthUrl();
    params.debug = params.signInUrl;
  }

  res.render('index', params);
});

module.exports = router;
