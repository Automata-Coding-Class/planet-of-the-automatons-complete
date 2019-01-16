const createGameOptionsObject = require('./game-options');

describe('GameOptions', () => {
  describe('create new object', () => {
    const gameOptions = createGameOptionsObject();
    test('return non-null object', () => {
      expect(gameOptions).not.toBeNull();
    });
    test('return object with correct type flag', () => {
      expect(gameOptions.type).toBe('gameOptions');
    })
  });
  describe('add options', () => {
    test('add percent obstacles', () => {
      const gameOptions = createGameOptionsObject()
        .addPercentObstacles(0.5);
      expect(gameOptions.percentObstacles).toBe(0.5);
    });
    test('percentObstacles out of range', () => {
      const gameOptions = createGameOptionsObject();
      expect(() => {
        gameOptions.addPercentObstacles(-0.1);
      }).toThrowError();
      expect(() => {
        gameOptions.addPercentObstacles(4);
      }).toThrowError();
      expect(() => {
        gameOptions.addPercentObstacles('is it?');
      }).toThrowError();
    });
    test('add percent assets', () => {
      const gameOptions = createGameOptionsObject()
        .addPercentAssets(0.5);
      expect(gameOptions.percentAssets).toBe(0.5);
    });
    test('percentAssets out of range', () => {
      const gameOptions = createGameOptionsObject();
      expect(() => {
        gameOptions.addPercentAssets(-0.1);
      }).toThrowError();
      expect(() => {
        gameOptions.addPercentAssets(4);
      }).toThrowError();
      expect(() => {
        gameOptions.addPercentAssets('is it?');
      }).toThrowError();
    })
  })
})
