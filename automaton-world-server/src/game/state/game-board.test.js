const createGameBoard = require('./game-board');

const rows = 4, columns = 5;

function generateState(inputValueString) {
  let playerId = -1, obstacleId = -1, assetId = -1;
  return inputValueString.split('').reduce((generatedState, c) => {
    switch (c) {
      case 'a':
        generatedState.push({type: 'asset', id: `asset_${++assetId}`});
        break;
      case 'o':
        generatedState.push({type: 'obstacle', id: `obstacle_${++obstacleId}`});
        break;
      case 'p':
        generatedState.push({type: 'player', id: `player_${++playerId}`});
        break;
      case 't':
        generatedState.push({type: 'target', id: `primary_target`});
        break;
      case 'e':
        generatedState.push(undefined);
        break;
      default:
        // do nothing
        break;
    }
    return generatedState;
  }, []);
}

describe('generateState helper', () => {
  test('state is correctly generated from an input string', () => {
    const inputString = 'eoee_epeo_oaee_etap';
    const generatedState = generateState(inputString);
    expect(generatedState.length).toBe(16);
    expect(generatedState[0]).toBe(undefined);
    expect(generatedState[15].type).toBe('player');
    expect(generatedState[14].type).toBe('asset');
    expect(generatedState[13]).toMatchObject({id: 'primary_target', type: 'target'});
    expect(generatedState[8].type).toBe('obstacle');
  })
});

describe('GameBoard', () => {
  const players = [
    {id: 'ABC', name: 'boris'},
    {id: 'DEF', name: 'fnord'},
    {id: 'GHI', name: 'quux'}
  ];

  describe('initialization', () => {
    test('created board has correct number of cells', () => {
      const gameBoard = createGameBoard(rows, columns);
      expect(gameBoard.getNumberOfCells()).toBe(20);
    })
  });

  describe('add players', () => {
    const gameBoard = createGameBoard(rows, columns);
    const playerIds = players.map(player => player.id);
    const numberOfObstacles = 6, numberOfTokens = playerIds.length * 2;
    test('board has correct number of obstacles and tokens', () => {
      gameBoard.setUpBoard(numberOfObstacles, numberOfObstacles);
      const currentState = gameBoard.getCurrentState();
      expect(currentState.filter(elem => elem !== undefined && elem.type === 'obstacle').length)
        .toBe(numberOfObstacles);
      expect(currentState.filter(elem => elem !== undefined && elem.type === 'asset').length)
        .toBe(numberOfTokens);
    });
    test('board has correct number of players', () => {
      gameBoard.distributePlayers(playerIds);
      expect(gameBoard.getCurrentState()
        .filter(elem => elem !== undefined && elem.type === 'player').length).toBe(3);
    });
  });

  describe('load state', () => {
    const savedState = [{type: 'asset', id: 'asset_0'},
      undefined,
      {type: 'asset', id: 'asset_1'},
      {type: 'target', id: 'primary_target'},
      {type: 'asset', id: 'asset_5'},
      {type: 'asset', id: 'asset_4'},
      undefined,
      {type: 'asset', id: 'asset_3'},
      {type: 'obstacle', id: 'obstacle_2'},
      {type: 'obstacle', id: 'obstacle_5'},
      undefined,
      undefined,
      {type: 'obstacle', id: 'obstacle_0'},
      {type: 'asset', id: 'asset_2'},
      {type: 'obstacle', id: 'obstacle_1'},
      {type: 'obstacle', id: 'obstacle_3'},
      undefined,
      undefined,
      undefined,
      {type: 'obstacle', id: 'obstacle_4'}];
    const gameBoard = createGameBoard(rows, columns);
    test('saved state loads correctly', () => {
      gameBoard.loadState(savedState);
      const currentState = gameBoard.getCurrentState();
      expect(currentState.length).toBe(20);
      expect(currentState.filter(elem => elem !== undefined).length).toBe(13);
    })
  });

  describe('process frame responses', () => {
    // grid: visual representation
    // ┌───┬───┬───┬───┐
    // │   │ o │   │   │
    // ├───┼───┼───┼───┤
    // │   │ p │   │ o │
    // ├───┼───┼───┼───┤
    // │ o │ a │   │   │
    // ├───┼───┼───┼───┤
    // │   │ t │ a │ p │
    // └───┴───┴───┴───┘
    const savedState = generateState('eoee_epeo_oaee_etap');
    const gameBoard = createGameBoard(4, 4);
    gameBoard.loadState(savedState);

    test('frameResponse with successful moves to empty cells', () => {
      expect.assertions(2);
      const expectedState = generateState('eoee_peeo_oaep_etae');
      const frameResponses = [
        {id: 'player_0', action: {type: 'move', direction: 'left'}},
        {id: 'player_1', action: {type: 'move', direction: 'up'}},
      ];
      // const expectedResultState =
      return gameBoard.processFrameResponses(frameResponses)
        .then(currentState => {
          expect(currentState).not.toBeNull();
          // console.log(`current state:`, currentState);
          expect(currentState).toMatchObject(expectedState);
        })
        .catch(e => {
          // console.log(`e:`, e);
          expect(e.Received).not.toBeNull();
        });
    })
  })
});
