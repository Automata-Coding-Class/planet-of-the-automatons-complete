const router = require('express').Router({});
const logger = require('../src/logger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uuid = require('uuid/v1');

router.options(function(req, res, next) {
  next();
});

router.get('/test', function (req, res) {
  logger.info(`${req.path} called. decoded token = ${JSON.stringify(req.decodedToken)}`);
  res.status(200).json('successfully accessed secure test endpoint!!');
});

module.exports = router;
