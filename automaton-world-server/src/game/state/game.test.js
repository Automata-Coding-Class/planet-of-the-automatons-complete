const {createNewGame, positionDataFilters} = require('./game');
const createGameOptions = require('./game-options');

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

describe('Game Object', () => {
  const players = [
    {loginType: 'player', userId: 'ABC', username: 'boris'},
    {loginType: 'player', userId: 'DEF', username: 'fnord'},
    {loginType: 'player', userId: 'GHI', username: 'quux'}
  ];

  describe('initialization', () => {
    test('created board has correct number of cells', () => {
      const gameBoard = createNewGame(rows, columns);
      expect(gameBoard.getNumberOfCells()).toBe(20);
    })
  });

  describe('smarter distribution', () => {
    test('board has correct number of obstacle cells', () => {
      let rows = 6; let columns = 6;
      const obstaclePercentage = .2;
      const gameBoard = createNewGame(rows, columns, createGameOptions().addPercentObstacles(obstaclePercentage));
      gameBoard.printGameBoardASCII();
      expect((gameBoard.getBoardPositions(positionDataFilters.obstaclesOnly).length)).toBe(Math.floor(rows * columns * obstaclePercentage));
    })
  });

  describe('initialize with options', () => {
    test('new board with options has correct number of obstacles', () => {
      const options = createGameOptions()
        .addPercentObstacles(0.2)
        .addPercentAssets(0.1);
      const game = createNewGame(rows, columns, options);
      expect(game.getBoardPositions(positionDataFilters.obstaclesOnly).length).toBe(4);
    })
    test('new board with options has correct number of assets', () => {
      const options = createGameOptions()
        .addPercentObstacles(0.2)
        .addPercentAssets(0.1);
      const game = createNewGame(rows, columns, options);
      expect(game.getBoardPositions(positionDataFilters.assetsOnly).length).toBe(2);
    })
  });

  describe('add players', () => {
    const gameBoard = createNewGame(rows, columns);
    const playerIds = players.map(player => player.id);
    const numberOfObstacles = 6, numberOfAssets = playerIds.length * 2;
    test('board has correct number of obstacles and assets', () => {
      gameBoard.setUp(numberOfObstacles, numberOfAssets);
      const currentState = gameBoard.getCurrentState();
      expect(currentState.filter(elem => elem !== undefined && elem.type === 'obstacle').length)
        .toBe(numberOfObstacles);
      expect(currentState.filter(elem => elem !== undefined && elem.type === 'asset').length)
        .toBe(numberOfAssets);
    });
    test('board has correct number of players', () => {
      gameBoard.distributePlayers(players);
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
    const gameBoard = createNewGame(rows, columns);
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

    test('frameResponse with successful moves to empty cells', () => {
      expect.assertions(5);
      const gameBoard = createNewGame(4, 4);
      gameBoard.loadState(savedState);
      const expectedState = generateState('eoee_peeo_oaep_etae');
      const frameResponses = [
        {id: 'player_0', action: {type: 'move', direction: 'left'}},
        {id: 'player_1', action: {type: 'move', direction: 'up'}},
      ];
      // const expectedResultState =
      return gameBoard.processFrameResponses(frameResponses)
        .then(processedResponse => {
          expect(processedResponse.updatedState).not.toBeNull();
          expect(processedResponse.updatedState).toMatchObject(expectedState);
          expect(processedResponse.changeSummary.length).toBe(2);
          expect(processedResponse.changeSummary[0])
            .toMatchObject({change: 'move', type: 'player', playerId: 'player_0', from: 5, to: 4});
          expect(processedResponse.changeSummary[1])
            .toMatchObject({change: 'move', type: 'player', playerId: 'player_1', from: 15, to: 11});
        });
    });

    test('frameResponse with unsuccessful move to blocked cells and edges', () => {
      expect.assertions(2);
      const gameBoard = createNewGame(4, 4);
      gameBoard.loadState(savedState);
      const frameResponses = [
        {id: 'player_0', action: {type: 'move', direction: 'up'}},
        {id: 'player_1', action: {type: 'move', direction: 'right'}},
      ];
      // const expectedResultState =
      return gameBoard.processFrameResponses(frameResponses)
        .then(processedResponse => {
          // board should be unchanged
          expect(processedResponse.updatedState).toMatchObject(savedState);
          expect(processedResponse.changeSummary).toMatchObject([])
        })
        .catch(e => {
          // console.log(`e:`, e);
          expect(e.Received).not.toBeNull();
        });
    });

    test('frameResponse with move to / collection of asset', () => {
      // expect.assertions(2);
      const gameBoard = createNewGame(4, 4);
      gameBoard.loadState(savedState);
      const expectedState = generateState('eoee_eeeo_opee_etpe');
      const frameResponses = [
        {id: 'player_0', action: {type: 'move', direction: 'down'}},
        {id: 'player_1', action: {type: 'move', direction: 'left'}},
      ];
      // const expectedResultState =
      return gameBoard.processFrameResponses(frameResponses)
        .then(processedResponse => {
          // board should be unchanged
          expect(processedResponse.updatedState).toMatchObject(expectedState);
          expect(processedResponse.changeSummary).toHaveLength(4);
          expect(processedResponse.changeSummary).toContainEqual({change: 'move', type: 'player', playerId: 'player_0', from: 5, to: 9});
          expect(processedResponse.changeSummary).toContainEqual({change: 'move', type: 'player', playerId: 'player_1', from: 15, to: 14});
          expect(processedResponse.changeSummary).toContainEqual({
            change: 'acquisition',
            playerId: 'player_0',
            acquired: {type: 'asset', id: 'asset_0'}});
          expect(processedResponse.changeSummary).toContainEqual({change: 'acquisition', playerId: 'player_1', acquired: expect.anything()});

        });
        // .catch(e => {
        //   // console.log(`e:`, e);
        //   expect(e.Received).toBeDefined();
        // });
    })
  })
});
