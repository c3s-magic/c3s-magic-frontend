import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Progress, Card, CardBody, CardTitle, Button, CardSubtitle } from 'reactstrap';
import RenderWPSProcessOutput from './WPS/RenderWPSProcessOutput';
import Icon from 'react-fa';

export default class RenderProcesses extends Component {
  constructor () {
    super();
    this.renderProcess = this.renderProcess.bind(this);
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

  // console.log(output);

  renderProcess (process, processid) {
    const { actions, dispatch } = this.props;
    let processOutputs = {};
    try {
      const _processOutputs = process.result.ExecuteResponse.ProcessOutputs.Output;
      if (!_processOutputs['0']) {
        processOutputs['0'] = _processOutputs;
      } else {
        processOutputs = _processOutputs;
      }
    } catch (e) {
    }
    return (
      <Card>
        <CardBody className='RenderProcesses_CardBody'>
          <Row>
            <Col xs='11'>
              <CardTitle className='RenderProcesses_ProcessTitle'>Results for process {process.identifier}:</CardTitle>
            </Col>
            <Col className='float-right'>
              {
                process.isComplete ? (<Button color='secondary' onClick={() => {
                  dispatch(actions.toggleWPSResult(process.id));
                }}><Icon name={process.collapsed ? 'chevron-down' : 'chevron-up'} /></Button>) : null
              }
            </Col>

          </Row>
          { !process.collapsed &&
            (<div>
              <Row>
                <Col xs='11'><CardSubtitle>{process.id}) {process.message}</CardSubtitle></Col>
              </Row>
              <Col> <div className='text-center'>{process.percentageComplete + ' %'} </div><Progress value={process.percentageComplete} /></Col>
              { /* <Col style={{ backgroundColor: '#d9edf7', cursor: 'pointer', color: '#31708f' }} onClick={() => { this.props.resultClickCallback(value); }}>{shown}</Col> */ }
              <Row>
                <Col>
                  {
                    Object.keys(processOutputs).map((k, i) => {
                      const processOutput = processOutputs[k];
                      return (<RenderWPSProcessOutput key={i} processOutput={processOutput} />);
                    })
                  }
                </Col>
              </Row>
            </div>)
          }
        </CardBody>
      </Card>
    );
  }

  iterProcesses (runningProcesses) {
    let result = [];
    Object.keys(runningProcesses).reverse().map((processid) => {
      result.push(Object.assign({}, this.renderProcess(runningProcesses[processid], processid), { key: processid }));
    });
    return result;
  }
  render () {
    const { runningProcesses } = this.props;
    return (<span>{this.iterProcesses(runningProcesses)}</span>);
  }
};

RenderProcesses.propTypes = {
  runningProcesses: PropTypes.object.isRequired,
  // resultClickCallback: PropTypes.func.isRequired,
  actions: PropTypes.object,
  dispatch: PropTypes.func.isRequired
};
