import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Row, Col, Progress, Card, ControlLabel } from 'reactstrap';
import MarkdownFromFile from '../containers/MarkdownFromFile';
import ADAGUCViewerComponent from './ADAGUCViewerComponent';

class RenderProcesses extends Component {
  renderProcess (process) {
    // console.log(process);
    let value = '-';
    try {
      value = process.result.ExecuteResponse.ProcessOutputs.Output.Data.LiteralData.value;
    } catch (e) {
    }
    return (
      <Card>
        <Row>
          <Col> <div className='text-center'>{process.percentageComplete} </div><Progress value={process.percentageComplete} /></Col>
          <Col>{process.message}</Col>
          <Col style={{ backgroundColor: '#d9edf7', cursor: 'pointer', color: '#31708f' }} onClick={() => { this.props.resultClickCallback(value); }}>{value}</Col>
        </Row>
      </Card>
    );
  }

  iterProcesses (runningProcesses) {
    let result = [];
    for (var process in runningProcesses) {
      result.push(Object.assign({}, this.renderProcess(runningProcesses[process]), { key: process }));
    };
    return result;
  }
  render () {
    const { runningProcesses } = this.props;
    return (<span>{this.iterProcesses(runningProcesses)}</span>);
  }
};

RenderProcesses.propTypes = {
  runningProcesses: PropTypes.object.isRequired,
  resultClickCallback: PropTypes.func.isRequired
};

export default class KNMIClimpExpCorrelate extends Component {
  constructor () {
    super();
    this.wrangleClicked = this.wrangleClicked.bind(this);
    this.toggle = this.toggle.bind(this);
    this.dropDownSelectItem = this.dropDownSelectItem.bind(this);
    this.resultClickCallback = this.resultClickCallback.bind(this);
    this.state = {
      dropdownOpen: false,
      dropDownValue: 'add',
      inputa: 10,
      inputb: 20,
      inputs: {
        'netcdf_source1': {
          'default': '/data/climexp/cru_ts3.22.1901.2013.pre.dat.nc',
          'abstract': 'application/netcdf',
          'identifier': 'netcdf_source1',
          'values': null,
          'title': 'NetCDF field data'
        },
        'netcdf_source2': {
          'default': '/data/climexp/nino3.nc',
          'abstract': 'application/netcdf',
          'identifier': 'netcdf_source2',
          'values': null,
          'title': 'NetCDF timeseries data'
        },
        'ratio': {
          'default': '1:12',
          'identifier': 'ratio',
          'values': null,
          'title': 'Ratio'
        },
        'netcdf_target': {
          'default': 'out.nc',
          'identifier': 'netcdf_target',
          'values': null,
          'title': 'Output netCDF filename'
        },
        'average': {
          'default': 'ave',
          'identifier': 'average',
          'values': null,
          'title': 'Average'
        },
        'tags': {
          'default': 'c3s-422-Lot2',
          'identifier': 'tags',
          'values': null,
          'title': 'User defined tags'
        },
        'frequency': {
          'default': 'mon',
          'identifier': 'frequency',
          'values': null,
          'title': 'Frequency'
        },
        'var': {
          'default': '3',
          'identifier': 'var',
          'values': null,
          'title': 'Lag'
        }
      }
    };
  }

  toggle (e) {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  dropDownSelectItem (value) {
    this.setState({
      dropDownValue: value
    });
  };

  wrangleClicked (id) {
    const { dispatch, actions, nrOfStartedProcesses, backend } = this.props;

    let dataInputs = '';
    Object.keys(this.state.inputs).map(
      (key, value2) => {
        if (dataInputs.length > 0) {
          dataInputs += ';';
        }
        dataInputs += this.state.inputs[key].identifier + '=' + this.state.inputs[key].default;
      }
    );
    console.log(backend, dataInputs);
    dispatch(actions.startWPSExecute(backend, 'climexp',
      dataInputs,
      nrOfStartedProcesses));
  };

  handleChange (name, value) {
    console.log(name, value);
    this.setState({
      [name]: value
    });
  };

  handleWPSInputChange (name, value) {
    console.log(name, value);
    let inputs = Object.assign({}, this.state.inputs);
    inputs[name]['default'] = value;
    this.setState({
      inputs:inputs
    });
  };

  resultClickCallback (value) {
    console.log(value);
    if (value) {
      if (value.startsWith('http') && value.indexOf('opendap') !== -1 && value.indexOf('.nc')) {
        console.log(value);
        this.props.dispatch(this.props.actions.showWindow(
          {
            component:(<ADAGUCViewerComponent dapurl={value} />),
            title:'Preview',
            dispatch: this.props.dispatch,
            width:530,
            height: 460
          })
        );
      }
    }
  }

  render () {
    const { backend, runningProcesses } = this.props;
    return (
      <div style={{ backgroundColor:'#FFF', width: '100%' }} >
        <div className='text'>
          <MarkdownFromFile url={'/contents/Correlations.md'} />
        </div>
        { backend ? <div>
          <span>Your compute node = {backend}</span>
          <div className='WPSCalculatorForm'>
            { Object.keys(this.state.inputs).map(
              (key, value2) => {
                let value = this.state.inputs[key];
                // console.log(value);
                // console.log(value.identifier);
                if (!value.identifier || !value.title) {
                  return (<span key={key}>bla</span>);
                }
                return (
                  <Row key={key}>
                    <Col>
                      {value.title}
                    </Col>
                    <Col>
                      <Input onChange={(event) => { this.handleWPSInputChange(value.identifier, event.target.value); }} value={value.default} />
                    </Col>
                  </Row>
                );
              })
            }
          </div>
          <Row>
            <Col xs='2' style={{ margin:'10px' }} ><Button color='primary' id='wrangleButton' onClick={() => { this.wrangleClicked(); }}>Correlate</Button></Col>
          </Row>
          <RenderProcesses runningProcesses={runningProcesses} resultClickCallback={this.resultClickCallback} />
        </div>
          : <div>You need to sign in to use this functionality</div> }
      </div>);
  }
}

KNMIClimpExpCorrelate.propTypes = {
  backend: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  nrOfStartedProcesses: PropTypes.number,
  nrOfFailedProcesses: PropTypes.number,
  nrOfCompletedProcesses: PropTypes.number,
  runningProcesses: PropTypes.object.isRequired
};
