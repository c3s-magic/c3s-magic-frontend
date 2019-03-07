
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
export default class TXTViewer extends Component {
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
      <textarea
        style={{ fontSize:'10px', lineHeight:'12px', width: '100%', height:'400px', border:'none', resize:'none', overflowY:'scroll', outline:'none' }}
        readOnly value={this.state.data || ''}
      />
    </div>);
  }
}

TXTViewer.propTypes = {
  url: PropTypes.string
};
