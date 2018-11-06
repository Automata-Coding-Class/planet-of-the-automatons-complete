require('dotenv').config();
const program = require('commander');
const {prompt} = require('inquirer');
const axios = require('axios').create({timeout: 3000});
const logger = require('./logger.js');
const bot = require('../bot');

logger.info(`process ${process.pid} launched`);

const rejectionHandler = (e) => {
  logger.info(`e: %o`,e);
  // return e;
};

program
  .version('0.0.1');


program
  .command('interactive')
  .alias('in')
  .description('run the program in normal mode')
  .action(function () {
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
        return authenticate(collatedAnswers);
      })
      .then(data => {
        logger.info(`login response: %o`, data);
      }, reason => logger.error(`reason: %s`, reason.message))
  });

program.parse(process.argv);

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
      // console.log(JSON.stringify(answers, null, '   '));
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

function createChatConnection(username) {
  const hostAddress = 'http://localhost:3000/chat';
  logger.info(`connecting to host '${hostAddress}'...`);

  const socket = require('socket.io-client')(hostAddress);

  socket.on('connect', function () {
    logger.info(`connected to host '${hostAddress}'`);
    socket.emit('loginData', {name: username, role: 'player'});
  });
  socket.on('announcement', function (msg) {
    logger.info(`announcement received: ${msg}`)
  });
  socket.on('disconnect', function () {
    logger.info(`disconnected from host '${hostAddress}'`);
  });

  return socket;
}

function createEventConnection(username) {
  const hostAddress = 'http://localhost:3000/events';
  logger.info(`connecting to host '${hostAddress}'...`);

  const socket = require('socket.io-client')(hostAddress);

  socket.on('connect', function () {
    logger.info(`connected to host '${hostAddress}'`);
    socket.emit('loginData', {name: username, role: 'player'});
  });
  socket.on('announcement', function (msg) {
    console.log('announcement: ', msg);
    logger.info(`announcement received: ${msg}`)
  });
  socket.on('game-event', gameEvent => {
    switch(gameEvent.eventName) {
      case 'game-started':
        socket.emit('game-event', {eventName: 'ready'});
        break;
      case 'new-frame':
        console.log('new-frame received:', gameEvent.data);
        socket.emit('game-event', {eventName: 'frame-response', data: bot.processFrame(gameEvent.data)});
        break;
    }
  });

  socket.on('greeting', msg => console.log(msg));
  socket.on('disconnect', function () {
    logger.info(`disconnected from host '${hostAddress}'`);
  });

  return socket;
}
