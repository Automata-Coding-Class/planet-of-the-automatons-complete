const logger = require('./src/logger');
const cardinalPoints = ['up', 'right', 'down', 'left'];

const processFrame = function(frame) {
  logger.info(`will process frame: ${JSON.stringify(frame)}`);
  return { type: 'move', direction: cardinalPoints[Math.floor(Math.random() * cardinalPoints.length)]};
};

module.exports = {
  processFrame: processFrame
};
