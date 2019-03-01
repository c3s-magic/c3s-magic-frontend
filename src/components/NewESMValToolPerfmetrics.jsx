import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Row, Col, Progress, Card, ControlLabel, Alert, UncontrolledAlert } from 'reactstrap';
import { TabContent, TabPane, Nav, NavItem, NavLink, CardTitle, CardText } from 'reactstrap';

import MarkdownFromFile from '../containers/MarkdownFromFile';
import DapPreview from './DapPreview';
import ImagePreview from './ImagePreview';
import { stripNS } from '../utils/WPSRunner';

import Form from 'react-jsonschema-form';
import classnames from 'classnames';
var _ = require('lodash');
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
    this.resultClickCallback = this.resultClickCallback.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.formChanged = this.formChanged.bind(this);
    this.formError = this.formError.bind(this);
    this.loadModels = this.loadModels.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    this.state = {
      form_schema: {},
      form_data: {},
      data_loaded: false,
      running_jobs: [],
      activeTab: '1',
      dropdownOpen: false,
      dropDownValue: 'add'
    };

    $RefParser.dereference('form_data.json')
      .then(schema => this.setState({ form_schema: schema, namelist_ok: true }));

    $RefParser.dereference('namelist_anomaly_agreement.yml')
      .then(fdata => this.setState({ form_data: fdata }));
  }

  toggleTab (tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  wrangleClicked (id) {
    const { dispatch, actions, nrOfStartedProcesses, wpsDomain } = this.props;

    let dataInputs = '';
    Object.keys(this.state.inputs).map(
      (key, value2) => {
        if (dataInputs.length > 0) {
          dataInputs += ';';
        }
        dataInputs += this.state.inputs[key].identifier + '=' + this.state.inputs[key].default;
      }
    );
    console.log(wpsDomain, dataInputs);
    dispatch(actions.startWPSExecute(wpsDomain, 'esmvaltool-perfmetrics',
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
      inputs: inputs
    });
  };

  resultClickCallback (value) {
    console.log(value);
    if (value) {
      this.props.dispatch(this.props.actions.showWindow(
        {
          component: (<ImagePreview imagedata={value} />),
          title: 'Preview',
          dispatch: this.props.dispatch,
          width: 530,
          height: 460
        })
      );
    }
  }

  formSubmit (formData) {
    console.log('Data submitted: ', formData);

    const { dispatch, actions, nrOfStartedProcesses, wpsDomain } = this.props;
    let dataInputs = '';

    _.forIn(formData.formData.ModelEntry, function (value, key) {
      if (dataInputs.length > 0) {
        dataInputs += ';';
      }
      key = parseInt(key) + 1;
      dataInputs += 'model' + key + '=' + value;
      console.log(key, value);
      console.log(dataInputs);
    });

    dataInputs = dataInputs + ';variable=ta;mip=Amon;experiment=historical;ensemble_member=r1i1p1;start_year=2001;end_year=2002';
    console.log(wpsDomain, dataInputs);
    dispatch(actions.startWPSExecute(wpsDomain, 'esmvaltool-perfmetrics',
      dataInputs,
      nrOfStartedProcesses));
  }

  formChanged (info) {
    console.log('Form changed: ', info);
  }

  formError (info) {
    console.error('Form error: ', info);
  }

  componentDidMount () {
    console.log('componentDidMount::Filling the form data');
  }

  loadModels () {
    console.log('updateForm::Updating the form data');
    // const { form_schema, form_data } = this.state;

    var temp = [];
    this.state.form_data.models.forEach(function (model) {
      // console.log(model.model);
      // console.log(model.exp);
      // console.log(model.mip);
      // console.log(model.project);
      // console.log(model.end_year);
      // console.log(model.start_year);
      // console.log(model.ensemble);

      temp.push({ 'type':'string', 'enum':[model.model], 'title':model.model });
    });

    var new_state = _.cloneDeep(this.state);
    new_state.form_schema.definitions.Model.anyOf = temp;

    this.setState(_.merge(this.state.form_schema, new_state))

    // console.log(new_state);
    // console.log(this.state.form_schema);

    this.setState({ data_loaded:true });
  }

  componentWillMount () {
    console.log('  componentWillMount() ');
    // this.forceUpdate();
  }

  componentDidMount () {
    console.log('  componentDidMount() ');
    // this.forceUpdate();
  }

  render () {
    console.log('  render() ');

    const { wpsDomain, runningProcesses, nrOfStartedProcesses, actions } = this.props;
    const { form_schema, form_data, data_loaded, running_jobs } = this.state;

    if (!data_loaded) {
      return (
        <div>
          <div className='text'>
            <MarkdownFromFile url={'/contents/MeanState.md'} />
          </div>

          <Alert color='warning'>
                    Press the button to load the models.
          </Alert>
          <Row>
            <Button color='primary' id='updateButton' onClick={() => { this.loadModels(); }}>Load Models</Button>
          </Row>
        </div>
      );
    } else {
      return (

        <div style={{ backgroundColor: '#FFF', width: '100%' }}>
          <div className='text'>
            <MarkdownFromFile url={'/contents/MeanState.md'} />
          </div>

          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === '1' })}
                onClick={() => { this.toggleTab('1'); }}
              >
                Submit
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === '2' })}
                onClick={() => { this.toggleTab('2'); }}
              >
                Output
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={this.state.activeTab}>
            <TabPane tabId='1'>
              <Row>
                <Col sm='12'>
                  {wpsDomain
                    ? <div>
                      <Alert color='info'>
                        Your compute node = {wpsDomain}
                      </Alert>
                      <UncontrolledAlert color='danger' style={{ textAlign: 'initial' }}>
                        <strong>Warning:</strong> The parameters given below cannot be changed at the moment.
                        variable=ta;mip=Amon;experiment=historical;ensemble_member=r1i1p1;start_year=2001;end_year=200
                      </UncontrolledAlert>
                      <Row>
                        <Form schema={form_schema} formData={form_data} onSubmit={this.formSubmit} onChange={this.formChanged}
                          onError={this.formError} />
                      </Row>
                    </div>
                    : <div>You need to sign in to use this functionality</div>}
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId='2'>
              <Row>
                <Col sm='12'>
                  <Alert color='info'>
                    This tab will show the processes.
                  </Alert>
                  {wpsDomain
                    ? <div>
                      <RenderProcesses runningProcesses={runningProcesses} resultClickCallback={this.resultClickCallback} />
                    </div>
                    : <div>You need to sign in to use this functionality</div>}
                </Col>
              </Row>
            </TabPane>
          </TabContent>
        </div>);
    }
  }
}

ESMValToolPerfmetrics.propTypes = {
  wpsDomain: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  nrOfStartedProcesses: PropTypes.number,
  nrOfFailedProcesses: PropTypes.number,
  nrOfCompletedProcesses: PropTypes.number,
  runningProcesses: PropTypes.object.isRequired
};
