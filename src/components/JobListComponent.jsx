import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '../getConfig';

import JsonTable from 'ts-react-json-table';
import ScrollArea from 'react-scrollbar';
import { Button } from 'reactstrap';
import Moment from 'react-moment';
let config = getConfig();

export default class JobListComponent extends Component {
  constructor (props) {
    super(props);
    this.state = {
      cursor: null
    };
    this.pollingActive = false;
    this.onClickRow = this.onClickRow.bind(this);
    this.pollJobList = this.pollJobList.bind(this);
  }
  /* Sleep function. */
  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  fetchJobListItems () {
    const { accessToken, dispatch, actions } = this.props;
    if (!accessToken) {
      return;
    }

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

  /**
   * Setting the state when clicking a row in the table.
   */
  onClickRow (e, item) {
    this.setState({ cursor: item });
  }

  deleteJobListItem () {
    if (!this.state.cursor) return;
    const { accessToken } = this.props;
    fetch(this.props.backend + '/joblist/remove?&job=' + this.state.cursor.id, { credentials: 'include' })
      .then((result) => {
        if (result.ok) {
          return result.json();
        } else {
          return null;
        }
      })
      .then((json) => {
        console.log(json.message);
        this.fetchJobListItems();
      });
  }

  pollJobList () {
    if (!this.pollingActive) return;
    this.fetchJobListItems();
    this.sleep(2000).then(this.pollJobList);
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
    const jobs = this.props.jobs;

    /* We cannot display object inside a JSON,
     * so delete it. */
    jobs.forEach(function (object) {
      if (!object) return;
      delete object.wpspostdata;
    });

    /* Columns for the JsonTable. */
    const columns = [
      { key: 'id', label: 'Job ID' },
      { key: 'processid', label: 'Process' },
      { key: 'creationtime',
        label: 'Status date',
        cell: function (item, columnKey) {
          return <Moment format='MMMM Do YYYY, HH:mm:ss' >{item.creationtime}</Moment>;
        } },
      { key: 'percentage', label: '%' },
      { key: 'statuslocation',
        label: 'Location URL',
        cell: function (item, columnKey) {
          return <a target='_blank' href={item.statuslocation}>Result</a>;
        } },
      { key: 'wpsstatus', label: 'Status' }
    ];

    /* Settings for the JsonTable. */
    let _this = this;
    const settings = {
      keyField: 'id',
      noRowsMessage: 'There are no jobs.',
      rowClass: function (current, item) {
        const cursor = _this.state.cursor;
        if (!cursor) return current;
        if (cursor.id === item.id) {
          return current + ' selectedRowJobList';
        }
        return current;
      }
    };

    return (
      <div className='MainViewport'>
        <ScrollArea speed={1} horizontal className='jobListScrollComponent' >
          { <JsonTable
            rows={jobs}
            className='joblistTable'
            columns={columns}
            onClickRow={this.onClickRow}
            settings={settings}
          /> }
        </ScrollArea>
        <hr />
        <Button disabled={!this.state.cursor} onClick={() => this.deleteJobListItem()}>Delete</Button>
      </div>
    );
  }
}

JobListComponent.propTypes = {
  accessToken: PropTypes.string,
  backend: PropTypes.string,
  jobs: PropTypes.Array,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
};
