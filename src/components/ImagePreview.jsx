
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ImagePreview extends Component {
  constructor (props) {
    super(props);
    this.state = {
      imagedata: props.imagedata
    };
  }

  render () {
    const { closeCallback } = this.props;
    return (<div>
      <img
        style={{ border: '1px solid #000', maxWidth:'480px', maxHeight:'480px' }}
        src={this.state.imagedata}
      />
    </div>);
  }
}

ImagePreview.propTypes = {
  imagedata: PropTypes.string,
  closeCallback: PropTypes.func
};
