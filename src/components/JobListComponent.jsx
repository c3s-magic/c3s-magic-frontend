import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import Icon from 'react-fa';
import RenderProcessOutputs from './RenderProcessOutputs';
import { cloneDeep } from 'lodash';

const getKeys = function (obj) {
  if (!Object.keys) {
    let keys = [];
    let k;
    for (k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        keys.push(k);
      }
    }
    return keys;
  } else {
    return Object.keys(obj);
  }
};

var _stripNS = function (newObj, obj) {
  var keys = getKeys(obj);

  for (var j = 0; j < keys.length; j++) {
    var key = keys[j];
    var i = key.indexOf(':');
    var newkey = key.substring(i + 1);
    var value = obj[key];
    if (typeof value === 'object') {
      newObj[newkey] = {};
      _stripNS(newObj[newkey], value);
    } else {
      newObj[newkey] = value;
    }
  }
};

export const stripNS = function (currentObj) {
  var newObj = {};
  _stripNS(newObj, currentObj);
  return newObj;
};

export default class JobListComponent extends Component {
  constructor (props) {
    super(props);
    this.pollingActive = false;
    this.pollJobList = this.pollJobList.bind(this);
    this.deleteJobListItem = this.deleteJobListItem.bind(this);
    this.showJob = this.showJob.bind(this);
  }

  fetchJobListItems () {
    const { dispatch, actions, backend } = this.props;
    if (!backend) return;
    fetch(this.props.backend + '/joblist/list?', { credentials: 'include' })
      .then((result) => {
        if (result.ok) {
          return result.json();
        } else {
          return null;
        }
      })
      .then((json) => {
        dispatch(actions.updateJobListItems(json));
      });
  }

  showJob (job) {
    console.log('Showjob for ', job);
    const { actions, dispatch } = this.props;
    dispatch(actions.showWindow(
      {
        component:(<div width={'100%'} height={'300px'} >
          <RenderProcessOutputs dispatch={dispatch} actions={actions} process={{
            result: stripNS(job.output),
            id: 0,
            message: job.status,
            percentageComplete: job.percentage,
            collapsed: false
          }} />
        </div>),
        title: job.id
      })
    );
  }

  deleteJobListItem (job) {
    fetch(this.props.backend + '/joblist/remove?&job=' + job.id, { credentials: 'include' })
      .then((result) => {
        if (result.ok) {
          return result.json();
        } else {
          return null;
        }
      })
      .then((json) => {
        this.fetchJobListItems();
      });
  }

  pollJobList () {
    if (!this.pollingActive || this.isPolling === true) return;
    this.fetchJobListItems();
    this.isPolling = true;
    setTimeout(() => {
      this.isPolling = false;
      this.pollJobList();
    }, 2000);
  }

  componentDidMount () {
    this.pollingActive = true;
    this.pollJobList();
  }

  componentWillUnmount () {
    this.pollingActive = false;
  }

  render () {
    if (!this.props.jobs) return null;
    const _jobs = this.props.jobs;
    let jobs = cloneDeep(_jobs);
    jobs.sort((a, b) => {
      if (a.creationtime < b.creationtime) return 1;
      if (a.creationtime > b.creationtime) return -1;
      if (a.creationtime === b.creationtime) return 0;
    });
    return (
      <div className='MainViewport'>
        <table className='JobListComponent_Table'>
          <thead>
            <tr>
              <th>Process identifier</th><th>Creation time</th><th>Percentage complete</th><th>Message</th><th>State</th><th>Show</th><th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {
              jobs.map((job, i) => {
                let stateClassName = 'JobListComponent_Pending';
                if (job.wpsstatus === 'PROCESSSUCCEEDED') stateClassName = 'JobListComponent_PROCESSSUCCEEDED';
                if (job.wpsstatus === 'PROCESSACCEPTED') stateClassName = 'JobListComponent_PROCESSACCEPTED';
                if (job.wpsstatus === 'PROCESSSTARTED') stateClassName = 'JobListComponent_PROCESSSTARTED';
                if (job.wpsstatus === 'PROCESSFAILED') stateClassName = 'JobListComponent_PROCESSFAILED';

                return (<tr key={i}><td>{job.processid}</td><td>{job.creationtime}</td><td>{job.percentage} %</td><td>{job.status}</td><td className={stateClassName} >{job.wpsstatus}</td>
                  <td>
                    <Button disabled={job.wpsstatus !== 'PROCESSSUCCEEDED'} onClick={() => { this.showJob(job); }}>
                      <Icon name='info' />
                    </Button>
                  </td>
                  <td>
                    <Button onClick={() => { this.deleteJobListItem(job); }}>
                      <Icon name='trash' />
                    </Button>
                  </td>
                </tr>);
              })
            }
          </tbody>
        </table>
      </div>
    );
  }
}

JobListComponent.propTypes = {
  backend: PropTypes.string,
  jobs: PropTypes.any,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
};
