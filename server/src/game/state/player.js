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

  return {
    getScore : getScore,
    assets: assets,
    rawData: rawPlayerData,
    addAsset: (originalIndex, asset) => {
      if(assets[asset.category] === undefined) {
        assets[asset.category] = [];
      }
      assets[asset.category].push(Object.assign(asset, {originalIndex: originalIndex}));
    }
  };
};

module.exports = createPlayer;
