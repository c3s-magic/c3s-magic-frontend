
import React, { Component } from 'react';
import MarkdownFromFile from './MarkdownFromFile';

import { Row, Col } from 'reactstrap';

export default class Help extends Component {
  render () {
    return (
      <div className='MainViewport'>
        <Row>
          <Col xs='2' />
          <Col xs='8'>
            <MarkdownFromFile url={'/contents/Help.md'} />
          </Col>
          <Col xs='2' />
        </Row>
      </div>);
  }
}
