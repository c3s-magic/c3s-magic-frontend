import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Progress, Card, CardBody, CardTitle, Button, CardSubtitle } from 'reactstrap';
import RenderWPSProcessOutput from './WPS/RenderWPSProcessOutput';
import Icon from 'react-fa';

export default class RenderProcessOutputs extends Component {
  render () {
    const { process, actions, dispatch } = this.props;
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

    let isSuccess;
    Object.keys(processOutputs).map((k, i) => {
      const myProcessOutput = processOutputs[k];
      if (myProcessOutput && myProcessOutput.Identifier && myProcessOutput.Identifier.value &&
          myProcessOutput.Data && myProcessOutput.Data.LiteralData && myProcessOutput.Data.LiteralData.value !== undefined && myProcessOutput.Data.LiteralData.value !== null) {
        let identifier = myProcessOutput.Identifier.value;
        let data = myProcessOutput.Data.LiteralData.value;
        isSuccess = identifier === 'success' ? data === 'True' ? true : (data === 'False' ? false : undefined) : undefined;
      }
    });
    if (process.hasFailed === true) {
      isSuccess = false;
    }
    let className = 'RenderProcesses_CardBody';
    if (isSuccess === false) className = 'RenderProcesses_CardBody_NoSuccess';
    if (isSuccess === true) className = 'RenderProcesses_CardBody_Success';
    return (
      <Card>
        <CardBody className={className}>
          <Row>
            <Col xs='10'>
              <CardTitle className='RenderProcesses_ProcessTitle'>Results for process {process.identifier}:</CardTitle>
            </Col>
            <Col xs='2'>
              <div style={{ width:'150px', float:'right', display:'flex' }}>
                { isSuccess === true ? <div title='Process succeeded' className='RenderProcessesTickMark_Success'><Icon name='check' />&nbsp;</div> : null }
                { isSuccess === false ? <div title='Process failed, check logs.' className='RenderProcessesTickMark_Error'><Icon name='exclamation' />&nbsp;</div> : null }
                {
                  (<Button color='secondary' onClick={() => {
                    dispatch(actions.toggleWPSResult(process.id));
                  }}><Icon name={process.collapsed ? 'chevron-down' : 'chevron-up'} /></Button>)
                }
                {
                  (<Button disabled={!process.isComplete} onClick={() => {
                    dispatch(actions.removeWPSResult(process.id));
                  }}><Icon name='close' /></Button>)
                }
              </div>
            </Col>
          </Row>
          { !process.collapsed &&
            (<div>
              <Row>
                <Col xs='11'><CardSubtitle>{process.id}) {process.message}</CardSubtitle></Col>
              </Row>
              <Row>
                <Col xs='11'>Status link: <a href={process.statuslocation} target='_blank'>{process.statuslocation}</a></Col>
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
}

RenderProcessOutputs.propTypes = {
  process: PropTypes.object,
  actions: PropTypes.object,
  dispatch: PropTypes.func.isRequired
};
