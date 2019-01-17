const logger = require('../../logger');

module.exports = function createGameTimer(duration) {

  const timePrecision = 2;
  let internalTimer = undefined;
  let timeoutPromise = undefined;
  let startTime = undefined;
  let accruedTime = 0;
  const totalTimeout = duration * 1000;

  function createTimeoutPromise(timeout) {
    startTime = new Date();
    return new Promise((resolve, reject) => {
      internalTimer = setTimeout(() => {
        resolve();
      }, timeout);
    });
  }

  function start() {
    timeoutPromise = createTimeoutPromise(totalTimeout);
    return timeoutPromise;
  }

  function pause() {
    clearTimeout(internalTimer);
    accruedTime = getElapsedMilliseconds();
    startTime = undefined;
  }

  function resume() {
    timeoutPromise = createTimeoutPromise(totalTimeout - accruedTime);
    return timeoutPromise;
  }

  function getElapsedMilliseconds() {
    return accruedTime + (startTime !== undefined ? (new Date()).getTime() - startTime.getTime() : 0);
  }

  function getElapsedTime() {
    const millisecondLog = Math.log10(1000);
    return Math.round(
      getElapsedMilliseconds()
      / Math.pow(10, Math.max(millisecondLog - timePrecision, 1)))
      / Math.pow(10, timePrecision);
    // return (startTime !== undefined ? (new Date()).getTime() - startTime.getTime() : 0);
  }

  return {
    duration: duration,
    start: start,
    pause: pause,
    resume: resume,
    getElapsedTime: getElapsedTime
  };
};

