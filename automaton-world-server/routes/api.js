const express = require('express');
const router = express.Router();
const logger = require('../src/logger');

const Authentication = require('../src/authentication');
const authenticateUser = Authentication.authenticateUser;
const authenticateRequest = Authentication.authenticateRequest;

router.use('/secure', authenticateRequest, require('./api-secure'));

router.get('/helloworld', function (req, res, next) {
  res.json({message: 'hello wolrd'});
});


router.post('/authenticate', function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const loginType = req.body.loginType;

  const authResponse = authenticateUser(loginType, username, password);
  if (authResponse !== undefined) {
    res.status(200).json(authResponse);
  } else {
    logger.error(`unknown username/password combo: ${username}/${password}`);
    res.status(401).json({message: 'unknown user/password combo'});
  }
});


module.exports = router;

// first iat = ‌1540938540
