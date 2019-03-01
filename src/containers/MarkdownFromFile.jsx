
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';

export default class MarkdownFromFile extends Component {
  constructor () {
    super();
    this.state = {
      text:''
    };
  }
  componentWillMount () {
    fetch(this.props.url)
      .then((response) => { return response.text(); })
      .then((result) => { this.setState({ text: result }); return result; });
  }

  render () {
    return (
      <ReactMarkdown
        source={this.state.text}
        escapeHtml={false}
      />
    );
  }
}
MarkdownFromFile.propTypes = {
  url: PropTypes.string
};
