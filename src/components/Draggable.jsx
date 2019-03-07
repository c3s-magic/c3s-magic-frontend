import React, { Component } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import ReactDOM from 'react-dom';
import { Button, Row, Col } from 'reactstrap';
import Icon from 'react-fa';
import DOM from 'react-dom-factories';

export default class Draggable extends Component {
  constructor (props) {
    super(props);
    this.state = {
      pos: {
        x: this.props.initialPos.x,
        y: this.props.initialPos.y
      },
      size: {
        w: this.props.initialSize.w,
        h: this.props.initialSize.h
      },
      dragging: false,
      resizing: false,
      rel: null, // position relative to the cursor,
      cursor: 'default',
      zIndex: this.props.zIndex
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  };

  // we could get away with not having this (and just having the listeners on
  // our div), but then the experience would be possibly be janky. If there's
  // anything w/ a higher z-index that gets in the way, then you're toast,
  // etc.
  componentDidUpdate (props, state) {
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
    if (this.state.resizing && !state.resizing) {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    } else if (!this.state.resizing && state.resizing) {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
    // console.log('componentDidUpdate', props);
  }

  componentWillUpdate (props) {
    // console.log(props);
    if (props.zIndex !== this.state.zIndex) this.setState({ zIndex:props.zIndex });
    // if (props.initialPos && this.state.pos) {
    //   console.log('setX', props.initialPos.x);
    //   if (props.initialPos.x !== this.state.pos.x) this.setState({ pos: { x: props.initialPos.x } });
    // }
  }

  componentWillUnMount () {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  // calculate relative position to the mouse and set dragging=true
  onMouseDown (e) {
    // only left mouse button
    if (e.button !== 0) return;
    var pos = $(ReactDOM.findDOMNode(this)).offset();

    let x = e.pageX - pos.left;
    let y = e.pageY - pos.top;

    if (this.divRef.clientWidth - x < 25 && this.divRef.clientHeight - y < 25) {
      this.setState({
        resizing: true,
        cursor: 'move',
        rel: {
          x: e.pageX,
          y: e.pageY,
          width: this.divRef.clientWidth,
          height: this.divRef.clientHeight
        }
      });
    } else if (y < 35) {
      this.setState({
        dragging: true,
        cursor: 'move',
        rel: {
          x: x,
          y: y
        }
      });
    }
    this.props.updateCallback({
      x: this.state.pos.x,
      y: this.state.pos.y,
      w: this.state.size.w,
      h: this.state.size.h,
      zIndex: this.state.zIndex
    });
    e.stopPropagation();
    e.preventDefault();
  }
  onMouseUp (e) {
    if (this.state.resizing) {
      window.dispatchEvent(new Event('resize'));
    }
    this.setState({ dragging: false, resizing: false, cursor: 'default' });
    this.props.updateCallback({
      x: this.state.pos.x,
      y: this.state.pos.y,
      w: this.state.size.w,
      h: this.state.size.h,
      zIndex: this.state.zIndex
    });
    e.stopPropagation();
    e.preventDefault();
  }
  onMouseMove (e) {
    if (!this.state.dragging && !this.state.resizing) return;

    if (this.state.resizing) {
      this.setState({
        size: {
          w: this.state.rel.width + (e.pageX - this.state.rel.x),
          h: this.state.rel.height + (e.pageY - this.state.rel.y)
        }
      });
    } else {
      this.setState({
        pos: {
          x: e.pageX - this.state.rel.x,
          y: e.pageY - this.state.rel.y
        }
      });
    }
    e.stopPropagation();
    e.preventDefault();
  }
  render () {
    let style = {};
    if (this.props.style) {
      Object.assign(style, this.props.style);
    }

    Object.assign(style, {
      position: 'absolute',
      left: this.state.pos.x + 'px',
      top: this.state.pos.y + 'px',
      width: this.state.size.w + 'px',
      height: this.state.size.h + 'px',
      cursor: this.state.cursor,
      zIndex: this.state.zIndex
    });
    // console.log('render index ' + this.props.index);
    return DOM.div(
      {
        ref: (element) => { this.divRef = element; },
        className: this.props.className,
        style: style,
        onMouseDown: this.onMouseDown
      },
      <div style={{ display: 'flex', flexFlow: 'column', height:'100%' }} className={'my-draggable'} >
        <Row style={{ flex:'none', backgroundColor: 'rgb(148, 19, 51)', color:'white', padding:'4px' }}>
          <Col style={{ paddingLeft:'4px' }}>{this.props.title}</Col><Button size='sm' className='float-right' onClick={this.props.closeCallback}><Icon name='close' /></Button>
        </Row>
        <Row style={{ flexGrow:1, overflow:'auto', padding: '0 4px' }}>
          {this.props.children}
        </Row>
        <Row style={{ flex:'none', backgroundColor: 'rgb(148, 19, 51)', color:'white', padding:'4px' }}>
          <Col>&nbsp;</Col><div className='float-right' style={{ paddingRight:'5px' }}><Icon name='hand-grab-o' /></div>
        </Row>
      </div>
    );
  }
};
Draggable.propTypes = {
  children: PropTypes.object,
  zIndex: PropTypes.number,
  initialPos: PropTypes.object,
  initialSize: PropTypes.object,
  style: PropTypes.object,
  className: PropTypes.string,
  title: PropTypes.string,
  closeCallback: PropTypes.func,
  updateCallback: PropTypes.func
};
