module.exports = () => {
  const errorCondition = {name: 'error', permissibleNextStates: []};
  const starting = {name: 'starting'};
  const stopped = {name: 'stopped'};
  const running = {name: 'running'};
  const processingFrame = {name: 'processingFrame'};
  const awaitingFrameResponse = {name: 'awaitingFrameResponse',};
  starting.permissibleNextStates = [running, processingFrame, errorCondition];
  stopped.permissibleNextStates = [starting, running, errorCondition];
  running.permissibleNextStates = [stopped, errorCondition];
  processingFrame.permissibleNextStates = [running, awaitingFrameResponse, errorCondition];

  return {
    errorCondition: errorCondition,
    starting: starting,
    stopped: stopped,
    running: running,
    processingFrame: processingFrame,
    awaitingFrameResponse: awaitingFrameResponse
  };
};
