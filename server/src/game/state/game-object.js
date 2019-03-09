const gameObjectTypes = (() => {
  const types = {
    addTime: {
      category: 'powerUp',
      activation: 'instant'
    },
    blaster: {
      category: 'powerUp',
      activation: 'user'
    },
    bomb: {
      category: 'powerUp',
      activation: 'user'
    },
    diagonality: {
      category: 'powerUp',
      activation: 'instant'
    },
    magnet: {
      category: 'powerUp',
      activation: 'user'
    },
    missedTurn: {
      category: 'hazard',
      activation: 'instant'
    },
    multiPoint: {
      category: 'scoring',
      activation: 'instant',
      value: 3
    },
    point: {
      category: 'scoring',
      activation: 'instant',
      value: 1
    },
    poison: {
      category: 'hazard',
      activation: 'instant'
    }
  };

  const categoryKeys = ['scoring', 'powerUp', 'hazard'];

  const getRandomCategoryKey = () => {
    return categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
  };

  const getRandomObjectKeyForCategory = (category) => {
    const keys = getObjectKeysByCategory(category);
    return keys[Math.floor(Math.random() * keys.length)];
  };

  const getObjectKeysByCategory = (category) => {
    return Object.entries(types).reduce((keyList, entry) => {
      if (entry[1].category === category) {
        keyList.push(entry[0]);
      }
      return keyList;
    }, []);
  };

  return {
    getObject: key => { return Object.assign({}, types[key]); },
    getCategoryKeys: () => categoryKeys,
    getRandomCategoryKey: getRandomCategoryKey,
    getRandomObjectKeyForCategory: getRandomObjectKeyForCategory,
    getObjectKeysByCategory: getObjectKeysByCategory
  }
})();

module.exports.getRandomCategoryKey = gameObjectTypes.getRandomCategoryKey;

module.exports.getRandomObjectKeyForCategory = gameObjectTypes.getRandomObjectKeyForCategory;

module.exports.gameObjectTypes = gameObjectTypes;

module.exports.createGameObject = function createGameObject(objectType, options = {}) {

};
