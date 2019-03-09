const categories = {
  scoring: {
    weight: 5,
    items: {
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
    }
  },
  powerUp: {
    weight: 1,
    items: {
      addTime: {
        category: 'powerUp',
        activation: 'instant',
        action: (player, cellStates) => {
          return {
            change: 'timeAdjustment',
            playerId: player.id,
            timeAdjustment: 10
          }
        }
      },
      // blaster: {
      //   category: 'powerUp',
      //   activation: 'user'
      // },
      // bomb: {
      //   category: 'powerUp',
      //   activation: 'user'
      // },
      // diagonality: {
      //   category: 'powerUp',
      //   activation: 'instant'
      // },
      // magnet: {
      //   category: 'powerUp',
      //   activation: 'persistent'
      // },
    }
  },
  hazard: {
    weight: 2,
    items: {
      // missedTurn: {
      //   category: 'hazard',
      //   activation: 'instant'
      // },
      poison: {
        category: 'hazard',
        activation: 'instant',
        action: (player, cellStates) => {
          const startingScore = player.getScore();
          const assets = player.assets.scoring !== undefined ? player.assets.scoring : [];
          player.assets.scoring = [];
          return {
            change: 'scoreAdjustment',
            playerId: player.id,
            scoreAdjustment: -startingScore,
            assets: assets
          }
        }
      }
    }
  }
};

const getCategoryKeys = () => {
  return Object.keys(categories);
};

const getRandomCategoryKey = () => {
  const categoryKeys = getCategoryKeys();
  return categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
};

const getRandomObjectKeyForCategory = (category) => {
  const keys = getObjectKeysByCategory(category);
  return keys[Math.floor(Math.random() * keys.length)];
};

const getObjectKeysByCategory = (category) => {
  return Object.keys(categories[category].items);
};
const getObject = (category, type) => categories[category].items[type];

const createGameObject = (category, type, options = {}) => {
  return Object.assign({type: type}, options, getObject(category, type));
};

module.exports.getCategoryKeys = getCategoryKeys;
module.exports.getObjectKeysByCategory = getObjectKeysByCategory;
module.exports.getRandomCategoryKey = getRandomCategoryKey;
module.exports.getRandomObjectKeyForCategory = getRandomObjectKeyForCategory;
module.exports.createGameObject = createGameObject;
module.exports.createGameObjectList = totalItems => {
  const gameObjectList = [];
  const totalWeight = Object.entries(categories).reduce((totalWeight, category) => {
    totalWeight += category[1].weight;
    return totalWeight;
  }, 0);
  Object.entries(categories).forEach(categoryEntry => {
    const itemCount = Math.round(totalItems * categoryEntry[1].weight / totalWeight);
    for (let i = 0; i < itemCount; i++) {
      gameObjectList.push(createGameObject(categoryEntry[0], getRandomObjectKeyForCategory(categoryEntry[0]), {id: `${categoryEntry[0]}_${i}`}));
    }
  });
  return gameObjectList;
};
