const SocketServerCore = require('./socket-server-core');
const sanitizeToken = require('../authentication').sanitizeToken;
const uuid = require('uuid/v1');

const eventNamespaceIdentifier = 'event';

class EventServer extends SocketServerCore {

  constructor(socketServer) {
    super(socketServer);
    this.namespaceIdentifier = eventNamespaceIdentifier; // used by SocketServerCore
    this.pendingStates = new Map();
  }

  addSocketEvents(socket) {
    socket.on('playerListRequest', (fn) => {
      const players = Object.keys(socket.nsp.sockets).reduce((playerList, socketKey) => {
        const token = socket.nsp.sockets[socketKey].decodedToken;
        if (token !== undefined && token.loginType === 'player') {
          playerList.push(sanitizeToken(token));
        }
        return playerList;
      }, []);
      fn({players: players});
    });
    socket.on('frameResponse', (frameResponse) => {
      this.log(`frameResponse received: %o`, frameResponse);
      if (this.pendingStates.has(frameResponse.frameId)) {
        const pState = this.pendingStates.get(frameResponse.frameId);
        pState.checkId(socket.decodedToken.userId, frameResponse.response);
      }
    });
  }

  beforePublish(eventName, ...args) {
    args.unshift(new Date());
    return args;
  }

  getActivePlayerList() {
    return Object.keys(this.namespace.sockets).reduce((playerList, socketKey) => {
      const token = this.namespace.sockets[socketKey].decodedToken;
      if (token !== undefined && token.loginType === 'player') {
        playerList.push(sanitizeToken(token));
      }
      return playerList;
    }, []);
  }

  getActivePlayerSockets() {
    return Object.keys(this.namespace.sockets).reduce((socketList, socketKey) => {
      const token = this.namespace.sockets[socketKey].decodedToken;
      if (token !== undefined && token.loginType === 'player') {
        socketList.push(this.namespace.sockets[socketKey]);
      }
      return socketList;
    }, [])
  }

  broadcastGameInitialization(gameData) {
    this.log('broadcasting game initialization for game %s', JSON.stringify(gameData));
    const sanitizedData = Object.assign({}, gameData);
    delete sanitizedData.layout;
    this.log('sanitized data: %o', sanitizedData);
    this.publishEvent('newGameCreated', sanitizedData);
  }

  pauseGame() {
    this.log(`pauseGame - pendingStates: ${JSON.stringify(this.pendingStates)}`);
    this.publishEvent('gamePaused');
    // this.pendingStates.clear();
  }

  resumeGame() {
    this.publishEvent('gameResumed');
    // this.pendingStates.clear();
  }

  stopGame(gameId) {
    this.publishEvent('gameStopped', gameId);
    this.pendingStates.clear();
  }

  createPendingState(gameId, stateId, nextAction, idList, timeoutPeriod) {
    const pendingIds = new Set(idList);
    const collectedResponses = {};
    const timeout = setTimeout(() => {
      this.log(`wah, the pending state timed out :(`);
    }, timeoutPeriod);
    const checkId = (id, payload) => {
      this.log(`checkId %s: %o`, id, payload);
      if (pendingIds.has(id)) {
        // process payload
        console.log(`deleting id %s`, id);
        if (payload !== undefined) {
          collectedResponses[id] = payload;
        }
        pendingIds.delete(id);
      }
      if (pendingIds.size === 0) {
        console.log(`all pending ids resolved. will not time out`, collectedResponses);
        clearTimeout(timeout);
        if (nextAction !== undefined) {
          nextAction(collectedResponses);
        }
        this.clearPendingState(stateId);
      }
    }
    return {
      checkId: checkId
    }
  }

  clearPendingState(stateId) {
    this.pendingStates.delete(stateId);
  }

  distributeGameState(gameState) {
    const gameId = gameState.id;
    const frame = gameState.frame;
    this.log(`distributing game state for ${gameId}: %o`, frame);
    const playerSockets = this.getActivePlayerSockets();
    const frameId = uuid();
    const notifiedPlayers = [];
    playerSockets.forEach(socket => {
      if (socket.decodedToken !== undefined && socket.decodedToken.loginType === 'player') {
        notifiedPlayers.push(socket.decodedToken.userId);
        socket.emit('newFrame', {
          gameId: gameId,
          frameId: frame.id,
          data: frame.packets !== undefined ? frame.packets[socket.decodedToken.userId] : undefined
        });
      }
    });
    const pendingState = this.createPendingState(gameId, frameId, (collectedResponses) => {
      this.log(`all frame responses received: %o`, collectedResponses);
        this.emit('frameResponsesReceived', {gameId: gameId, frameResponse: collectedResponses});
      }, notifiedPlayers, 500);
    this.pendingStates.set(frame.id, pendingState);
  }

  // add local event handlers here
}

module.exports = EventServer;
