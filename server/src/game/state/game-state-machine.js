const logger = require('../../logger');
const createPendingStateManager = require('./pending-state-manager');

module.exports = function createGameStateMachine() {
  const states = require('./game-states')();

  let allowSameStateTransitions = false;
  let currentState = states.initialized;

  function getCurrentStatus() {
    return currentState;
  }

  function enterErrorCondition(message, ...data) {
    logger.info(`GameStateMachine.enterErrorCondition: ${message}, ${JSON.stringify(data)}`);
    // if (playerAcknowledgementPromiseManager !== undefined)
    //   playerAcknowledgementPromiseManager.reject(message);
    currentState = states.errorCondition;
    if(process.env.NODE_ENV === 'dev') {
      throw new Error(message);
    }
  }

  function setState(newState) {
    if (allowSameStateTransitions && newState === currentState) {
      // do nothing
    } else if (currentState.permissibleNextStates.includes(newState)) {
      currentState = newState;
    } else {
      enterErrorCondition(`invalid state transition (from ${currentState.name} to ${newState.name})`);
    }
  }

  const playerList = new Map();
  const playerAcknowledgements = new Set();

  function acceptPlayerAcknowledgment(id) {
    if (currentState === states.starting && playerList.has(id)) {
      playerAcknowledgements.add(id);
      if (playerAcknowledgements.size === playerList.size) {
        playerAcknowledgementPromiseManager.resolve();
      }
      return true;
    }
    return false;
  }

  // let playerAcknowledgementPromiseManager = createPendingStateManager(run, () => setState(states.errorCondition));

  function start() {
    setState(states.awaitingFrameResponse);
    // return new Promise(playerAcknowledgementPromiseManager.makePromiseHandler);
  }

  function wait() {
    setState(states.awaitingFrameResponse);
  }

  function run() {
    setState(states.processingFrame);
  }

  function pause() {
    setState(states.paused);
  }

  function resume() {
    setState(states.running);
  }

  function stop() {
    setState(states.stopped);
  }

  function reset() {
    // TODO: insert actual game reset code here
    // doesn't go through the normal function because it's a 'hard reset'; assumes the existence of
    // necessary reset code in this function block. To start with
    playerList.clear();
    playerAcknowledgements.clear();
    // =======
    currentState = states.stopped;
  }

  return {
    states: states,
    getCurrentStatus: getCurrentStatus,
    start: start,
    pause: pause,
    resume: resume,
    stop: stop,
    wait: wait,
    reset: reset,
  };
};
