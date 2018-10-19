const logger = require('../../logger');

function createPendingStateManager(nextAction, failureAction = () => {}, timeoutInterval = 1000) {
  let resolverFunction = undefined,
    rejectionFunction = undefined,
    timeout = undefined;

  function makePromiseHandler(resolvePromise, rejectPromise) {
    resolverFunction = resolvePromise;
    rejectionFunction = rejectPromise;
    timeout = setTimeout(() => {
      const message = 'promise handler has timed out';
      // if(rejectionFunction !== undefined) rejectionFunction({type: 'error', message: message});
      reject(message);
    }, timeoutInterval);
  }

  function resolve() {
    if (nextAction !== undefined) nextAction();
    if(timeout !== undefined) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    if (resolverFunction !== undefined) {
      resolverFunction();
      resolverFunction = undefined;
    }
  }

  function reject(message) {
    failureAction();
    if(rejectionFunction !== undefined) rejectionFunction({type: 'error', message: message});
  }

  return {
    makePromiseHandler: makePromiseHandler,
    resolve: resolve
  }
}

module.exports = function createGameStateMachine(rows, cols) {
  const states = (() => {
    const stateObj = {};
    stateObj.errorCondition = {name: 'error', permissibleNextStates: []};
    stateObj.starting = {
      name: 'starting',
      permissibleNextStates: [stateObj.running, stateObj.errorCondition]
    };
    stateObj.stopped = {
      name: 'stopped',
      permissibleNextStates: [stateObj.starting, stateObj.running, stateObj.errorCondition]
    };
    stateObj.running = {
      name: 'running',
      permissibleNextStates: [stateObj.stopped, stateObj.errorCondition]
    };
    stateObj.processingFrame = {
      name: 'processingFrame',
      permissibleNextStates: [stateObj.running, stateObj.awaitingFrameResponse, stateObj.errorCondition]
    };
    stateObj.awaitingFrameResponse = {name: 'awaitingFrameResponse',};
    return stateObj;
  })();

  let currentState = states.stopped;

  function getCurrentState() {
    return currentState.name;
  }

  function enterErrorCondition(message, ...data) {
    logger.info(`GameStateMachine.enterErrorCondition: ${message}, ${JSON.stringify(data)}`);
    currentState = states.errorCondition;
  }

  function setState(newState) {
    if (currentState.permissibleNextStates.includes(newState)) {
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
    setState(states.running);
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
    size: {rows: rows, cols: cols},
    getCurrentState: getCurrentState,
    addPlayer: addPlayer,
    getNumberOfPlayers: getNumberOfPlayers,
    acceptPlayerAcknowledgment: acceptPlayerAcknowledgment,
    start: start,
    reset: reset
  };
};
