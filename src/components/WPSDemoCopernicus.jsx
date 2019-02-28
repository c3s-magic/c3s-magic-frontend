import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Button, Input, Row, Col, Alert } from 'reactstrap';
import { xml2jsonparser } from '../utils/xml2jsonparser';
import RenderProcesses from './RenderProcesses';
import { doWPSCall } from '../utils/WPSRunner';
import ImagePreview from './ImagePreview';
import { withRouter } from 'react-router';

class WPSDemoCopernicus extends Component {
  constructor (props) {
    super(props);
    this.wpsExecute = this.wpsExecute.bind(this);
    this.onChange = this.onChange.bind(this);
    this.resultClickCallback = this.resultClickCallback.bind(this);
    this.handleLocationChange = this.handleLocationChange.bind(this);

    this.state = {
      describeProcessDocument: null,

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

  async componentDidMount () {
    // console.log('WPSCalculate::componentDidMount()');
    var that = this;

    that.setState({ isBusy: true });
    that.setState({ isBusyMessage: 'getWPSProcessList' });

    await this.getWPSProcessList()
      .then(function (response) {
        // console.log('response: ', response);
        if (response === 'success') {
          that.setState({ wpsInfoFetched: true });
          that.setState({ isBusy: false });
          that.setState({ isBusyMessage: '' });
          that.handleLocationChange(that.props.location);
        }
      }
      ).catch(function (error) {
        console.log('error: ', error);
      });
  }

  // wps service related methods
  async getWPSProcessList () {
    var that = this;
    return new Promise(function (resolve, reject) {
      that.setState({ isBusy: true });
      that.setState({ isBusyMessage: ' Getting process list from the server.' });

      let wpsUrl = 'https://portal.c3s-magic.eu/copernicus-wps/?';
      doWPSCall(wpsUrl + 'service=wps&request=getcapabilities&version=1.0.0',
        (result) => {
          // console.log(result);
          that.setState({ describeProcessDocument: result });

          try {
            var wpsProcessList = result['Capabilities']['ProcessOfferings']['Process'];
            // console.log('91::wpsProcessList', wpsProcessList);

            for (var key in wpsProcessList) {
              var pName = wpsProcessList[key]['Identifier'].value;

              that.setState((prevState) => {
                const { wpsProcessName } = prevState;
                wpsProcessName.push({ name: pName });
                return { wpsProcessName };
              });
            }
          } catch (e) {
            console.log('Process list error!');
            console.log(e);
          }

          that.setState({ isBusy: false });
          that.setState({ isBusyMessage: '' });
          // console.log('Promise.resolve from WPSCalculate::getWPSProcessList()');
          resolve('success');
        }, (error) => {
          console.error(error);
          that.setState({ describeProcessDocument: error });

          that.setState({ isBusy: false });
          that.setState({ isBusyMessage: '' });

          // console.log('Promise.reject from WPSCalculate::getWPSProcessList()');
          reject('failed');
        }
      );
    });
  }

  onWpsButtonClick (wpsName) {
    // console.log('Clicked on button --> ', wpsName);
    this.props.router.push('/calculate/' + wpsName);
    this.getWPSProcessInfo(wpsName)
      .then(response => {
        // console.log(response);
        // console.log(this.state);
        this.setState({ isBusy: false });
        this.setState({ isBusyMessage: '' });
        this.setState({ selectedProcess: wpsName });

        return response;
      }).catch(function (e) {
        console.error('Couldnot get the process list!');
      });

    // this.setState({ isBusy: false });
    // return response;
  }

  async getWPSProcessInfo (processName) {
    var that = this;
    that.setState({ isBusy: true });
    that.setState({ isBusyMessage: 'getting settings for ' + processName });
    // console.log('WPSCalculate::getWPSProcessInfo(processName)');
    // console.log('Checking processes info for', processName);

    return new Promise(function (resolve, reject) {
      let wpsUrl = 'https://portal.c3s-magic.eu/copernicus-wps/?';
      doWPSCall(wpsUrl + 'service=wps&version=1.0.0&request=describeprocess&identifier=' + processName,
        (result) => {
        // console.log(result);
          // console.log('Searching for input and output types in ', processName, 'process');

          var formItemInputs = [];
          var formItemDefaults = [];
          var formItemOutputs = [];

          var wpsOutputList = null;
          var wpsInputList = null;

          try {
            wpsInputList = result['ProcessDescriptions'].ProcessDescription.DataInputs.Input;

            // console.log('input list: ', wpsInputList);

            for (var key in wpsInputList) {
              var item = wpsInputList[key];

              // console.log('intput item\n', item);

              var newInput = {};
              var itemTitle = item['Title'].value;
              var itemIdentifier = item['Identifier'].value;
              var itemDataType = item.LiteralData['DataType'].value;

              var itemDefaultValue = '';

              try {
                itemDefaultValue = item.LiteralData.DefaultValue.value;
              } catch (e) {
              }

              var itemAllowedValues = item.LiteralData['AllowedValues'];

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

              newInput.allowedValues = [];
              for (var keyAV in itemAllowedValues) {
                var av = itemAllowedValues[keyAV];

                if (av.value === undefined) {
                  newInput.allowedValues.push(av);
                } else {
                  newInput.allowedValues.push(av.value);
                }

              // console.log('av:', av);
              // console.log('value:', av.value);
              }

              // formItemInputs[index] = newInput;
              formItemInputs.push(newInput);
              // formItemDefaults.push({ [itemTitle]:itemDefaultValue });

              // that.setState((prevState) => {
              //   const { wpsFormCurrent } = prevState;
              //   var name = processName + itemTitle;
              //   wpsFormCurrent.push({ [name]: itemDefaultValue });
              //   return { wpsFormCurrent };
              // });
            }
          } catch (err) {
            console.log('No input settings found!');
            console.log('error:', err);
            that.setState({ formNoInputFound: true });
          }

          try {
            wpsOutputList = result['ProcessDescriptions'].ProcessDescription.ProcessOutputs.Output;

            // wpsOutputList.forEach(function (item, index) {
            for (var key in wpsOutputList) {
              var outItem = wpsOutputList[key];

              // console.log('output outItem\n', outItem);

              var newOutput = {};
              var itemTitle = '';
              var itemAbstract = '';
              var itemIdentifier = '';

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
            that.setState({ formNoOutputFound: true });
          }

          that.setState((prevState) => {
            return { 'processInputs': formItemInputs };
          });

          that.setState((prevState) => {
            return { 'processOutputs': formItemOutputs };
          });

          // console.log(that.state);

          that.setState({ isBusy: false });
          that.setState({ isBusyMessage: '' });

          // generate form elements of the selected process
          var formElements = that.createForm();
          that.setState({ showForm: true });

          that.setState({
            wpsFormElements: formElements
          });

          // console.log('Promise.resolve from WPSCalculate::getWPSProcessInfo()');
          resolve('success');
        }, (error) => {
          // console.log('Promise.reject from WPSCalculate::getWPSProcessInfo()');
          console.log('error: ', error);
          reject('failed');
        }
      ); // doWPSCall
    }); // promise
  }

  createForm () {
    var that = this;

    this.setState({ isBusy: true });
    this.setState({ isBusyMessage: ' generating the form' });

    var inputList = this.state.processInputs;
    // console.log(inputList);
    // console.log(that.state);

    var formElements = inputList.map(function (el, index) {
      if (el.type === 'string' && el.allowedValues.length > 0) {
        // console.log('selectbox: ', el);
        // console.log(el.allowedValues);
        return (
          <label key={el.title + index}>
            {el.title}:
            <select
              value={that.state.processInputs[index].selected}
              onChange={that.onChange}
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
        );
      }

      if (el.type === 'string') {
        // console.log('string: ', el);
        return (
          <label key={el.default}>
            {el.title}:
            <input
              key={el.title + index}
              type='text'
              name={el.title}
              value={that.state.processInputs[index].selected}
              onChange={that.onChange} />
          </label>
        );
      }

      if (el.type === 'integer') {
        // console.log('integer: ', el);
        return (
          <label key={el.title + index}>
            {el.title}:
            <input
              key={index}
              name={el.title}
              type='number'
              size='6'
              width='6'
              value={that.state.processInputs[index].selected}
              onChange={that.onChange} />
          </label>
        );
      }
    });

    this.setState({ isBusy: false });
    this.setState({ isBusyMessage: '' });
    return formElements;
  }

  wpsExecute () {
    const { dispatch, actions, nrOfStartedProcesses, compute } = this.props;
    let wpsUrl = 'https://portal.c3s-magic.eu/copernicus-wps/?';
    dispatch(actions.startWPSExecute(wpsUrl,
      'sleep',
      '[delay=' + this.state.delay + ';]', nrOfStartedProcesses));
  };

  formSubmit (event) {
    var that = this;
    this.setState({ isBusy: true });
    this.setState({ isBusyMessage: 'formSubmit' });
    // console.log('WPSCalculate::formSubmit(formData)');
    // console.log('event submitted: ', event);

    // console.log(that.state.processInputs);

    // let dataInputs = '[';
    let dataInputs = '';
    _.forIn(that.state.processInputs, function (value, key) {
      if (dataInputs.length > 1) {
        dataInputs += ';';
      }
      dataInputs += value.identifier + '=' + value.selected;
      // console.log(key, value.title, value.selected);
      // console.log(dataInputs);
    });
    // dataInputs += ']';

    // console.log(dataInputs);

    const { dispatch, actions, nrOfStartedProcesses, compute } = this.props;
    let wpsUrl = 'https://portal.c3s-magic.eu/copernicus-wps/?';
    dispatch(actions.startWPSExecute(wpsUrl,
      this.state.selectedProcess,
      dataInputs,
      nrOfStartedProcesses)
    );

    this.setState({ isBusy: false });
    this.setState({ isBusyMessage: '' });
  }

  onChange (event) {
    var that = this;
    // console.log(this.state);

    this.setState({ isBusy: true });
    this.setState({ isBusyMessage: 'onChange' });

    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    // console.log('target:', target);
    // console.log('value:', value);
    // console.log('name:', name);
    // console.log(that.state.processInputs);

    var stateItemIndex = that.state.processInputs.map(function (e) { return e.title; }).indexOf(name);
    // console.log('stateItemIndex:', stateItemIndex);

    const items = this.state.processInputs;
    items[stateItemIndex].selected = value;

    // update state
    this.setState({
      items
    });

    // update the form
    var formElements = that.createForm();
    that.setState({ showForm: true });

    that.setState({
      wpsFormElements: formElements
    });

    // console.log(this.state);
    // console.log(that.state.processInputs);

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
        this.onWpsButtonClick(lastPart);
      }
    }
  }

  componentWillUpdate (nextProps) {
    if (nextProps && this.props && nextProps.location && nextProps.location.hash && this.props.location && this.props.location.hash && this.props.location.hash != nextProps.location.hash) {
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

  render () {
    var that = this;
    const { compute, runningProcesses, nrOfStartedProcesses, actions, dispatch } = this.props;
    const { showForm, isBusy, isBusyMessage, wpsProcessName, wpsInfoFetched, runningJobs } = this.state;
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
            Couldn't fetch WPS Process info.
            </Alert>
            : ''}
        </div>
      );
    } else {
      var wpsButtonList = this.state.wpsProcessName.map(function (wp, index) {
        return <Button key={index} color='primary' onClick={() => { that.onWpsButtonClick(wp.name); }}>{wp.name}</Button>;
      });

      return (
        <div style={{ backgroundColor: '#FFF', width: '100%' }}>

          <Row>
            <Col sm='12'>
              {compute
                ? <div>
                  <Alert color='info'>
                  Compute node = { 'https://portal.c3s-magic.eu/copernicus-wps' }
                  </Alert>
                  <Row>
                    <ul>
                      {wpsButtonList}
                    </ul>
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

                        <CardBody>
                          <form onSubmit={this.formSubmit}>
                            {wpsFormElements}
                            <Button key={'submitButton'} color='primary' onClick={() => { that.formSubmit(); }}>Start</Button>
                          </form>
                        </CardBody>
                      </Card> : ''
                  }
                </div>
                : <div>You need to sign in to use this functionality</div>}
            </Col>
          </Row>
          <Row>
            <Col sm='12'>
              {showForm
                ? <Alert color='info'>
                The submitted jobs will be shown below.
                </Alert>
                : '' }
              {compute
                ? <div>
                  { Object.keys(runningProcesses).length > 0 && <h2>Your processing results:</h2> }
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
  compute: PropTypes.array,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  nrOfStartedProcesses: PropTypes.number,
  nrOfFailedProcesses: PropTypes.number,
  nrOfCompletedProcesses: PropTypes.number,
  runningProcesses: PropTypes.object.isRequired,
  location: PropTypes.object
};

export default withRouter(WPSDemoCopernicus);
