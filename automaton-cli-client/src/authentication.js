const axios = require('axios');
const logger = require('./logger');

function authenticate(options) {
  const authenticationUrl = `http://${options.serverAddress}:${options.serverPort}/api/authenticate`;
  logger.info(`authenticationUrl=%s`, authenticationUrl);
  return axios.post(authenticationUrl, {
    loginType: 'player',
    username: options.username
  })
    .then(response => {
        logger.info(`authentication.authenticate response:`, response);
        return response.data;
      },
      err => {
        // logger.info(`an error occurred: %O`, err);
        throw err;
      });
}

module.exports = {
  authenticate: authenticate
}
