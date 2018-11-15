const createGameStateMachine = require('./game-state-machine');

const rows = 9, cols = 14;

describe('GameStateMachine', () => {
  const players = [
    {id: 'ABC', name: 'boris'},
    {id: 'DEF', name: 'fnord'},
    { id: 'GHI', name: 'quux' }
    ];

  describe('constructor', () => {
    const rows = 9, cols = 14;
    test('creates a new instance with correct initial values', () => {
      const gameStateMachine = createGameStateMachine(rows, cols);
      expect(gameStateMachine.getCurrentState()).toBe('stopped');
    })
  });
  describe('add and remove players', () => {
    const rows = 9, cols = 14;
    const gameStateMachine = createGameStateMachine(rows, cols);
    test('player count is correct', () => {
      expect(gameStateMachine.addPlayer('ABCD', {name: 'boris'})).toBe(true);
      expect(gameStateMachine.getNumberOfPlayers()).toBe(1);
    });
  });

  describe('start game', () => {
    test('add players', () => {
      const gameStateMachine = createGameStateMachine(rows, cols);
      gameStateMachine.reset();
      expect(gameStateMachine.getCurrentState()).toBe('stopped');
      expect(gameStateMachine.getNumberOfPlayers()).toBe(0);
      gameStateMachine.start().catch(e => expect(e).toBeNull());
      expect(gameStateMachine.getCurrentState()).toBe('starting');
      gameStateMachine.start().catch(e => { expect(e).not.toBeNull() });
      expect(gameStateMachine.getCurrentState()).toBe('error');
      gameStateMachine.reset();
      expect(gameStateMachine.getCurrentState()).toBe('stopped');
      expect(gameStateMachine.addPlayer(players[0].id, players[0])).toBe(true);
      expect(gameStateMachine.addPlayer(players[1].id, players[1])).toBe(true);
      expect(gameStateMachine.getNumberOfPlayers()).toBe(2);
      gameStateMachine.start().catch(e => expect(e).toBeNull());
      expect(gameStateMachine.getCurrentState()).toBe('starting');
      expect(gameStateMachine.addPlayer(players[2].id, players[2])).toBe(false);
      expect(gameStateMachine.getNumberOfPlayers()).toBe(2);
    });
  });

  describe('acknowledge players', () => {
    test('acknowledge players', () => {
      const gameStateMachine = createGameStateMachine(rows, cols);
      players.forEach(val => gameStateMachine.addPlayer(val.id, val));
      expect(gameStateMachine.getNumberOfPlayers()).toBe(3);
      const startPromise = gameStateMachine.start();

      expect(gameStateMachine.acceptPlayerAcknowledgment(players[0].id)).toBe(true);
      // intentionally out of sequence
      expect(gameStateMachine.acceptPlayerAcknowledgment(players[2].id)).toBe(true);
      expect(gameStateMachine.acceptPlayerAcknowledgment(players[1].id)).toBe(true);
      return startPromise
        .then(() => {
          expect(gameStateMachine.getCurrentState()).toBe('processingFrame');
        })
        .catch(e => {
          expect(e).toBeNull();
        });
    });

    // TODO: either this test or the tests above work, but not both; determine what the collision is
    // test('acknowledge player timeout', () => {
    //   expect.assertions(3);
    //   const gameStateMachine = createGameStateMachine(rows, cols);
    //   players.forEach(val => gameStateMachine.addPlayer(val.id, val));
    //   const startPromise = gameStateMachine.start();
    //   expect(gameStateMachine.acceptPlayerAcknowledgment(players[0].id)).toBe(true);
    //   return startPromise.catch(e => {
    //     expect(e).toMatchObject({type: 'error'});
    //     expect(gameStateMachine.getCurrentState()).toBe('error');
    //   });
    // }, 3000);
  });

  describe('instance independence', () => {
    const gameStateMachine = createGameStateMachine(rows, cols);
    const gameStateMachine2 = createGameStateMachine(rows, cols);
    expect(gameStateMachine.addPlayer(players[0].id, players[0])).toBe(true);
    expect(gameStateMachine.getNumberOfPlayers()).toBe(1);
    expect(gameStateMachine2.getNumberOfPlayers()).toBe(0);
    gameStateMachine.start();
    expect(gameStateMachine.getCurrentState()).toBe('starting');
    expect(gameStateMachine2.getCurrentState()).toBe('stopped');
  })

});
