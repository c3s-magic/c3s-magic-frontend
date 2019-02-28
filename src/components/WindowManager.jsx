import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Draggable from './Draggable';

export default class WindowManager extends Component {
  render () {
    // console.log(this.props);
    // return (<div style={{ border:'3px solid black', display:'block', position:'absolute', zIndex: 1000, width:'100px', height:'100px', left:'100px', right:'100px' }}>WW!</div>);
    const { windows, dispatch, actions } = this.props;
    // console.log('render', windows);
    return (<div>
      { windows.map((v, i) => {
        return (<Draggable
          className='my-draggable'
          key={v.id}
          index={v.index}
          initialPos={{ x: v.x, y:v.y }}
          initialSize={{ w:v.w, h:v.h }}
          zIndex={v.zIndex}
          title={v.title}
          closeCallback={() => { console.log(v); dispatch(actions.closeWindow(v.id)); }}
          updateCallback={(updates) => { dispatch(actions.updateWindow({ id: v.id, updates: updates })); }}
        >
          <div style={{ width:'100%' }}>{ v.element }</div>
        </Draggable>);
      })}
    </div>);
  };
};

WindowManager.propTypes = {
  windows: PropTypes.array,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
};
