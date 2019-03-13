const createPlayer = rawPlayerData => {

  const assets = {};

  const getScore = () => {
    let score = 0
    if(assets.scoring !== undefined) {
      score = assets.scoring.reduce((totalScore, scoringAsset) => {
        totalScore += scoringAsset.value;
        return totalScore;
      }, 0)
    }
    return score;
  };

  const getAsset = (category, id, removeAfterRetrieve) => {
    let asset = undefined;
    const assetList = assets[category];
    if(assetList !== undefined) {
      for (let i = 0; i < assetList.length; i++) {
        if(assetList[i].id === id) {
          asset = assetList[i];
          assetList.splice(i,1);
          break;
        }
      }
    }
    return asset;
  };

  const getAssetByType = (category, type, removeAfterRetrieve) => {
    let asset = undefined;
    const assetList = assets[category];
    if(assetList !== undefined) {
      for (let i = 0; i < assetList.length; i++) {
        if(assetList[i].type === type) {
          asset = assetList[i];
          assetList.splice(i,1);
          break;
        }
      }
    }
    return asset;
  };

  return {
    getScore : getScore,
    assets: assets,
    rawData: rawPlayerData,
    addAsset: (originalIndex, asset) => {
      if(assets[asset.category] === undefined) {
        assets[asset.category] = [];
      }
      assets[asset.category].push(Object.assign(asset, {originalIndex: originalIndex}));
    },
    getAssetByType: getAssetByType
  };
};

module.exports = createPlayer;
