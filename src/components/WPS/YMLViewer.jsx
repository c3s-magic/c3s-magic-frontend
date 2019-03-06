
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import ReactJson from 'react-json-view';
const YAML = require('yamljs');
export default class YMLViewer extends Component {
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
      this.setState({ data: (YAML.parse(src.data)) });
    }).catch((e) => {
      console.error(e);
    });
  }

  render () {
    return (<div className='wpsOutputComponentContainer'>
      <ReactJson style={{ fontSize:'10px', lineHeight:'12px' }} src={this.state.data} />
    </div>);
  }
}

YMLViewer.propTypes = {
  url: PropTypes.string
};
