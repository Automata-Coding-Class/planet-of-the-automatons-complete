const program = require('commander');
const {prompt} = require('inquirer');
const logger = require('./src/logger.js');
const bot = require('./bot');

logger.info(`process ${process.pid} launched`);

program
    .version('0.0.1');


program
    .command('interactive')
    .alias('in')
    .description('run the program in normal mode')
    .action(function () {
        showStartMenu();
    });

program.parse(process.argv);

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

    logger.info('displaying start menu');
    prompt(startMenu)
        .then(answers => {
            // console.log(JSON.stringify(answers, null, '   '));
            logger.info(`user chose option ${answers.start}`);
            switch(answers.start.length > 0 ? answers.start[0].toLowerCase() : '') {
                case 'c':
                    logger.info('will attempt to show connection menu');
                    showConnectionMenu();
                    break;
                case 'q':
                default:
                    logger.info('SAWrry... going to quit :(');
                    quit();
            }
        })

}

function showConnectionMenu(retry) {
    const connectionMenu = {
        type: 'input',
        name: 'username',
        message: (retry ? 'not a valid username. please try again.' : 'what nickname would you like to use?') + ' (letters and numbers only, start with a letter, between 3 and 32 characters)'
    };

    logger.info('displaying connection menu prompt (username)');
    prompt(connectionMenu)
        .then(answers => {
            logger.info(`user entered name '${answers.username}'`);
            if(!/^[a-z0-9]{3,32}$/i.test(answers.username)) {
                logger.error(`user entered invalid username: '${answers.username}'`);
                showConnectionMenu(true);
            } else {
                createEventConnection(answers.username);
                return createChatConnection(answers.username);
            }
        })
        .then((socket) => {
            if(socket) {
                showMainMenu(socket);
            } else {
                //showStartMenu();
            }
        });
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

    logger.info('displaying main menu');
    prompt(mainMenu)
        .then(answers => {
            logger.info(`user chose option ${answers.cmd}`);
            switch(answers.cmd.length > 0 ? answers.cmd[0].toLowerCase() : '') {
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
        type:'input',
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
