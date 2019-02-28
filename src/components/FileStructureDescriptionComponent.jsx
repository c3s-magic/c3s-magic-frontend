import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '../getConfig';

import { Control, Form } from 'react-redux-form';
import { Button } from 'reactstrap';
let config = getConfig();

export default class FileStructureDescriptionComponent extends Component {
  handleSubmit () {
    const { dispatch, actions } = this.props;

    var fileName = this.props.fileName.replace(/\.[^/.]+$/, '_descr.json');

    var formData = new FormData();
    formData.append('files', new Blob([JSON.stringify(this.props.fileStructureDescription, this.props.replacer)], { type:'' }), fileName);

    fetch(config.adagucServicesHost + '/basket/upload?key=' + this.props.accessToken,
      {
        credentials:'include',
        method: 'POST',
        body: formData
      })
      .then(function (result) {
        // TODO: Foutafhandeling
        console.log(result);
        dispatch(actions.setUploadedFileStructureDescription());
      });
  }

  render () {
    return (
      <div>
        <div className='alert alert-info col-6'>
          Please specify the structure of the CSV file.
        </div>
        <div>
          <Form model='fileStructureDescription'
            onSubmit={() => this.handleSubmit()}>

            <h5 className='media-heading'>File structure information:</h5>

            <div className='form-group row'>
              <label className='col-3 col-form-label required'>Column separator:</label>
              <Control.select
                className='form-control col-3'
                model='fileStructureDescription.columnSeparator'
                required
                defaultValue={this.props.fileStructureDescription.columnSeparator}
              >
                <option value=','>comma (,)</option>
                <option value=';'>semicolon (;)</option>
                <option value='tab'>tab (\t)</option>
              </Control.select>
            </div>

            <div className='form-group row'>
              <label className='col-3 col-form-label required'>Row separator:</label>
              <Control.select
                className='form-control col-3'
                model='fileStructureDescription.rowSeparator'
                required
                defaultValue={this.props.fileStructureDescription.rowSeparator}
              >
                <option value='LF'>Line feed (\n)</option>
                <option value='CR'>Carriage return (\r)</option>
                <option value='CRLF'>Carriage return line feed (\r\n)</option>
              </Control.select>
            </div>

            <div className='form-group row'>
              <label className='col-3 col-form-label required'>First data row:</label>
              <Control
                className='form-control col-3 required'
                type='number'
                model='fileStructureDescription.firstDataRow'
                required
                min={0}
                value={this.props.fileStructureDescription.firstDataRow}
              />
            </div>

            <div className='form-group row'>
              <label className='col-3 col-form-label'>Column name row:</label>
              <Control
                className='form-control col-3'
                type='number'
                model='fileStructureDescription.rowWithFieldNames'
                min={0}
                value={this.props.fileStructureDescription.rowWithFieldNames}
              />
              <small className='text-muted form-text col-6'>(optional if you want to see the column names in the
                preview)
              </small>
            </div>

            <div className='divider-2' />

            <Button type='submit' color='primary'>
              Submit description
            </Button>
          </Form>
        </div>
      </div>
    );
  }
}

FileStructureDescriptionComponent.propTypes = {
  fileColumnDescription: PropTypes.object,
  fileName: PropTypes.string,
  accessToken: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  fileStructureDescription: PropTypes.object,
  replacer: PropTypes.func
};
