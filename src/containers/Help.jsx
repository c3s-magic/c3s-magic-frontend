
import React, { Component } from 'react';
import MarkdownFromFile from './MarkdownFromFile';

import { Row } from 'reactstrap';

export default class Help extends Component {
  render () {
    return (
      <div className='MainViewport'>
        <Row>

          <div className='text'>
            <MarkdownFromFile url={'/contents/Help.md'} />
          </div>
        </Row>
      </div>);
  }
}
