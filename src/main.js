import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './store/createStore';
import AppContainer from './containers/AppContainer';

// ========================================================
// Store Instantiation
// ========================================================
const initialState = {
  userState: {
    accessToken: null,
    clientId: null,
    emailAddress: null,
    backend: null,
    compute: []
  },
  WPSState: {
    nrOfStartedProcesses: 0,
    nrOfFailedProcesses: 0,
    nrOfCompletedProcesses: 0,
    runningProcesses: {},
    selectedCSVFileForWrangling: null
  },
  basketState: {
    basket: null,
    hasFetched: false
  },
  jobListState: {
    jobs: null
  }
};

const store = createStore(initialState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

// const store = createStore(initialState, __DEV__);
// ========================================================
// Render Setup
// ========================================================
const MOUNT_NODE = document.getElementById('root');

let render = () => {
  const routes = require('./routes/index').default(store);
  ReactDOM.render(
    <AppContainer store={store} routes={routes} />,
    MOUNT_NODE
  );
};

// This code is excluded from production bundle
if (module.hot) {
  // Development render functions
  const renderApp = render;
  const renderError = (error) => {
    const RedBox = require('redbox-react').default;

    ReactDOM.render(<RedBox error={error} />, MOUNT_NODE);
  };

  // Wrap render in try/catch
  render = () => {
    try {
      renderApp();
    } catch (error) {
      console.error(error);
      renderError(error);
    }
  };

  // Setup hot module replacement
  module.hot.accept('./routes/index', () =>
    setImmediate(() => {
      ReactDOM.unmountComponentAtNode(MOUNT_NODE);
      render();
    })
  );
}

// ========================================================
// Go!
// ========================================================
render();
