
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import ReactJson from 'react-json-view';
export default class JSONViewer extends Component {
  constructor (props) {
    super(props);
    this.state = {
      url: props.url,
      data: null
    };
  }

  componentDidMount () {
    axios({
      method: 'get',
      url: this.state.url,
      withCredentials: true
    }).then(src => {
      this.setState({ data: src.data });
    }).catch((e) => {
      console.error(e);
    });
  }

  render () {
    return (<div className='wpsOutputComponentContainer'>
      { this.state.data && <ReactJson style={{ fontSize:'10px', lineHeight:'12px' }} src={this.state.data} /> }
    </div>);
  }
}

JSONViewer.propTypes = {
  url: PropTypes.string
};
