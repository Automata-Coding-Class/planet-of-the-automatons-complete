require('dotenv').config();
const { prompt } = require('inquirer');
const logger = require('./logger.js');
const authenticate = require('./authentication').authenticate;
const createSocketManager = require('./socket-connections/socket-manager');
const bot = require('../bot');

// require(path.join(path.dirname(require.main.filename), '../package.json')).name ||
process.env.APP_NAME = process.env.PROCESS_NAME/* || require.main.filename*/;

logger.info(`process ${process.pid} launched. NODE_ENV = ${process.env.NODE_ENV}`);

const run = async () => {
  showStartMenu()
    .then(() => {
        return showConnectionMenu();
      },
      () => {
        quit();
        return Promise.reject('exiting');
      })
    .then(connectionAnswers => {
      logger.info(`answers: %o`, connectionAnswers);
      return showLoginMenu()
        .then(loginAnswers => {
          return Object.assign({}, connectionAnswers, loginAnswers);
        });
    })
    .then(collatedAnswers => {
      logger.info(`collatedAnswers: %o`, collatedAnswers);
      return authenticate(collatedAnswers)
        .then(loginResponse => {
          return Object.assign({}, loginResponse, collatedAnswers);
        })
    })
    .then(data => {
      logger.info(`login response: %o`, data);
      const socketManager = createSocketManager(`http://${data.serverAddress}:${data.serverPort}`);
      return socketManager.openAllConnections(data.token)
        .then(() => { return socketManager; })
    })
    .then(response => {
      logger.info(`well, there you have it: %o`, response);
    }, reason => logger.error(`reason: %s`, reason.message))
}

function showStartMenu() {
  const startMenu = {
    type: 'rawlist',
    name: 'start',
    message: 'What do you want to do?',
    choices: [
      {name: 'Connect to the server', short: 'connect'},
      {name: 'Quit', short: 'quit'}
    ]
  };
  return prompt(startMenu)
    .then(answers => {
      if (answers.start[0].toLowerCase() === 'c') {
        return true;
      } else {
        throw new Error('quitting');
      }
    });
}

function showConnectionMenu() {
  return prompt({
    type: 'input',
    name: 'serverAddress',
    message: `what is the server's network address? [currently '${process.env.DEFAULT_HOSTNAME}']`,
    default: process.env.DEFAULT_HOSTNAME
  })
    .then(answers => {
      if (!answers.serverAddress) {
        answers.serverAddress = process.env.DEFAULT_HOSTNAME;
      }
      return answers;
    })
    .then(serverAnswers => {
      return prompt({
        type: 'input',
        name: 'serverPort',
        message: `what port is the server running on? [currently '${process.env.DEFAULT_PORT}']`,
        default: process.env.DEFAULT_PORT
      }).then(portAnswers => {
        Object.assign(serverAnswers, portAnswers);
        return serverAnswers;
      })
    })
}

function showLoginMenu() {
  const loginMenu = {
    type: 'input',
    name: 'username',
    message: ('what nickname would you like to use?') + ' (letters and numbers only, start with a letter, between 3 and 32 characters)'
  };
  return prompt(loginMenu)
    .then(answers => {
      if (!/^[a-z0-9]{3,32}$/i.test(answers.username)) {
        throw new Error('not a valid username. please try again.');
      } else {
        logger.info(`success case: %s`, answers.username);
        return answers;
        // createEventConnection(answers.username);
        // return createChatConnection(answers.username);
      }
    });
    // .then((socket) => {
      //   if (socket) {
      //     showMainMenu(socket);
      //   } else {
      //     //showStartMenu();
      //   }
    // });
}

function showMainMenu(socket) {
  const mainMenu = {
    type: 'rawlist',
    name: 'cmd',
    message: 'what would you like to do?',
    choices: [
      {name: 'Send a message', value: 'm'},
      {name: 'Close connection and quit', value: 'q'}
    ]
  };
  prompt(mainMenu)
    .then(answers => {
      logger.info(`user chose option ${answers.cmd}`);
      switch (answers.cmd.length > 0 ? answers.cmd[0].toLowerCase() : '') {
        case 'm':
          sendMessageFromPrompt(socket);
          break;
        case 'q':
          quit(socket);
          break;
      }
    })
}

function sendMessageFromPrompt(socket) {
  logger.info('displaying message input prompt');
  prompt({
    type: 'input',
    name: 'userMessage',
    message: 'what would you like to say?'
  })
    .then(answers => {
      logger.info(`user entered '${answers.userMessage}'`);
      socket.emit('message', answers.userMessage);
    })
    .then(() => {
      showMainMenu(socket);
    })
}

function closeConnection(socket) {
  if (socket) {
    logger.info(`disconnecting from host`);
    socket.close();
  }
}

function quit(socket) {
  logger.info(`exiting process ${process.pid}`);
  closeConnection(socket);
  setTimeout(() => {
    process.exit();
  }, 250);
}

run()
  .then(() => {
    logger.info(`run loop completed`);
  });

module.exports = {
  authenticate: authenticate,
  showStartMenu: showStartMenu,
}
