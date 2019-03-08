import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Row, Col, Progress, Card } from 'reactstrap';
import MarkdownFromFile from '../containers/MarkdownFromFile';
import ImagePreview from './ImagePreview';

// var { SchemaForm } = require('react-schema-form');

// import { SchemaForm } from 'react-schema-form';

import Form from 'react-jsonschema-form';

var $RefParser = require('json-schema-ref-parser');

class RenderProcesses extends Component {
  renderProcess (process) {
    // console.log(process);
    let value = '-';
    let shown = '-';
    try {
      value = 'data:image/png;base64,' + process.result.ExecuteResponse.ProcessOutputs.Output.Data.ComplexData.value;
      shown = 'click for output'
    } catch (e) {
    }
    return (
      <Card>
        <Row>
          <Col> <div className='text-center'>{process.percentageComplete} </div><Progress value={process.percentageComplete} /></Col>
          <Col>{process.message}</Col>
          <Col style={{ backgroundColor: '#d9edf7', cursor: 'pointer', color: '#31708f' }} onClick={() => { this.props.resultClickCallback(value); }}>{shown}</Col>
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

export default class ESMValToolPerfmetrics extends Component {
  constructor () {
    super();
    this.wrangleClicked = this.wrangleClicked.bind(this);
    this.toggle = this.toggle.bind(this);
    this.dropDownSelectItem = this.dropDownSelectItem.bind(this);
    this.resultClickCallback = this.resultClickCallback.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.formChanged = this.formChanged.bind(this);
    this.fetchInfo = this.fetchInfo.bind(this);
    this.formError = this.formError.bind(this);
    this.state = {
      form_schema: {},
      namelist_ok:false,
      dropdownOpen: false,
      dropDownValue: 'add',
      inputa: 10,
      inputb: 20,
      inputs: {
        'model1': {
          'default': 'bcc-csm1-1',
          'identifier': 'model1',
          'values': null,
          'title': 'First Model'
        },
        'model2': {
          'default': 'GFDL-ESM2G',
          'identifier': 'model2',
          'values': null,
          'title': 'Second Model'
        },
        'model3': {
          'default': 'MPI-ESM-LR',
          'identifier': 'model3',
          'values': null,
          'title': 'Third Model'
        },
        'model4': {
          'default': 'MPI-ESM-MR',
          'identifier': 'model4',
          'values': null,
          'title': 'Fourth Model'
        },
        'variable': {
          'default': 'ta',
          'identifier': 'variable',
          'values': null,
          'title': 'Variable'
        },
        'mip': {
          'default': 'Amon',
          'identifier': 'mip',
          'values': null,
          'title': 'MIP'
        },
        'experiment': {
          'default': 'historical',
          'identifier': 'experiment',
          'values': null,
          'title': 'Experiment'
        },
        'ensemble_member': {
          'default': 'r1i1p1',
          'identifier': 'ensemble_member',
          'values': null,
          'title': 'Ensemble Member'
        },
        'start_year': {
          'default': '2001',
          'identifier': 'start_year',
          'values': null,
          'title': 'Start Year'
        },
        'end_year': {
          'default': '2002',
          'identifier': 'end_year',
          'values': null,
          'title': 'End Year'
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
    dispatch(actions.startWPSExecute(backend, 'esmvaltool-perfmetrics',
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
      this.props.dispatch(this.props.actions.showWindow(
        {
          component:(<ImagePreview imagedata={value} />),
          title:'Preview',
          dispatch: this.props.dispatch,
          width:530,
          height: 460
        })
      );
    }
  }

  formSubmit (formData) {
    console.log('Data submitted: ', formData);
  }

  formChanged (info) {
    console.log('Form changed: ', info);
  }

  formError (info) {
    console.error('Form error: ', info);
  }

  componentWillMount () {
    $RefParser.dereference('form_data.json')
      .then(schema => this.setState({ form_schema: schema, namelist_ok: true }));
  }

  componentDidMount () {
    $RefParser.dereference('namelist_anomaly_agreement.yml')
      .then(function (namelist) {
        namelist.models.forEach(function (model) {
          console.log(model.model);
          console.log(model.exp);
          console.log(model.mip);
          console.log(model.project);
          console.log(model.end_year);
          console.log(model.start_year);
          console.log(model.ensemble);
        })
      });
  }

  fetchInfo () {
    console.log('Fetching the form info');
  }

  render () {
    const { backend, runningProcesses } = this.props;
    const { form_schema } = this.state;

    return (
      <div style={{ backgroundColor:'#FFF', width: '100%' }} >
        <div className='text'>
          <MarkdownFromFile url={'/contents/MeanState.md'} />
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
          <Form schema={form_schema} onSubmit={this.formSubmit} onChange={this.formChanged} onError={this.formError} />
          <Row>
            <Col xs='2' style={{ margin:'10px' }} ><Button color='primary' id='wrangleButton' onClick={() => { this.wrangleClicked(); }}>Compute</Button></Col>
          </Row>
          <RenderProcesses runningProcesses={runningProcesses} resultClickCallback={this.resultClickCallback} />
        </div>
          : <div>You need to sign in to use this functionality</div> }
      </div>);
  }
}

ESMValToolPerfmetrics.propTypes = {
  backend: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  nrOfStartedProcesses: PropTypes.number,
  nrOfFailedProcesses: PropTypes.number,
  nrOfCompletedProcesses: PropTypes.number,
  runningProcesses: PropTypes.object.isRequired
};
