const logger = require('../../logger');
const createPendingStateManager = require('./pending-state-manager');
const { createNewGame } = require('./game');
const createGameOptions = require('./game-options');

module.exports = function createGameStateMachine() {
  const states = require('./game-states')();

  let allowSameStateTransitions = false;
  let currentState = states.stopped;

  function getCurrentState() {
    return currentState.name;
  }

  function enterErrorCondition(message, ...data) {
    logger.info(`GameStateMachine.enterErrorCondition: ${message}, ${JSON.stringify(data)}`);
    if (playerAcknowledgementPromiseManager !== undefined)
      playerAcknowledgementPromiseManager.reject(message);
    currentState = states.errorCondition;
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

  function addPlayer(id, userData) {
    if (getCurrentState() === states.stopped.name) {
      playerList.set(id, userData);
      return true;
    }
    return false;
  }

  // function getPlayerList() {
  //   return Array.from(playerList.entries()).reduce((acc, entry) => {
  //     const player = {id: entry[0]};
  //     Object.assign(player, entry[1]);
  //     acc.push(player);
  //     return acc;
  //   }, []);
  // }

  function getNumberOfPlayers() {
    return playerList.size;
  }

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

  let playerAcknowledgementPromiseManager = createPendingStateManager(run, () => setState(states.errorCondition));

  function start() {
    setState(states.starting);
    return new Promise(playerAcknowledgementPromiseManager.makePromiseHandler);
  }

  function run() {
    setState(states.processingFrame);
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
    getCurrentState: getCurrentState,
    addPlayer: addPlayer,
    getNumberOfPlayers: getNumberOfPlayers,
    acceptPlayerAcknowledgment: acceptPlayerAcknowledgment,
    start: start,
    reset: reset
  };
};
