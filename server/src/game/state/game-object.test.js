const GameObject = require('./game-object');

describe('game-object', () => {
  describe('getObjectKeysByCategory', () => {
      test('categoryKeys', () => {
        const result = GameObject.gameObjectTypes.getCategoryKeys() ;
        expect(result).toEqual(['scoring', 'powerUp', 'hazard']);
      });
    });

  describe('getObjectKeysByCategory', () => {
    test('instantiation', () => {
      expect(typeof GameObject.gameObjectTypes).toEqual('object');
    });
    test('keysByCategory', () => {
      const result = GameObject.gameObjectTypes.getObjectKeysByCategory('powerUp') ;
      expect(result).toEqual(['addTime', 'blaster', 'bomb', 'diagonality', 'magnet']);
    })
  })
});
