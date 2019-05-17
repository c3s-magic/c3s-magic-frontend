import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardTitle, Button, Row, Col, Alert, UncontrolledAlert, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Label } from 'reactstrap';
import RenderProcesses from './RenderProcesses';
import { doWPSCall, clearWPSCache } from '../utils/WPSRunner';
import ImagePreview from './ImagePreview';
import { withRouter } from 'react-router';
import Icon from 'react-fa';
import _ from 'lodash';
import axios from 'axios';
import MarkdownFromFile from '../containers/MarkdownFromFile';
import { produce } from 'immer';

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
    this.toggleComputeNodeSelectorDropDown = this.toggleComputeNodeSelectorDropDown.bind(this);
    this.fetchProcesses = this.fetchProcesses.bind(this);
    this.getProcessInfo = this.getProcessInfo.bind(this);
    this.setComputeNode = this.setComputeNode.bind(this);
    this.setStatePromise = this.setStatePromise.bind(this);
    this.renderCompute = this.renderCompute.bind(this);
    this.getDRSTree = this.getDRSTree.bind(this);
    this.state = {
      describeProcessDocument: null,
      currentWPSNodeName: this.getInfoFromLocation(this.props.location).computeNode,
      wpsProcessName: [],
      wpsInfoFetched: false,
      wpsProcessData: [],
      wpsFormElements: null,
      wpsFormCurrent: [],
      showForm: false,
      formNoInputFound: false,
      selectedProcess: null,
      isBusy: false,
      isBusyMessage: '',
      runningJobs: [],
      errorExists: false,
      errorContent: ''
    };
    this.drsTree = null;
    console.log('constructed');
    this.getDRSTree();
    // console.log(props);
  }

  getDRSTree () {
    console.log('Getting DRS tree');
    axios({
      method: 'get',
      url: './cp4cds-wps-tree.json',
      responseType: 'json'
    }).then(src => {
      console.log(src.data[0].contents);
    }).catch((e) => {
      console.error(e);
    });
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

  setStatePromise (obj) {
    return new Promise((resolve) => {
      this.setState(obj, () => { resolve(); });
    });
  }

  fetchProcesses () {
    return new Promise((resolve, reject) => {
      if (!this.props.compute || !this.props.compute.length || this.props.compute.length === 0) {
        return this.setStatePromise({
          isBusy: false,
          isBusyMessage: 'No compute nodes set'
        }).then(() => {
          reject(new Error('Unable to fetchProcesses: No compute nodes set'));
        });
      }
      console.log('start getWPSProcessList');
      return this.getWPSProcessList().then((response) => {
        if (response === 'success') {
          return this.setStatePromise({
            wpsInfoFetched: true,
            isBusy: false,
            isBusyMessage: ''
          }).then(() => {
            return this.onWpsButtonClick(null);
          });
        } else {
          reject(new Error('getWPSProcessList failed'));
        }
      }).catch((error) => {
        return this.setStatePromise({
          isBusy: false,
          isBusyMessage: 'Error while getting process list from the server: ' + JSON.stringify(error, null, 2)
        }).then(() => {
          reject(error);
        });
      });
    });
  }

  componentDidMount () {
    if (this.props.compute && this.props.compute.length > 0) {
      this.handleLocationChange(this.props.location);
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.compute !== this.props.compute) {
      console.log('updating compute props');
      if (this.state.wpsInfoFetched === true) {
        console.log('success already updated');
        return;
      }
      console.log('start fetching processes via componentDidUpdate');
      this.fetchProcesses().catch((e) => {
        console.log(e);
        this.setState({ isBusyMessage: JSON.stringify(e, null, 2) });
      });
    }
  }

  // wps service related methods
  getWPSProcessList () {
    console.log('getWPSProcessList for ' + this.state.currentWPSNodeName);
    return new Promise((resolve, reject) => {
      if (this.state.fetchedWPSNodeName === 'fetching') {
        reject(new Error('Already fetching WPS GetCapabilities'));
        return;
      }
      if (this.state.fetchedWPSNodeName === this.state.currentWPSNodeName) {
        console.log('Already fetched');
        resolve('success');
        return;
      }

      this.setState({ isBusy: true, isBusyMessage: ' Getting process list from the server.', fetchedWPSNodeName: 'fetching' });
      const currentWPSNodeName = this.state.currentWPSNodeName;
      let wpsUrl = this.getWPSUrlByName(currentWPSNodeName);
      doWPSCall(wpsUrl + 'service=wps&request=getcapabilities&version=1.0.0',
        (result) => {
          let processNames = [];

          try {
            /* With a single input the keys are not mapped on {'0': ..., '1': ...} but directly to the object */
            const wpsProcessListTMP = result['Capabilities']['ProcessOfferings']['Process'];
            const wpsProcessListKeys = Object.keys(wpsProcessListTMP);
            const wpsProcessList = (wpsProcessListKeys.length > 0 && wpsProcessListKeys[0] !== '0') ? { '0': wpsProcessListTMP } : wpsProcessListTMP;
            for (let key in wpsProcessList) {
              try {
                let identifier = wpsProcessList[key]['Identifier'].value;
                let abstract = '<no abstract provided>'; try { abstract = wpsProcessList[key]['Abstract'].value; } catch (e) {}
                let title = '<no title provided>'; try { title = wpsProcessList[key]['Title'].value; } catch (e) {}
                processNames.push({ name: identifier, abstract: abstract, title: title });
              } catch (e) {
                console.log(e);
              }
            }
          } catch (e) {
            console.error(e, result);
            this.setState({ describeProcessDocument: null, isBusy: false, isBusyMessage: '', fetchedWPSNodeName: null });
            reject(new Error('Invalid response from WPS GetCapabilities: ' + JSON.stringify(result, null, 2)));
            return;
          }
          return this.setStatePromise(
            {
              wpsProcessName: processNames,
              fetchedWPSNodeName: currentWPSNodeName,
              describeProcessDocument: result,
              isBusy:false,
              isBusyMessage: ''
            }).then(() => { resolve('success'); }
          );
        }, (error) => {
          console.error(error);
          this.setState({ describeProcessDocument: error, isBusy: false, isBusyMessage: '', fetchedWPSNodeName: null });
          // console.log('Promise.reject from WPSCalculate::getWPSProcessList()');
          reject(new Error('failed'));
        }
      );
    });
  }

  onWpsButtonClick (_wpsName) {
    console.log('onWpsButtonClick');
    return new Promise((resolve, reject) => {
      /* Determine current WPS process name */
      let wpsName = _wpsName || this.state.selectedProcess;
      if (wpsName === null) {
        wpsName = this.getInfoFromLocation(this.props.location).wpsName;
        if (wpsName === null) {
          console.log('WPSName === null, setting to first');
          if (this.state.wpsProcessName && this.state.wpsProcessName.length > 0) {
            wpsName = this.state.wpsProcessName[0].name;
            console.log('Auto set WPS name to ' + wpsName);
          } else {
            reject(new Error('No processes available'));
          }
        }
      }
      /* Check if this process is in our list */
      if (this.state.wpsProcessName && this.state.wpsProcessName.length > 0) {
        const found = this.state.wpsProcessName.findIndex(e => e.name === wpsName);
        if (found === -1) {
          console.warn('Process not found in compute node, setting default');
          reject(new Error('Process not found in compute node process list'));
          // console.log('rejecte4d');
          // return;
          wpsName = this.state.wpsProcessName[0].name;
        }
      }
      this.props.router.push('/calculate/' + this.state.currentWPSNodeName + '/' + wpsName);
      if (this.state.selectedProcess === _wpsName && this.state.selectedProcess !== null) {
        console.log('Process [' + _wpsName + '] already selected');
        resolve('Process already selected');
      }
      return this.getWPSProcessInfo(wpsName)
        .then(response => {
          return this.setStatePromise(
            {
              isBusy: false,
              isBusyMessage: '',
              selectedProcess: wpsName
            }).then(() => { resolve(response); });
        }).catch((e) => {
          return this.setStatePromise(
            {
              isBusy: false,
              isBusyMessage: 'Error' + JSON.stringify(e, null, 2),
              selectedProcess: null
            }).then(() => { reject(new Error('Could not get the process list!' + e)); });
        });
    });
  }

  getWPSProcessInfo (processName) {
    this.setState({ isBusy: true, isBusyMessage: 'getting settings for ' + processName });
    console.log('getting getWPSProcessInfo for ' + processName);
    return new Promise((resolve, reject) => {
      let wpsUrl = this.getWPSUrlByName(this.state.currentWPSNodeName);
      let describeProcessLink = wpsUrl + 'service=wps&version=1.0.0&request=describeprocess&identifier=' + processName;
      this.setState({ describeProcessLink: describeProcessLink });
      doWPSCall(describeProcessLink,
        (result) => {
          this.setState({ formNoInputFound: false, documentationLink: null });

          console.log('Looking for link');

          try {
            let metadataItems = {};
            let _metadataItems = result['ProcessDescriptions'].ProcessDescription.Metadata;
            if (!_metadataItems[0]) metadataItems[0] = _metadataItems; else metadataItems = _metadataItems;
            let metadata = [];
            for (let key in metadataItems) {
              try {
                let metadataItem = metadataItems[key];
                metadata.push({ title: metadataItem.attr.title, href:  metadataItem.attr.href });
              } catch (e) {
                console.log(e);
              }
            }
            this.setState({ documentationLink: metadata });
          } catch (e) {
            console.log(e);
          }

          console.log('Searching for input and output types in ', processName, 'process', result);

          let formItemInputs = [];
          let formItemOutputs = [];

          let wpsOutputList = null;
          /* Searching inputs */
          try {
            /* With a single input the keys are not mapped on {'0': ..., '1': ...} but directly to the object */
            const wpsInputListTMP = result['ProcessDescriptions'].ProcessDescription.DataInputs.Input;
            const wpsInputListKeys = Object.keys(wpsInputListTMP);
            const wpsInputList = (wpsInputListKeys.length > 0 && wpsInputListKeys[0] !== '0') ? { '0': wpsInputListTMP } : wpsInputListTMP;

            // console.log('input list: ', wpsInputList);
            for (let key in wpsInputList) {
              try {
                let item = wpsInputList[key];

                // console.log('intput item\n', item);

                let newInput = {};
                let itemTitle = item['Title'].value;
                let itemIdentifier = item['Identifier'].value;
                let itemAbstract = itemTitle; try { itemAbstract = item['Abstract'].value; } catch (e) {}
                let itemDataType = ''; try { itemDataType = item.LiteralData['DataType'].value; } catch (e) {}
                let itemDefaultValue; try { itemDefaultValue = item.LiteralData.DefaultValue.value; } catch (e) {}
                let itemAllowedValues; try { itemAllowedValues = item.LiteralData['AllowedValues']; } catch (e) {}

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
                newInput.selected = [ itemDefaultValue ];
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

    let compositeInputType = 'standard';
    if (inputList.filter(el => el.identifier === 'model' || el.identifier === 'experiment' || el.identifier === 'ensemble').length === 3) {
      compositeInputType = 'model_experiment_ensemble';
    }


    

    let formElements = inputList.map((el, index) => {
      if (el.type === 'string' && el.allowedValues.length > 0) {
        /* Standard drop down box */
        if (compositeInputType === 'model_experiment_ensemble' && el.identifier === 'model') {
          const numModels = this.state.processInputs.filter(el => el.identifier === 'model')[0].selected.length;
          const modelInput = el;
          const experimentInput = inputList.filter(el => el.identifier === 'experiment')[0];
          const ensembleInput = inputList.filter(el => el.identifier === 'ensemble')[0];
          return (
            <div key={'container' + el.title + index} className={'WPSDemoCopernicus_InputLabels'} >
              { this.state.processInputs.filter(el => el.identifier === 'model')[0].selected.map((selectedItem, selectedItemIndex) => {
                console.log(selectedItemIndex);
                return (
                  <label key={modelInput.title + '_' + index + '_' + selectedItemIndex}>
                    <span key='WPSDemoCopernicus_InputLabelsLabel' className={'WPSDemoCopernicus_InputLabelsLabel'}>
                      {modelInput.title + ' [' + selectedItemIndex + ']'}:
                    </span>
                    <select
                      key={'select_' + modelInput.identifier}
                      value={this.state.processInputs.filter(el => el.identifier === 'model')[0].selected[selectedItemIndex]}
                      onChange={this.onChange}
                      name={modelInput.identifier + ',' + selectedItemIndex}
                    >
                      {modelInput.allowedValues.map(av =>
                        <option
                          key={av}
                          value={av}
                        >
                          {av}
                        </option>
                      )}
                    </select>
                    <select
                      key={'select_' + experimentInput.identifier}
                      value={this.state.processInputs.filter(el => el.identifier === 'experiment')[0].selected[selectedItemIndex]}
                      onChange={this.onChange}
                      name={experimentInput.identifier + ',' + selectedItemIndex}
                    >
                      {experimentInput.allowedValues.map(av =>
                        <option
                          key={av}
                          value={av}
                        >
                          {av}
                        </option>
                      )}
                    </select>
                    <select
                      key={'select_' + ensembleInput.identifier}
                      value={this.state.processInputs.filter(el => el.identifier === 'ensemble')[0].selected[selectedItemIndex]}
                      onChange={this.onChange}
                      name={ensembleInput.identifier + ',' + selectedItemIndex}
                    >
                      {ensembleInput.allowedValues.map(av =>
                        <option
                          key={av}
                          value={av}
                        >
                          {av}
                        </option>
                      )}
                    </select>
                    { ((numModels - 1) === selectedItemIndex) && <button
                      onClick={() => {
                        this.setState(
                          produce(this.state, draft => {
                            draft.processInputs.filter(el => el.identifier === 'model')[0].selected.push(
                              draft.processInputs.filter(el => el.identifier === 'model')[0].allowedValues[0]);
                            draft.processInputs.filter(el => el.identifier === 'experiment')[0].selected.push(
                              draft.processInputs.filter(el => el.identifier === 'experiment')[0].allowedValues[0]);
                            draft.processInputs.filter(el => el.identifier === 'ensemble')[0].selected.push(
                              draft.processInputs.filter(el => el.identifier === 'ensemble')[0].allowedValues[0]);
                          }), () => {
                            this.setState({
                              showForm: true,
                              wpsFormElements: this.createForm()
                            });
                          }
                        );
                      }}>+
                    </button>
                    }
                  </label>
                );
              })
              }

            </div>
          );
        } if (compositeInputType === 'model_experiment_ensemble' && el.identifier === 'experiment') {
          return (<div key='no_experiment' />);
        } if (compositeInputType === 'model_experiment_ensemble' && el.identifier === 'ensemble') {
          return (<div key='no_ensemble' />);
        } else {
          return (
            <div key={'container' + el.title + index} className={'WPSDemoCopernicus_InputLabels'} >
              <label key={el.title + index}>
                <span className={'WPSDemoCopernicus_InputLabelsLabel'}>
                  {el.title}:
                </span>
                <select
                  value={this.state.processInputs[index].selected[0]}
                  onChange={this.onChange}
                  name={el.identifier}
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
      }

      if (el.type === 'string') {
        return (
          <div key={'container' + el.title + index} className={'WPSDemoCopernicus_InputLabels'} >
            <label key={el.default}>
              <span className={'WPSDemoCopernicus_InputLabelsLabel'}>
                {el.title}:
              </span>
              <input
                key={el.title + index}
                type='text'
                name={el.identifier}
                value={this.state.processInputs[index].selected[0]}
                onChange={this.onChange} />
            </label>
            <span className={'WPSDemoCopernicus_InputAbstract'}>
              {el.abstract}
            </span>
          </div>
        );
      }

      if (el.type === 'integer' || el.type === 'float') {
        return (
          <div key={'container' + el.title + index} className={'WPSDemoCopernicus_InputLabels'} >
            <label key={el.title + index}>
              <span className={'WPSDemoCopernicus_InputLabelsLabel'}>
                {el.title}:
              </span>
              <input
                key={index}
                name={el.title}
                type='number'
                size='6'
                width='6'
                value={this.state.processInputs[index].selected[0]}
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
    });

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
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name.split(',')[0];
    let itemIndex = 0;
    if (target.name.split(',').length === 2) itemIndex = parseInt(target.name.split(',')[1]);

    // update state
    this.setState(
      produce(this.state, draft => {
        let stateItemIndex = this.state.processInputs.findIndex(e => e.identifier === name);
        draft.processInputs[stateItemIndex].selected[itemIndex] = value;
      }), () => {
        this.setState({
          showForm: true,
          wpsFormElements: this.createForm()
        }, () => {
          console.log(this.state);
        });
      }
    );
  }

  getInfoFromLocation (newLocation) {
    const { hash, pathname } = newLocation;
    let location = hash && hash.length > 0 ? hash : pathname;
    const hashParts = location.split('/');
    if (hashParts.length === 3 || hashParts.length === 4) {
      const wpsName = hashParts[hashParts.length - 1];
      const computeNode = hashParts.length === 4 ? hashParts[2] : null;
      return { wpsName: wpsName, computeNode: computeNode || 'copernicus-wps' };
    }
    return { wpsName: null, computeNode: 'copernicus-wps' };
  }

  handleLocationChange (newLocation) {
    console.log('handleLocationChange');
    return new Promise((resolve, reject) => {
      const { wpsName, computeNode } = this.getInfoFromLocation(newLocation);
      console.log('setting compute node to ' + computeNode);
      return this.setComputeNode(computeNode).then(() => {
        console.log('compute node done, now setting wps name to ' + wpsName);
        return this.onWpsButtonClick(wpsName).then((e) => { console.log(e); }).catch((e) => { console.warn(e); }).then().catch();
      }).catch((e) => {
        console.warn(e);
        resolve();
      });
    });
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

  toggleComputeNodeSelectorDropDown () {
    this.setState(prevState => ({
      computeNodeSelectorDropDownOpen: !prevState.computeNodeSelectorDropDownOpen
    }));
  }

  getProcessInfo () {
    let processInfo = null;
    if (this.state.selectedProcess && this.state.wpsProcessName && this.state.wpsProcessName.length) {
      let i = this.state.wpsProcessName.findIndex(p => p.name === this.state.selectedProcess);
      if (i !== -1) {
        processInfo = this.state.wpsProcessName[i];
      }
    }
    return processInfo;
  }

  setComputeNode (name) {
    return new Promise((resolve, reject) => {
      if (name === null) { reject(new Error('Unable to set compute node')); return; }
      console.log('Setting compute node name to [' + name + ']');
      return this.setStatePromise({
        selectedProcess: null,
        currentWPSNodeName: name,
        wpsInfoFetched: false,
        wpsProcessName: []
      }).then(() => {
        console.log('start fetchProcesses via setCComputeNode');
        return this.fetchProcesses();
      });
    });
  }

  renderCompute () {
    const { compute, runningProcesses, actions, dispatch } = this.props;
    const { showForm, isBusy, isBusyMessage, wpsInfoFetched } = this.state;
    const { errorExists, errorContent, formNoInputFound } = this.state;
    const { wpsFormElements } = this.state;
    // console.log(this.state);
    if (!compute) {
      return (<div style={{ margin:'20px' }}><Alert color='info'>You need to sign in to use this functionality</Alert></div>);
    }
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
            ? (<div style={{ margin:'20px' }}>
              <Alert color='warning'>
                Sorry, I could not fetch WPS Process info. Maybe the server is too busy? [{this.state.isBusyMessage}]
              </Alert>
              <Button color='primary' onClick={() => {
                clearWPSCache();
                this.setState({ currentWPSNodeName: 'copernicus-wps' }, () => { this.fetchProcesses(); });
              }} ><Icon name='refresh' />&nbsp;Try again</Button>
            </div>)
            : ''}
        </div>
      );
    } else {
      let processInfo = this.getProcessInfo();
      return (
        <div style={{ backgroundColor: '#FFF', width: '100%', fontFamily: 'Roboto', padding:'0 20px' }}>
          <Row>
            <Col sm='12'>
              {compute
                ? <div>
                  <Row>
                    <Col xs='auto' ><Label style={{ lineHeight: '40px' }}>Diagnostic: </Label></Col>
                    <Col xs='auto' >
                      <Dropdown isOpen={this.state.wpsSelectorDropDownOpen} toggle={this.toggleWPSSelectorDropDown}>
                        <DropdownToggle caret>
                          {(processInfo && (processInfo.title)) || this.state.selectedProcess}
                        </DropdownToggle>
                        <DropdownMenu
                          modifiers={{
                            setMaxHeight: {
                              enabled: true,
                              order: 890,
                              fn: (data) => {
                                return {
                                  ...data,
                                  styles: {
                                    ...data.styles,
                                    overflow: 'auto',
                                    maxHeight: '50vh'
                                  }
                                };
                              }
                            }
                          }}
                        >
                          <DropdownItem header>Please select one of the processes</DropdownItem>
                          {
                            this.state.wpsProcessName.map((wp, index) => {
                              return <DropdownItem
                                active={(processInfo && processInfo.name) === (wp && wp.name)}
                                key={index}
                                color='primary'
                                onClick={() => {
                                  clearWPSCache();
                                  this.onWpsButtonClick(wp.name).then().catch();
                                }}>{wp.title}
                              </DropdownItem>;
                            })
                          }
                        </DropdownMenu>
                      </Dropdown>
                    </Col>
                    <Col xs='auto' ><Label style={{ lineHeight: '40px' }}> on WPS server</Label></Col>
                    <Col xs='auto' >
                      <Dropdown isOpen={this.state.computeNodeSelectorDropDownOpen} toggle={this.toggleComputeNodeSelectorDropDown}>
                        <DropdownToggle caret>
                          {this.state.currentWPSNodeName}
                        </DropdownToggle>
                        <DropdownMenu
                          modifiers={{
                            setMaxHeight: {
                              enabled: true,
                              order: 890,
                              fn: (data) => {
                                return {
                                  ...data,
                                  styles: {
                                    ...data.styles,
                                    overflow: 'auto',
                                    maxHeight: '50vh'
                                  }
                                };
                              }
                            }
                          }}
                        >
                          <DropdownItem header>Please select one of the compute nodes</DropdownItem>
                          {
                            compute.map((wp, index) => {
                              return <DropdownItem active={this.state.currentWPSNodeName === wp.name} key={index} color='primary' onClick={() => {
                                clearWPSCache();
                                this.setComputeNode(wp.name);
                              }}>{wp.name}</DropdownItem>;
                            })
                          }
                        </DropdownMenu>
                      </Dropdown>
                    </Col>
                    <Col xs='auto'>
                      <Label className='WPSDemoCopernicus_Small' style={{ lineHeight: '40px' }}>WPS server URL { this.getWPSUrlByName(this.state.currentWPSNodeName) }</Label>
                    </Col>
                  </Row>
                  {errorExists
                    ? <UncontrolledAlert color='danger' style={{ textAlign: 'initial' }}>
                      {errorContent}
                    </UncontrolledAlert>
                    : (showForm && processInfo)
                      ? <Card>

                        {formNoInputFound
                          ? <Alert color='info'>
                          No settings were found for the selected process.
                          </Alert>
                          : '' }
                        <CardBody className='ProcessSettings_CardBody'>
                          <CardTitle>{processInfo.title}</CardTitle>
                          <span className={'WPSDemoCopernicus_ProcessAbstract'}>{processInfo.abstract}</span>
                          <hr />
                          <div>
                            <CardTitle>
                              Documentation
                            </CardTitle>
                            <span className={'WPSDemoCopernicus_ProcessAbstract'} style={{ width: '100%' }}>
                              <ul>
                                { this.state.documentationLink && (
                                  this.state.documentationLink.map((item, key) => {
                                    return (
                                      <li key={key}>{item.title} - <a href={item.href} target='_blank'>{item.href}</a></li>
                                    );
                                  })
                                )}
                                <li>Describe process - <a href={this.state.describeProcessLink} target='_blank'>{this.state.describeProcessLink}</a></li>
                              </ul>
                            </span>
                            <hr />
                          </div>
                          <CardTitle>
                            Settings
                          </CardTitle>
                          {wpsFormElements}
                          <br />
                          <hr />
                          <Button key={'submitButton'} color='primary' onClick={() => { this.formSubmit(); }}>Start calculation</Button>
                        </CardBody>
                      </Card> : ''
                  }
                </div>
                : <div>No compute nodes found, maybe you need to sign in?</div>}
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

  render () {
    return (<div style={{ width:'100%' }} className='MainViewport' >
      <div style={{ width:'50vw', margin:'15px 0 0 15px' }}>
        <MarkdownFromFile url={'/contents/Calculate.md'} />
      </div>
      { this.renderCompute() }
    </div>);
  }
}

WPSDemoCopernicus.propTypes = {
  compute: PropTypes.array,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  nrOfStartedProcesses: PropTypes.number,
  runningProcesses: PropTypes.object.isRequired,
  location: PropTypes.object,
  router: PropTypes.object
};

export default withRouter(WPSDemoCopernicus);
