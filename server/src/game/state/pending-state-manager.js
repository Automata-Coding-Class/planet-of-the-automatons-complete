module.exports = function createPendingStateManager(nextAction, failureAction = () => {}, timeoutInterval = 1000) {
  let resolverFunction = undefined,
    rejectionFunction = undefined,
    timeout = undefined;

  function makePromiseHandler(resolvePromise, rejectPromise) {
    resolverFunction = resolvePromise;
    rejectionFunction = rejectPromise;
    timeout = setTimeout(() => {
      const message = 'promise handler has timed out';
      reject(message);
    }, timeoutInterval);
  }

  function resolve() {
    if (nextAction !== undefined) nextAction();
    if(timeout !== undefined) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    if (resolverFunction !== undefined) {
      resolverFunction();
      resolverFunction = undefined;
    }
  }

  function reject(message) {
    failureAction();
    if(rejectionFunction !== undefined) rejectionFunction({type: 'error', message: message});
  }

  return {
    makePromiseHandler: makePromiseHandler,
    resolve: resolve,
    reject: reject
  }
};
