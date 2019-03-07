import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RenderProcessOutputs from './RenderProcessOutputs';
export default class RenderProcesses extends Component {
  constructor () {
    super();
    this.iterProcesses = this.iterProcesses.bind(this);
  }
  toArray (array) {
    if (!array) return [];
    if (array.length) {
      return array;
    } else {
      var newArray = [];
      newArray[0] = array;
      return newArray;
    }
  };

  iterProcesses (runningProcesses, actions, dispatch) {
    let result = [];
    Object.keys(runningProcesses).reverse().map((processid) => {
      result.push(Object.assign({}, <RenderProcessOutputs process={runningProcesses[processid]} key={processid} actions={actions} dispatch={dispatch} />));
    });
    return result;
  }
  render () {
    const { runningProcesses, actions, dispatch } = this.props;
    return (<span>{this.iterProcesses(runningProcesses, actions, dispatch)}</span>);
  }
};

RenderProcesses.propTypes = {
  runningProcesses: PropTypes.object.isRequired,
  // resultClickCallback: PropTypes.func.isRequired,
  actions: PropTypes.object,
  dispatch: PropTypes.func.isRequired
};
