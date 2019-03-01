// This is where action creators are put
import { doWPSExecuteCall } from '../utils/WPSRunner.js';
import { START_WPS_EXECUTE_START, START_WPS_EXECUTE_FAILED, START_WPS_EXECUTE_END, WPS_STATUS_UPDATE, WPS_COMPLETED, WPS_REMOVERESULT, WPS_TOGGLERESULT } from '../constants/WPSLabels';

const startWPSExecute = (wpsdomain, identifier, dataInputs, nrOfStartedProcesses) => {
  return (dispatch) => {
    dispatch({
      type: START_WPS_EXECUTE_START,
      payload: {
        id: nrOfStartedProcesses,
        identifier: identifier,
        dataInputs: dataInputs
      }
    });
    try {
      let wps = wpsdomain + 'service=wps&request=Execute&identifier=' + identifier + '&version=1.0.0&' +
      'DataInputs=' + dataInputs + '&storeExecuteResponse=true&status=true&';
      let statusUpdateCallback = (message, percentageComplete) => {
        dispatch({ type: WPS_STATUS_UPDATE, payload: { message: message, percentageComplete: percentageComplete, id: nrOfStartedProcesses } });
      };
      let executeCompletCallback = (json, processSucceeded) => {
        dispatch({ type: WPS_COMPLETED, payload: { json: json, processSucceeded: processSucceeded, id: nrOfStartedProcesses } });
      };
      doWPSExecuteCall(wps, statusUpdateCallback, executeCompletCallback);
    } catch (e) {
      return dispatch({ type: START_WPS_EXECUTE_FAILED, payload: { error: e, id: nrOfStartedProcesses } });
    }
    dispatch({ type: START_WPS_EXECUTE_END });
  };
};

const removeWPSResult = (payload) => {
  return {
    type: WPS_REMOVERESULT,
    payload: {
      id: payload
    }
  };
};

const toggleWPSResult = (payload) => {
  return {
    type: WPS_TOGGLERESULT,
    payload: {
      id: payload
    }
  };
};

const actions = {
  startWPSExecute,
  removeWPSResult,
  toggleWPSResult
};

export default actions;
