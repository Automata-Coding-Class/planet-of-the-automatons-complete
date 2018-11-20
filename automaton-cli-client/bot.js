const logger = require('./src/logger');
const cardinalPoints = ['up', 'right', 'down', 'left'];

function determineMove() {
  return {
    type: 'move',
    direction: cardinalPoints[Math.floor(Math.random() * cardinalPoints.length)]
  };
}

const processFrame = function(frame) {
  logger.info(`will process frame: ${JSON.stringify(frame)}`);
  return {action: determineMove()};
};

module.exports = {
  processFrame: processFrame
};
