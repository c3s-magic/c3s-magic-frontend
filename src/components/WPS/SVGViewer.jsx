import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import InlineSVG from 'svg-inline-react';
export default class SVGViewer extends Component {
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
      axios({
        method: 'get',
        url: this.state.url
      }).then(src => {
        this.setState({ data: src.data });
      }).catch((e) => {
        console.error(e);
      })
    })
  }

  render () {
    const { closeCallback } = this.props;
    if (this.state.data === null) {
      return (<div className='wpsOutputComponentContainer'>loading</div>);
    }

    return (<div style={{ width:'100%', height:'350px', display:'block', overflow:'scroll' }}>
      <InlineSVG src={this.state.data} />
    </div>);
  }
}

SVGViewer.propTypes = {
  url: PropTypes.string,
  closeCallback: PropTypes.func
};
