module.exports = () => {
  const errorCondition = {name: 'error', permissibleNextStates: []};
  const starting = {name: 'starting'};
  const stopped = {name: 'stopped'};
  const running = {name: 'running'};
  const processingFrame = {name: 'processingFrame'};
  const awaitingFrameResponse = {name: 'awaitingFrameResponse'};
  starting.permissibleNextStates = [running, awaitingFrameResponse, processingFrame, errorCondition];
  stopped.permissibleNextStates = [starting, running, errorCondition];
  running.permissibleNextStates = [awaitingFrameResponse, stopped, errorCondition];
  processingFrame.permissibleNextStates = [running, awaitingFrameResponse, errorCondition];
  awaitingFrameResponse.permissibleNextStates = [processingFrame, stopped, errorCondition];

  return {
    errorCondition: errorCondition,
    starting: starting,
    stopped: stopped,
    running: running,
    processingFrame: processingFrame,
    awaitingFrameResponse: awaitingFrameResponse
  };
};
