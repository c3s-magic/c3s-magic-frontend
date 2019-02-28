import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import PropTypes from 'prop-types';
import ESMValToolPerfmetrics from '../../components/NewESMValToolPerfmetrics';

export default class MeanState extends Component {
  render () {
    let { dispatch, actions, backend, nrOfStartedProcesses, nrOfFailedProcesses, nrOfCompletedProcesses, runningProcesses } = this.props;
    return (
      <div className='MainViewport'>
        <Row className='MainRow'>
          <ESMValToolPerfmetrics
            dispatch={dispatch}
            actions={actions}
            backend={backend}
            nrOfStartedProcesses={nrOfStartedProcesses}
            nrOfFailedProcesses={nrOfFailedProcesses}
            nrOfCompletedProcesses={nrOfCompletedProcesses}
            runningProcesses={runningProcesses}
          />
        </Row>
      </div>);
  }
}

MeanState.propTypes = {
  backend: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  nrOfStartedProcesses: PropTypes.number,
  nrOfFailedProcesses: PropTypes.number,
  nrOfCompletedProcesses: PropTypes.number,
  runningProcesses: PropTypes.object.isRequired
};
