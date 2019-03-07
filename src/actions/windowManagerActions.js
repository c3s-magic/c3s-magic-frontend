
/* labels */
export const WM_SHOW_WINDOW = 'WM_SHOW_WINDOW';
export const WM_CLOSE_WINDOW = 'WM_CLOSE_WINDOW';
export const WM_UPDATE_WINDOW = 'WM_UPDATE_WINDOW';

/* Actions */
const showWindow = (payload) => {
  console.log('showWindow');
  return {
    type: WM_SHOW_WINDOW,
    payload: payload
  };
};

const closeWindow = (payload) => {
  console.log('closeWindow', payload);
  return {
    type: WM_CLOSE_WINDOW,
    payload: payload
  };
};

const updateWindow = (payload) => {
  return {
    type: WM_UPDATE_WINDOW,
    payload: payload
  };
};

export const windowManagerActions = {
  showWindow,
  closeWindow,
  updateWindow
};

/* Reducers */

let openedWindows = 1;
let zIndex = 200;

const _showWindow = (state, payload) => {
  console.log('_showWindow', payload);
  let windows = state.windows.slice();
  let id = openedWindows++;
  windows.push({
    element:payload.component,
    id: id,
    title: payload.title + ' (' + id + ')',
    x: 200 + (id % 10) * 20,
    y: 200 + (id % 10) * 20,
    w: payload.width || 800,
    h: payload.height || 600,
    zIndex: payload.zIndex || zIndex++,
    index: id,
    width:'100%'
  });

  return Object.assign({}, state, { windows: windows });
};

const _closeWindow = (state, payload) => {
  if (payload <= 0) return;
  let windows = JSON.parse(JSON.stringify(state.windows));
  // console.log(JSON.stringify(windows));
  for (let j = 0; j < windows.length; j++) {
    windows[j].element = state.windows[j].element;
  }
  for (let j = 0; j < windows.length; j++) {
    if (windows[j].id === payload) {
      console.log('deleting ', j, windows[j]);
      windows.splice(j, 1);
      break;
    }
  };
  // console.log(JSON.stringify(windows));
  return Object.assign({}, state, { windows: windows });
};

const _updateWindow = (state, payload) => {
  // console.log('_updateWindow', payload);
  let windows = state.windows.slice();
  for (let j = 0; j < windows.length; j++) {
    if (windows[j].id === payload.id) {
      windows[j].x = payload.updates.x;
      windows[j].y = payload.updates.y;
      windows[j].w = payload.updates.w;
      windows[j].h = payload.updates.h;
      windows[j].zIndex = zIndex++;
      // console.log(windows[j]);
      break;
    }
  };
  return Object.assign({}, state, { windows: windows });
};

const ACTION_HANDLERS = {
  [WM_SHOW_WINDOW] : (state, action) => _showWindow(state, action.payload),
  [WM_CLOSE_WINDOW] : (state, action) => _closeWindow(state, action.payload),
  [WM_UPDATE_WINDOW] : (state, action) => _updateWindow(state, action.payload)
};
const initialState = { windows: [] };

export function windowManagerReducer (state = initialState, action) {
  if (!action) {
    return state;
  }
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
