const express = require('express');
const router = express.Router();
const logger = require('../src/logger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uuid = require('uuid/v1');

const tokenExpirationInterval = '24h';
const jwtId = 'automaton-world';
const issuer = 'xyz.walters.rick';

router.get('/helloworld', function (req, res, next) {
  res.json({message: 'hello wolrd'});
});

const authenticate = function (username, password) {
  return (username === 'admin' && password === 'admin')
    || (username === 'user' && password === 'user');
};

const getRoles = function(loginType, username) {
  switch(loginType) {
    case 'guest':
      return ['guest'];
      break;
    case 'registeredUser':
      switch(username) {
        case 'admin':
          return ['user', 'admin'];
          break;
        default:
          return ['user'];
          break;
      }
    default:
      return [];
      break;
  }
};

router.post('/authenticate', function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const loginType = req.body.loginType;
  const roles = [];

  if (loginType === 'guest' || authenticate(username, password)) {
    logger.info(`authenticated ${loginType} ${username}`);
    roles.splice(0, 0, ...getRoles(loginType, username));
    const token = jwt.sign(
      {
        id: username,
        userId: uuid(),
        username: username,
        loginType: loginType,
        roles: roles
      },
      process.env.AUTHENTICATION_SECRET,
      {
        expiresIn: tokenExpirationInterval,
        jwtid: jwtId,
        issuer: issuer
      });
    res.status(200).json({username: username, loginType: loginType, roles: roles, token: token});
  } else {
    logger.error(`unknown username/password combo: ${username}/${password}`);
    res.status(401).json({message: 'unknown user/password combo'});
  }
});

router.get('/securepathtest', function (req, res) {
  const authHeaderText = req.headers.authorization;
  const match = (/^Bearer\s+(.+)$/).exec(authHeaderText);
  if (match !== null) {
    const token = match[1];
    try {
      const verifiedPayload = jwt.verify(token, process.env.AUTHENTICATION_SECRET, {
        issuer: issuer,
        jwtid: jwtId
      });
      logger.info(`verifiedPayload: ${JSON.stringify(verifiedPayload)}`);
      logger.info(`securepath succesfully called`);
      res.status(200).json('successfully accessed endpoint using JWT!!');
    } catch (e) {
      if (e.name === 'TokenExpiredError') {

      } else if (e.name === 'JsonWebTokenError') {

      }
      logger.info(`/api/securepath: authentication failed`);
      res.status(401).send('authentication failed');
    }
  } else {
    res.status(401).send('no credentials provided')
  }
});

module.exports = router;

// first iat = ‌1540938540
