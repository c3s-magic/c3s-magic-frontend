import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RechartsComponent from '../../components/RechartsComponent';

class DiagnosticsChart extends Component {
  componentWillMount () {
  }

  componentDidMount () {
  }

  render () {
    return (
      <RechartsComponent dapurl={this.props.data} type={'scatter_1'} />
    );
  }
}

export {
  DiagnosticsChart
}
