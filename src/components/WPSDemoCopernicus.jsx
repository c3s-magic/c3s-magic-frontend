import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardTitle, Button, Row, Col, Alert, UncontrolledAlert, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, FormGroup, Label } from 'reactstrap';
import RenderProcesses from './RenderProcesses';
import { doWPSCall } from '../utils/WPSRunner';
import ImagePreview from './ImagePreview';
import { withRouter } from 'react-router';
import { toArray } from 'adaguc-webmapjs';
import _ from 'lodash';
class WPSDemoCopernicus extends Component {
  constructor (props) {
    super(props);
    this.wpsExecute = this.wpsExecute.bind(this);
    this.onChange = this.onChange.bind(this);
    this.resultClickCallback = this.resultClickCallback.bind(this);
    this.handleLocationChange = this.handleLocationChange.bind(this);
    this.getWPSUrlByName = this.getWPSUrlByName.bind(this);
    this.getWPSProcessList = this.getWPSProcessList.bind(this);
    this.onWpsButtonClick = this.onWpsButtonClick.bind(this);
    this.getWPSProcessInfo = this.getWPSProcessInfo.bind(this);
    this.createForm = this.createForm.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.toggleWPSSelectorDropDown = this.toggleWPSSelectorDropDown.bind(this);
    this.fetchProcesses = this.fetchProcesses.bind(this);
    console.log('Constructing WPSDemoCopernicus');
    this.state = {
      describeProcessDocument: null,
      currentWPSNodeName: 'copernicus-wps',
      wpsProcessName: [],
      wpsInfoFetched: false,
      wpsProcessData: [],
      wpsFormElements: null,
      wpsFormCurrent: [],
      showForm: false,
      formNoInputFound: false,
      formNoOutputFound: false,
      selectedProcess: null,
      isBusy: false,
      isBusyMessage: '',
      runningJobs: [],
      errorExists: false,
      errorContent: ''
    };
    // console.log(props);
  }

  getWPSUrlByName (wpsName) {
    const { compute } = this.props;
    if (compute) {
      for (let c = 0; c < compute.length; c++) {
        if (compute[c].name === wpsName) {
          return compute[c].url;
        }
      }
    }
    throw new Error('Compute service with name ' + wpsName + ' not found');
  }

  fetchProcesses () {
    this.getWPSProcessList().then((response) => {
      if (response === 'success') {
        this.setState({ wpsInfoFetched: true });
        this.setState({ isBusy: false });
        this.setState({ isBusyMessage: '' });
        if (this.handleLocationChange(this.props.location) !== true) {
          if (!this.state.selectedProcess && this.state.wpsProcessName.length > 0) {
            this.onWpsButtonClick(this.state.wpsProcessName[0].name, false);
          }
        }
      }
    }
    ).catch((error) => {
      console.log('error: ', error);
      this.setState({
        isBusy: false,
        isBusyMessage: 'Error while getting process list from the server: ' + error });
    });
  }

  componentDidMount () {
    this.fetchProcesses();
  }
  componentDidUpdate (prevProps) {
    if (prevProps.compute !== this.props.compute) {
      console.log('updating compute props');
      if (this.state.wpsInfoFetched === true) {
        console.log('success already updated');
        return;
      }
      this.fetchProcesses();
    }
  }

  // wps service related methods
  getWPSProcessList () {
    return new Promise((resolve, reject) => {
      this.setState({ isBusy: true });
      this.setState({ isBusyMessage: ' Getting process list from the server.' });

      let wpsUrl = this.getWPSUrlByName(this.state.currentWPSNodeName);
      doWPSCall(wpsUrl + 'service=wps&request=getcapabilities&version=1.0.0',
        (result) => {
          let processNames = [];

          try {
            let wpsProcessList = result['Capabilities']['ProcessOfferings']['Process'];
            for (let key in wpsProcessList) {
              try {
                let identifier = wpsProcessList[key]['Identifier'].value;
                processNames.push({ name: identifier });
              } catch (e) {
                console.log(e);
              }
            }
          } catch (e) {
            console.log(e);
          }
          this.setState(
            {
              wpsProcessName: processNames,
              describeProcessDocument: result,
              isBusy:false,
              isBusyMessage: ''
            },
            () => { resolve('success'); }
          );
        }, (error) => {
          console.error(error);
          this.setState({ describeProcessDocument: error });

          this.setState({ isBusy: false });
          this.setState({ isBusyMessage: '' });

          // console.log('Promise.reject from WPSCalculate::getWPSProcessList()');
          reject(new Error('failed'));
        }
      );
    });
  }

  onWpsButtonClick (wpsName, changeLocation) {
    if (changeLocation) {
      this.props.router.push('/calculate/' + wpsName);
    }
    if (this.state.selectedProcess === wpsName) {
      console.log('Process alreay selected');
      return;
    }
    return new Promise((resolve, reject) => {
      this.getWPSProcessInfo(wpsName)
        .then(response => {
          this.setState(
            {
              isBusy: false,
              isBusyMessage: '',
              selectedProcess: wpsName
            },
            resolve(response)
          );
        }).catch((e) => {
          reject(new Error('Could not get the process list!'));
        });
    });
  }

  getWPSProcessInfo (processName) {
    this.setState({ isBusy: true, isBusyMessage: 'getting settings for ' + processName });
    console.log('getting getWPSProcessInfo');
    return new Promise((resolve, reject) => {
      let wpsUrl = this.getWPSUrlByName(this.state.currentWPSNodeName);
      doWPSCall(wpsUrl + 'service=wps&version=1.0.0&request=describeprocess&identifier=' + processName,
        (result) => {
          this.setState({ formNoInputFound: false });
          console.log('Searching for input and output types in ', processName, 'process', result);

          let formItemInputs = [];
          let formItemOutputs = [];

          let wpsOutputList = null;
          let wpsInputList = null;

          /* Searching inputs */
          try {
            wpsInputList = result['ProcessDescriptions'].ProcessDescription.DataInputs.Input;

            // console.log('input list: ', wpsInputList);

            for (let myKey in wpsInputList) {
              const key = toArray(myKey);
              try {
                let item = wpsInputList[key];

                // console.log('intput item\n', item);

                let newInput = {};
                let itemTitle = item['Title'].value;
                let itemAbstract = itemTitle;
                try {
                  itemAbstract = item['Abstract'].value;
                } catch (e) {}
                let itemIdentifier = item['Identifier'].value;
                let itemDataType = item.LiteralData['DataType'].value;

                let itemDefaultValue = '';

                try {
                  itemDefaultValue = item.LiteralData.DefaultValue.value;
                } catch (e) {
                }

                let itemAllowedValues = item.LiteralData['AllowedValues'];

                // fix for non-existing allowedvalues field
                if (typeof itemAllowedValues !== 'undefined') {
                // console.log('Found allowed values!');
                  itemAllowedValues = itemAllowedValues['Value'];
                // console.log(itemAllowedValues);
                }

                newInput.title = itemTitle;
                newInput.identifier = itemIdentifier;
                newInput.type = itemDataType;
                newInput.default = itemDefaultValue;
                newInput.selected = itemDefaultValue;
                newInput.abstract = itemAbstract;
                newInput.allowedValues = [];
                for (let keyAV in itemAllowedValues) {
                  let av = itemAllowedValues[keyAV];

                  if (av.value === undefined) {
                    newInput.allowedValues.push(av);
                  } else {
                    newInput.allowedValues.push(av.value);
                  }
                }
                formItemInputs.push(newInput);
              } catch (e) {
                console.warn('Omitting ' + key + ' because ', e);
              }
            }
          } catch (err) {
            console.log('No input settings found:', err);
            this.setState({ formNoInputFound: true });
          }

          /* Searching outputs */
          try {
            wpsOutputList = result['ProcessDescriptions'].ProcessDescription.ProcessOutputs.Output;

            for (let key in wpsOutputList) {
              let outItem = wpsOutputList[key];

              // console.log('output outItem\n', outItem);

              let newOutput = {};
              let itemTitle = '';
              let itemAbstract = '';
              let itemIdentifier = '';

              try {
                itemTitle = outItem['Title'].value;
              } catch (e) {
              }
              try {
                itemAbstract = outItem['Abstract'].value;
              } catch (e) {
              }
              try {
                itemIdentifier = outItem['Identifier'].value;
              } catch (e) {
              }

              newOutput.title = itemTitle;
              newOutput.abstract = itemAbstract;
              newOutput.identifier = itemIdentifier;

              formItemOutputs.push(newOutput);
            }
          } catch (err) {
            console.log('No output settings found!');
            console.log('error:', err);
            this.setState({ formNoOutputFound: true });
          }

          this.setState((prevState) => {
            return { 'processInputs': formItemInputs };
          });

          this.setState((prevState) => {
            return { 'processOutputs': formItemOutputs };
          });

          // console.log(this.state);

          this.setState({ isBusy: false, isBusyMessage: '' });

          // generate form elements of the selected process
          let formElements = this.createForm();
          this.setState({ showForm: true });

          this.setState({
            wpsFormElements: formElements
          });

          // console.log('Promise.resolve from WPSCalculate::getWPSProcessInfo()');
          resolve('success');
        }, (error) => {
          // console.log('Promise.reject from WPSCalculate::getWPSProcessInfo()');
          console.log('error: ', error);
          reject(new Error('failed' + error));
        }
      ); // doWPSCall
    }); // promise
  }

  createForm () {
    this.setState({ isBusy: true });
    this.setState({ isBusyMessage: ' generating the form' });

    let inputList = this.state.processInputs;
    if (!inputList || inputList.length === 0) {
      return (<div>This process has no inputs</div>);
    }
    let formElements = inputList.map((el, index) => {
      if (el.type === 'string' && el.allowedValues.length > 0) {
        // console.log('selectbox: ', el);
        // console.log(el.allowedValues);
        return (
          <div key={'container' + el.title + index} className={'WPSDemoCopernicus_InputLabels'} >
            <label key={el.title + index}>
              <span className={'WPSDemoCopernicus_InputLabelsLabel'}>
                {el.title}:
              </span>
              <select
                value={this.state.processInputs[index].selected}
                onChange={this.onChange}
                name={el.title}
              >
                {el.allowedValues.map(av =>
                  <option
                    key={av}
                    value={av}
                  >
                    {av}
                  </option>
                )}
              </select>
            </label>
            <span className={'WPSDemoCopernicus_InputAbstract'}>
              {el.abstract}
            </span>
          </div>
        );
      }

      if (el.type === 'string') {
        // console.log('string: ', el);
        return (
          <div key={'container' + el.title + index} className={'WPSDemoCopernicus_InputLabels'} >
            <label key={el.default}>
              <span className={'WPSDemoCopernicus_InputLabelsLabel'}>
                {el.title}:
              </span>
              <input
                key={el.title + index}
                type='text'
                name={el.title}
                value={this.state.processInputs[index].selected}
                onChange={this.onChange} />
            </label>
            <span className={'WPSDemoCopernicus_InputAbstract'}>
              {el.abstract}
            </span>
          </div>
        );
      }

      if (el.type === 'integer') {
        // console.log('integer: ', el);
        return (
          <div key={'container' + el.title + index} className={'WPSDemoCopernicus_InputLabels'} >
            <label key={el.title + index}>
              <span className={'WPSDemoCopernicus_InputLabelsLabel'}>>
                {el.title}:
              </span>
              <input
                key={index}
                name={el.title}
                type='number'
                size='6'
                width='6'
                value={this.state.processInputs[index].selected}
                onChange={this.onChange} />
            </label>
            <span className={'WPSDemoCopernicus_InputAbstract'}>
              {el.abstract}
            </span>
          </div>
        );
      }
    });

    this.setState({ isBusy: false });
    this.setState({ isBusyMessage: '' });
    return formElements;
  }

  wpsExecute () {
    const { dispatch, actions, nrOfStartedProcesses } = this.props;
    let wpsUrl = this.getWPSUrlByName(this.state.currentWPSNodeName);
    dispatch(actions.startWPSExecute(wpsUrl,
      'sleep',
      '[delay=' + this.state.delay + ';]', nrOfStartedProcesses));
  };

  formSubmit (event) {
    this.setState({ isBusy: true });
    this.setState({ isBusyMessage: 'formSubmit' });
    let dataInputs = '';
    _.forIn(this.state.processInputs, (value, key) => {
      if (dataInputs.length > 1) {
        dataInputs += ';';
      }
      dataInputs += value.identifier + '=' + value.selected;
      // console.log(key, value.title, value.selected);
      // console.log(dataInputs);
    });
    // dataInputs += ']';

    // console.log(dataInputs);

    const { dispatch, actions, nrOfStartedProcesses } = this.props;
    let wpsUrl = this.getWPSUrlByName(this.state.currentWPSNodeName);
    dispatch(actions.startWPSExecute(wpsUrl,
      this.state.selectedProcess,
      dataInputs,
      nrOfStartedProcesses)
    );

    this.setState({ isBusy: false });
    this.setState({ isBusyMessage: '' });
  }

  onChange (event) {
    this.setState({ isBusy: true });
    this.setState({ isBusyMessage: 'onChange' });

    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    let stateItemIndex = this.state.processInputs.map((e) => { return e.title; }).indexOf(name);
    // console.log('stateItemIndex:', stateItemIndex);

    const items = this.state.processInputs;
    items[stateItemIndex].selected = value;

    // update state
    this.setState({
      items
    });

    // update the form
    let formElements = this.createForm();
    this.setState({ showForm: true });

    this.setState({
      wpsFormElements: formElements
    });

    this.setState({ isBusy: false });
    this.setState({ isBusyMessage: '' });
  }

  handleLocationChange (newLocation) {
    const { hash, pathname } = newLocation;
    let location = hash && hash.length > 0 ? hash : pathname;
    // console.log('newlocation', location);
    const hashParts = location.split('/');
    // console.log(hashParts);
    if (hashParts.length === 3) {
      const lastPart = hashParts[hashParts.length - 1];
      if (lastPart && lastPart.length > 0) {
        this.onWpsButtonClick(lastPart, false);
        return true;
      }
    }
    return false;
  }

  componentWillUpdate (nextProps) {
    if (nextProps && this.props && nextProps.location && nextProps.location.hash && this.props.location && this.props.location.hash && this.props.location.hash !== nextProps.location.hash) {
      console.log('location willl change to', nextProps.location.hash);
      this.handleLocationChange(nextProps.location);
    }
  }

  resultClickCallback (value) {
    // const { dispatch, actions, nrOfStartedProcesses, compute } = this.props;

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

  toggleWPSSelectorDropDown () {
    this.setState(prevState => ({
      wpsSelectorDropDownOpen: !prevState.wpsSelectorDropDownOpen
    }));
  }

  render () {
    const { compute, runningProcesses, actions, dispatch } = this.props;
    const { showForm, isBusy, isBusyMessage, wpsInfoFetched } = this.state;
    const { errorExists, errorContent, formNoInputFound } = this.state;
    const { wpsFormElements } = this.state;

    if (isBusy) {
      return (
        <div>
          {compute
            ? <Alert color='info'>
            Busy: { isBusyMessage }
            </Alert>
            : ''}
        </div>
      );
    }

    if (!wpsInfoFetched) {
      return (
        <div>
          {compute
            ? <Alert color='warning'>
            Couldn't fetch WPS Process info. {this.state.isBusyMessage}
            </Alert>
            : ''}
        </div>
      );
    } else {
      return (
        <div style={{ backgroundColor: '#FFF', width: '100%', fontFamily: 'Roboto', padding:'20px' }}>
          <Row>
            <Col sm='12'>
              {compute
                ? <div>
                  <Alert color='info'>
                    Current compute node location is { this.getWPSUrlByName(this.state.currentWPSNodeName) }
                  </Alert>
                  <Row>
                    <FormGroup>
                      <Row>
                        <Col xs='auto' ><Label style={{ lineHeight: '40px' }}>Select a process: </Label></Col>
                        <Col xs='auto' >
                          <Dropdown isOpen={this.state.wpsSelectorDropDownOpen} toggle={this.toggleWPSSelectorDropDown}>
                            <DropdownToggle caret>
                              {this.state.selectedProcess}
                            </DropdownToggle>
                            <DropdownMenu>
                              <DropdownItem header>Please select one of the processes</DropdownItem>
                              {
                                this.state.wpsProcessName.map((wp, index) => {
                                  return <DropdownItem key={index} color='primary' onClick={() => { this.onWpsButtonClick(wp.name, true); }}>{wp.name}</DropdownItem>;
                                })
                              }
                            </DropdownMenu>
                          </Dropdown>
                        </Col>
                      </Row>
                    </FormGroup>
                  </Row>
                  {errorExists
                    ? <UncontrolledAlert color='danger' style={{ textAlign: 'initial' }}>
                      {errorContent}
                    </UncontrolledAlert>
                    : showForm
                      ? <Card>

                        {formNoInputFound
                          ? <Alert color='info'>
                          No settings were found for the selected process.
                          </Alert>
                          : '' }

                        <CardBody className='ProcessSettings_CardBody'>
                          <CardTitle>Settings for process {this.state.selectedProcess}</CardTitle>
                          {wpsFormElements}
                          <br />
                          <hr />
                          <Button key={'submitButton'} color='primary' onClick={() => { this.formSubmit(); }}>Start calculation</Button>
                        </CardBody>
                      </Card> : ''
                  }
                </div>
                : <div>You need to sign in to use this functionality</div>}
            </Col>
          </Row>
          <Row>
            <Col sm='12'>
              {compute
                ? <div>
                  <RenderProcesses runningProcesses={runningProcesses} resultClickCallback={this.resultClickCallback} dispatch={dispatch} actions={actions} />
                </div>
                : ''}
            </Col>
          </Row>
        </div>);
    }
  }
}

WPSDemoCopernicus.propTypes = {
  compute: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  nrOfStartedProcesses: PropTypes.number,
  runningProcesses: PropTypes.object.isRequired,
  location: PropTypes.object,
  router: PropTypes.object
};

export default withRouter(WPSDemoCopernicus);
