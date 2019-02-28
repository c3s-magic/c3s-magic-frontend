import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from './getConfig';

import FileColumnDescriptionComponent from './FileColumnDescriptionComponent';
import FileStructureDescriptionComponent from './FileStructureDescriptionComponent';
import PreviewComponent from './PreviewComponent';
import FileUploadComponent from './FileUploadComponent';
let config = getConfig();

export default class UploadComponent extends Component {
  componentWillUnmount () {
    this.props.dispatch(this.props.actions.clearUploadState());
  }

  replacer (name, val) {
    // Convert integers to integers.
    if (parseInt(val)) {
      return parseInt(val);
    }
    // Convert to special caracters.
    if (val === 'tab') {
      return '\t';
    }
    if (val === 'CR') {
      return '\r';
    }
    if (val === 'LF') {
      return '\n';
    }
    if (val === 'CRLF') {
      return '\r\n';
    }

    // Return the value as is.
    return val;
  }

  render () {
    return (
      <div className='MainViewport'>
        <FileUploadComponent accessToken={this.props.accessToken}
          dispatch={this.props.dispatch} actions={this.props.actions} />
        <div className='divider-2' />
        { this.props.fileName &&
        <FileStructureDescriptionComponent accessToken={this.props.accessToken}
          dispatch={this.props.dispatch}
          actions={this.props.actions}
          fileName={this.props.fileName}
          fileStructureDescription={this.props.fileStructureDescription}
          replacer={this.replacer} />
        }

        <div className='divider-2' />
        {this.props.fileName && this.props.uploadedFileStructureDescription &&
        <div>
          <h3>CSV Preview (5 rows)</h3>
          <PreviewComponent
            file={config.adagucServicesHost + '/opendap/' + this.props.accessToken + '/' + this.props.clientId.replace('/', '.') + '/' + this.props.fileName}
            tableClassName='previewTable'
            componentClassName='previewComponentUpload'
            numberOfLinesDisplayed={5} />
        </div>
        }

        <div className='divider-2' />
        { this.props.fileName && this.props.uploadedFileStructureDescription &&
        <FileColumnDescriptionComponent accessToken={this.props.accessToken}
          dispatch={this.props.dispatch}
          actions={this.props.wpsActions}
          uploadActions={this.props.actions}
          fileName={this.props.fileName}
          fileColumnDescription={this.props.fileColumnDescription}
          fileStructureDescription={this.props.fileStructureDescription}
          replacer={this.replacer}
          backend={this.props.backend}
          nrOfStartedProcesses={this.props.nrOfStartedProcesses}
          runningProcesses={this.props.runningProcesses}
          uploadScanProcess={this.props.uploadScanProcess} />
        }
      </div>
    );
  }
}

UploadComponent.propTypes = {
  fileName: PropTypes.string,
  uploadedFileStructureDescription: PropTypes.bool,
  accessToken: PropTypes.string,
  fileColumnDescription: PropTypes.object,
  fileStructureDescription: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  wpsActions: PropTypes.object,
  actions: PropTypes.object.isRequired,
  backend: PropTypes.string,
  nrOfStartedProcesses: PropTypes.number,
  runningProcesses: PropTypes.number,
  uploadScanProcess: PropTypes.string

};
