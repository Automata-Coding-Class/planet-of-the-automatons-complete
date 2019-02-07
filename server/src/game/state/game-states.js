module.exports = () => {
  const errorCondition = {name: 'error', permissibleNextStates: []};
  const initialized = {name: 'initialized'};
  const starting = {name: 'starting'};
  const paused = {name: 'paused'};
  const stopped = {name: 'stopped'};
  const running = {name: 'running'};
  const processingFrame = {name: 'processingFrame'};
  const awaitingFrameResponse = {name: 'awaitingFrameResponse'};
  initialized.permissibleNextStates = [awaitingFrameResponse, running, errorCondition];
  starting.permissibleNextStates = [running, awaitingFrameResponse, processingFrame, errorCondition];
  stopped.permissibleNextStates = [errorCondition];
  running.permissibleNextStates = [awaitingFrameResponse, paused, stopped, errorCondition];
  paused.permissibleNextStates = [running, awaitingFrameResponse, stopped, errorCondition];
  processingFrame.permissibleNextStates = [running, awaitingFrameResponse, errorCondition];
  awaitingFrameResponse.permissibleNextStates = [processingFrame, running, paused, stopped, errorCondition];

  return {
    errorCondition: errorCondition,
    initialized: initialized,
    starting: starting,
    paused: paused,
    stopped: stopped,
    running: running,
    processingFrame: processingFrame,
    awaitingFrameResponse: awaitingFrameResponse
  };
};
