module.exports =  createGameOptionsObject = (initialOptions) => {
  const optionsObject = Object.assign({type: 'gameOptions'}, initialOptions);
  optionsObject.addPercentObstacles = (percentObstacles) => {
    if( isNaN(parseFloat(percentObstacles))) {
      throw `value ${percentObstacles} is not a number`;
    } else if( 0 > percentObstacles || percentObstacles > 1) {
      throw `value '${percentObstacles} out of range`;
    }
    return Object.assign(optionsObject, {percentObstacles: percentObstacles})
  };
  optionsObject.addPercentAssets = (percentAssets) => {
    if( isNaN(parseFloat(percentAssets))) {
      throw `value ${percentAssets} is not a number`;
    } else if( 0 > percentAssets || percentAssets > 1) {
      throw `value '${percentAssets} out of range`;
    }
    return Object.assign(optionsObject, {percentAssets: percentAssets})
  };
  return optionsObject;
}
