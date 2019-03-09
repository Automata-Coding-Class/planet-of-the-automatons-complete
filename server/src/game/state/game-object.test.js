const GameObject = require('./game-object');

  describe('random selection methods', () => {
    test('getRandomCategoryKey', () => {
      const keys = GameObject.getCategoryKeys();
      const result = GameObject.getRandomCategoryKey();
      expect(keys.indexOf(result)).not.toEqual(-1);
    });
    test('getRandomObjectKeyForCategory', () => {
      const result = GameObject.getRandomObjectKeyForCategory('powerUp');
      expect(['addTime', 'blaster', 'bomb', 'diagonality', 'magnet'].indexOf(result)).not.toEqual(-1);
    })
  });

  describe('list methods', () => {
      test('categoryKeys', () => {
        const result = GameObject.getCategoryKeys() ;
        expect(result).toEqual(expect.arrayContaining(['scoring', 'powerUp', 'hazard']));
      });
    test('keysByCategory', () => {
      const result = GameObject.getObjectKeysByCategory('powerUp') ;
      expect(result).toEqual(['addTime', 'blaster', 'bomb', 'diagonality', 'magnet']);
    })
  });

  describe('object creation methods', () => {
    test('createGameObject', () => {
      const newObj = GameObject.createGameObject('powerUp', 'bomb', {id: 'powerUp_1'});
      expect(newObj).toEqual({
        id: 'powerUp_1',
        category: 'powerUp',
        type: 'bomb',
        activation: 'user'
      });
    });
    test('createGameObjectList', () => {
      const totalItems = 50;
      const gameObjectList = GameObject.createGameObjectList(totalItems);
      expect(Array.isArray(gameObjectList)).toBe(true);
      expect(gameObjectList.length).toEqual(totalItems);
      const powerUps = gameObjectList.filter(gameObj => gameObj.category === 'powerUp');
      const powerUpTypes = GameObject.getObjectKeysByCategory('powerUp');
      expect(powerUps.length).toEqual(15);
      expect(powerUpTypes.indexOf(powerUps[0].type)).not.toEqual(-1);
      const idPattern = /^\w+_\d+$/i;
      expect(powerUps[0].id).toEqual(expect.stringMatching(idPattern));
    })
  });
