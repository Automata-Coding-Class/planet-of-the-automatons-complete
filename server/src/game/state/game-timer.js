const logger = require('../../logger');

module.exports = function createGameTimer(duration) {

  const timePrecision = 2;
  let internalTimer = undefined;
  let timeoutPromise = undefined;
  let startTime = undefined;

  function start() {
    timeoutPromise = new Promise((resolve, reject) => {
      startTime = new Date();
      internalTimer = setTimeout(() => {
        logger.info(`gameTimer timed out`);
        resolve();
      }, duration * 1000);
    });
    return timeoutPromise;
  }

  function getElapsedTime() {
    const millisecondLog = Math.log10(1000);
    return Math.round(
      (startTime !== undefined ? (new Date()).getTime() - startTime.getTime() : 0)
      / Math.pow(10, Math.max(millisecondLog - timePrecision, 1)))
      / Math.pow(10, timePrecision);
    // return (startTime !== undefined ? (new Date()).getTime() - startTime.getTime() : 0);
  }

  return {
    duration: duration,
    start: start,
    getElapsedTime: getElapsedTime
  };
};

