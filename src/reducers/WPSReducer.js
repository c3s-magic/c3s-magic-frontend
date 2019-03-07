import { START_WPS_EXECUTE_START, START_WPS_EXECUTE_END, START_WPS_EXECUTE_FAILED, WPS_STATUS_UPDATE, WPS_COMPLETED, WPS_REMOVERESULT, WPS_TOGGLERESULT } from '../constants/WPSLabels';

const handleWPSExecute = (state, payload) => {
  // console.log('reducer handleWPSExecute', payload);
  let newRunningProcesses = Object.assign({}, state.runningProcesses);
  let nrOfStartedProcesses = state.nrOfStartedProcesses;
  newRunningProcesses[payload.id] = Object.assign({}, Object.assign({}, payload, { isStarted:true, hasFailed: false, isComplete:false, percentageComplete: 0, message:'' }));
  return Object.assign({}, state, {
    nrOfStartedProcesses: nrOfStartedProcesses + 1,
    runningProcesses: newRunningProcesses
  });
};

const handleWPSFailed = (state, payload) => {
  // console.log('reducer handleWPSFailed', payload);
  return Object.assign({}, state);
};

const handleWPSEnd = (state, payload) => {
  // console.log('reducer handleWPSEnd', payload);
  return Object.assign({}, state);
};

const handleWPSStatusUpdate = (state, payload) => {
  let newRunningProcesses = Object.assign({}, state.runningProcesses);
  newRunningProcesses[payload.id] = Object.assign({}, newRunningProcesses[payload.id], { ...payload });
  return Object.assign({}, state, { runningProcesses: newRunningProcesses });
};

const handleWPSComplete = (state, payload) => {
  let { json, processSucceeded } = payload;
  let newRunningProcesses = Object.assign({}, state.runningProcesses);
  newRunningProcesses[payload.id].isComplete = true;
  newRunningProcesses[payload.id].hasFailed = !processSucceeded;
  newRunningProcesses[payload.id].result = json;
  return Object.assign({}, state, {
    runningProcesses: newRunningProcesses,
    nrOfCompletedProcesses: state.nrOfCompletedProcesses + 1,
    nrOfFailedProcesses: state.nrOfFailedProcesses + (processSucceeded ? 0 : 1)
  });
};

const removeWPSResult = (state, payload) => {
  let newRunningProcesses = Object.assign({}, state.runningProcesses);
  delete newRunningProcesses[payload.id];
  return Object.assign({}, state, {
    runningProcesses: newRunningProcesses
  });
};

const toggleWPSResult = (state, payload) => {
  let newRunningProcesses = Object.assign({}, state.runningProcesses);
  newRunningProcesses[payload.id].collapsed = !newRunningProcesses[payload.id].collapsed;
  console.log(newRunningProcesses[payload.id].collapsed);
  return Object.assign({}, state, {
    runningProcesses: newRunningProcesses
  });
};

const ACTION_HANDLERS = {
  [START_WPS_EXECUTE_START] : (state, action) => handleWPSExecute(state, action.payload),
  [START_WPS_EXECUTE_FAILED] : (state, action) => handleWPSFailed(state, action.payload),
  [START_WPS_EXECUTE_END] : (state, action) => handleWPSEnd(state, action.payload),
  [WPS_STATUS_UPDATE] : (state, action) => handleWPSStatusUpdate(state, action.payload),
  [WPS_COMPLETED] : (state, action) => handleWPSComplete(state, action.payload),
  [WPS_REMOVERESULT] : (state, action) => removeWPSResult(state, action.payload),
  [WPS_TOGGLERESULT] : (state, action) => toggleWPSResult(state, action.payload)
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  nrOfStartedProcesses: 0,
  nrOfFailedProcesses: 0,
  nrOfCompletedProcesses: 0,
  runningProcesses: {},
  selectedCSVFileForWrangling: null
};

export default function WPSReducer (state = initialState, action) {
  if (!action) {
    return state;
  }
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
