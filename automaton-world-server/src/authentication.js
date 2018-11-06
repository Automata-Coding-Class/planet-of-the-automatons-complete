const logger = require('../src/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid/v1');

const tokenExpirationInterval = '24h';
const jwtId = 'automaton-world';
const issuer = 'xyz.walters.rick';

const checkCredentials = function (username, password) {
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

const authenticateUser = function (loginType, username, password) {
  const roles = [];

  if (loginType === 'guest' || loginType === 'player' || checkCredentials(username, password)) {
    logger.info(`authenticated ${loginType} ${username}`);
    roles.splice(0, 0, ...getRoles(loginType, username));
    return {
      username: username, loginType: loginType, roles: roles, token: jwt.sign(
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
        })
    };
  }
};

const verifyToken = function(token) {
  // leave error-handling to the calling blocks (different for REST and sockets)
   return jwt.verify(token, process.env.AUTHENTICATION_SECRET, {
      issuer: issuer,
      jwtid: jwtId
    });
}

const authenticateRequest = function (req, res, next) {
  if (req.method === 'OPTIONS' // accept CORS pre-flight requests without verification
    && req.headers['access-control-request-headers'] !== undefined
    && (/\bauthorization\b/).test(req.headers['access-control-request-headers'])) {
    next();
  } else {

    const authHeaderText = req.headers.authorization;
    const match = (/^Bearer\s+(.+)$/).exec(authHeaderText);
    if (match !== null) {
      const token = match[1];
      try {
        req.decodedToken = verifyToken(token);
        //   jwt.verify(token, process.env.AUTHENTICATION_SECRET, {
        //   issuer: issuer,
        //   jwtid: jwtId
        // });
        logger.info(`decoded token: ${JSON.stringify(req.decodedToken)}`);
        next()
      } catch (e) {
        let message = 'authentication failed';
        if (e.name === 'TokenExpiredError') {
          message = 'authentication token has expired';
        } else if (e.name === 'JsonWebTokenError') {
          message = 'invalid authentication token provided';
        }
        logger.info(`${req.originalUrl}: authentication failed`);
        res.status(401).send(message);
      }
    } else {
      res.status(401).send('no credentials provided')
    }
  }
};

module.exports.verifyToken = verifyToken;
module.exports.authenticateUser = authenticateUser;
module.exports.authenticateRequest = authenticateRequest;


