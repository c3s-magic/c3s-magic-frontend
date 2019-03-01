import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '../getConfig';

import { Control, Form } from 'react-redux-form';
import { withRouter } from 'react-router';
import { Button, Input, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Row, Col, Progress, Card } from 'reactstrap';
let config = getConfig();

class RenderProcesses extends Component {
  renderProcess (process) {
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
          <Col>{value}</Col>
        </Row>
      </Card>
    );
  }

  iterProcesses (runningProcesses) {
    let result = [];
    for (var process in runningProcesses) {
      if (runningProcesses[process].identifier === 'scanCSVProcess') {
        result.push(Object.assign({}, this.renderProcess(runningProcesses[process]), { key: process }));
      }
    };
    return result;
  }
  render () {
    const { runningProcesses } = this.props;
    return (<span>{this.iterProcesses(runningProcesses)}</span>);
  }
};

class FileColumnDescriptionComponent extends Component {
  handleSubmit () {
    var completeFileDescription = JSON.stringify(Object.assign({}, this.props.fileColumnDescription, this.props.fileStructureDescription), this.props.replacer);
    var originalFileName = this.props.fileName;
    var fileName = originalFileName.replace(/\.[^/.]+$/, '_descr.json');
    const { accessToken, dispatch, actions, uploadActions, nrOfStartedProcesses, router, backend } = this.props;

    var formData = new FormData();
    formData.append('files', new Blob([completeFileDescription], { type:'' }), fileName);

    fetch(config.adagucServicesHost + '/basket/upload?key=' + this.props.accessToken,
      {
        credentials: 'include',
        method: 'POST',
        body: formData
      })
      .then(function (result) {
        console.log(result.body);

        // TODO: Foutafhandeling

        // Start the scan process
        var scanProcess = originalFileName + '_scanProcess_' + new Date().toString();
        dispatch(uploadActions.setUploadScanProcess(scanProcess));

        dispatch(actions.startWPSExecute(backend, accessToken, 'scanCSVProcess',
          '[inputCSVPath=' + originalFileName + ';descCSVPath=' + fileName + ';]',
          scanProcess));
      });
  }

  goToWrangler () {
    const { dispatch, actions } = this.props;

    dispatch(actions.setCSVFileToWrangle({ fileName: this.props.fileName }));
    this.props.router.push('/wrangler');
  }

  render () {
    return (
      <div>
        <div className='alert alert-info col-6'>
          Please specify the CSV columns with location and time information and their formats.
        </div>
        <div>
          <Form model='fileColumnDescription'
            onSubmit={() => this.handleSubmit()}>

            <h5 className='media-heading'>Location information:</h5>

            <div className='form-group row'>
              <label className='col-3 col-form-label required'>X column:</label>
              <Control
                className='form-control col-3'
                type='number'
                model='fileColumnDescription.columnX'
                required
                min={0}
                value={this.props.fileColumnDescription.columnX}
              />
            </div>

            <div className='form-group row'>
              <label className='col-3 col-form-label required'>Y column:</label>
              <Control
                className='form-control col-3 required'
                type='number'
                model='fileColumnDescription.columnY'
                required
                min={0}
                value={this.props.fileColumnDescription.columnY}
              />
            </div>

            <div className='form-group row'>
              <label className='col-3 col-form-label required'>Projection:</label>
              <Control.select model='fileColumnDescription.projString'
                className='form-control col-3 required'
                required
                defaultValue={this.props.fileColumnDescription.projString}>
                <option
                  value='+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs'>
                  Rijksdriehoek
                </option>
                <option value='+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'>WGS 84</option>
              </Control.select>

            </div>

            <div className='divider-2' />

            <h5>Time information:</h5>

            <div className='form-group row'>
              <label className='col-3 col-form-label required'>
                Timezone:
              </label>
              <Control.select
                model='fileColumnDescription.timeZone'
                className='form-control col-3'
                required>
                defaultValue={this.props.fileColumnDescription.timeZone}
                <option value='CET'>CET</option>
                <option value='UTC'>UTC</option>
              </Control.select>
            </div>

            <div className='form-group row'>
              <label className='col-3 col-form-label required'>Date column:</label>
              <Control
                className='form-control col-3'
                type='number'
                model='fileColumnDescription.columnDate'
                required
                min={0}
                value={this.props.fileColumnDescription.columnDate}
              />
            </div>

            <div className='form-group row'>
              <label className='col-3 col-form-label required'>
                Date format:
              </label>
              <Control.select
                className='form-control col-3'
                model='fileColumnDescription.dateFormat'
                required
                defaultValue={this.props.fileColumnDescription.dateFormat} >
                <option value='%d%b%y'>03JAN06</option>
                <option value='%Y-%m-%dT%H:%M:%S'>2007-03-04T21:08:12</option>
                <option value='%d-%m-%Y'>03-01-2016</option>
                <option value='%d-%m-%Y %H:%M:%S'>03-01-2016 21:03:00</option>
                <option value='%Y/%m/%d'>2016/01/03</option>
              </Control.select>
              <small className='text-muted form-text col-6'>(it is also possible to provide time information in this
                column)
              </small>
            </div>

            <div className='form-group row'>
              <label className='col-3 col-form-label'>Time/hour column:</label>
              <Control
                className='form-control col-3'
                type='number'
                model='fileColumnDescription.columnHour'
                min={0}
                value={this.props.fileColumnDescription.columnHour}
              />
              <small className='text-muted form-text col-6'>(optional if the time is provided in a separate column)
              </small>
            </div>

            <div className='form-group row'>
              <label className='col-3 col-form-label'>Time/hour format:</label>
              <Control.select
                model='fileColumnDescription.hourFormat'
                className='form-control col-3'
                defaultValue={this.props.fileColumnDescription.hourFormat}>
                <option value='hourInterval'>Interval (1.00-01.59)</option>
                <option value='' />
                <option value='timeMinutes'>Time (13:45)</option>
                <option value='timeMinutesSeconds'>Time (13:45:00)</option>
                <option value='plainHour'>Hour (13)</option>
              </Control.select>
            </div>

            <div className='form-group row'>
              <label className='col-3 col-form-label'>Minute column:</label>
              <Control
                type='number'
                model='fileColumnDescription.columnMinute'
                className='form-control col-3'
                min={0}
                value={this.props.fileColumnDescription.columnMinute}
              />
              <small className='text-muted form-text col-6'>(optional if minutes are provided in a separate column)
              </small>
            </div>

            <div className='divider-2' />

            <Button type='submit' color='primary'>
              Scan file
            </Button>
          </Form>

          <div className='divider-2' />

          <RenderProcesses runningProcesses={this.props.runningProcesses} />

          <div className='divider-2' />

          { this.props.runningProcesses[this.props.uploadScanProcess] &&
              this.props.runningProcesses[this.props.uploadScanProcess].isComplete &&
              !this.props.runningProcesses[this.props.uploadScanProcess].hasFailed &&
              <Button color='primary' onClick={() => this.goToWrangler()}>Wrangle!</Button>
          }

        </div>
      </div>
    );
  }
}

FileColumnDescriptionComponent.propTypes = {
  fileColumnDescription: PropTypes.object,
  fileName: PropTypes.string,
  accessToken: PropTypes.string,
  fileStructureDescription: PropTypes.object,
  replacer: PropTypes.func,
  router: PropTypes.object,
  actions: PropTypes.object,
  dispatch: PropTypes.func,
  runningProcesses: PropTypes.object
};

export default withRouter(FileColumnDescriptionComponent);
