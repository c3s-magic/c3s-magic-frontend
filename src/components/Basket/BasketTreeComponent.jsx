import React, { Component } from 'react';
import { Treebeard, decorators } from 'react-treebeard';
import PropTypes from 'prop-types';
import treeBeardStyling from '../../styles/stylingBasket/stylingBasket';
import { Button, Row } from 'reactstrap';
import ScrollArea from 'react-scrollbar';
import PreviewComponent from '../PreviewComponent';
import RenderWPSProcessOutput from '../WPS/RenderWPSProcessOutput';
import { withRouter } from 'react-router';
import Moment from 'react-moment';
import Icon from 'react-fa';
import FileUploadComponent from '../FileUploadComponent';
import { ENOBUFS } from 'constants';

var fileDownload = require('js-file-download');

class BasketTreeComponent extends Component {
  constructor (props) {
    super(props);
    this.state = {
      cursor: null,
      previewActive: false
    };
    this.onToggle = this.onToggle.bind(this);
    this.deleteBasketItem = this.deleteBasketItem.bind(this);
    this.previewFile = this.previewFile.bind(this);
    this.reloadBasket = this.reloadBasket.bind(this);
    this.uploadBasketItem = this.uploadBasketItem.bind(this);

    decorators.Header = (properties) => {
      if (!properties.node.type === 'NODE') return;
      const style = properties.style;
      const iconType = properties.node.children ? 'folder' : 'file-text';
      const iconClass = `fa fa-${iconType}`;
      const iconStyle = { marginRight: '5px' };

      if (properties.node.type === 'LEAF') {
        return (
          <div style={{ verticalAlign: 'top', color: '#000000' }}>
            <div style={style.title}>
              <div>
                <i className={iconClass} style={iconStyle} />

                <span>{properties.node.name}</span>
                <Moment format='MMMM Do YYYY, HH:mm:ss' style={{ float: 'right' }}>{properties.node.date}</Moment>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div style={style.base}>
            <div style={style.title}>
              <div>
                {properties.node.name}
              </div>
            </div>
          </div>
        );
      }
    };
  }

  /**
   * What to do when the treebeard is toggled.
   **/
  onToggle (node, toggled) {
    if (this.state.cursor) {
      this.state.cursor.active = false;
    }

    node.active = true;

    if (node.children) {
      node.toggled = toggled;
    }

    /* When toggled, preview is always not active. */
    this.setState({ cursor: node, previewActive: false });
    console.log(node);
    if (node.type === 'LEAF') {
      if (node.httpurl.endsWith('.png')) {

      }
      if (node.dapurl) {
        let baseName = (str) => {
          let base = str.substring(str.lastIndexOf('/') + 1);
          if (base.lastIndexOf('.') !== -1) base = base.substring(0, base.lastIndexOf('.'));
          return base;
        };

        let basename = baseName(node.dapurl);
        let url = node.dapurl;
        if (node.httpurl.endsWith('.png') || node.httpurl.endsWith('.yml') || node.httpurl.endsWith('.txt') || node.httpurl.endsWith('.svg')) {
          url = node.httpurl;
        }

        this.props.dispatch(this.props.actions.showWindow(
          {
            component:(<RenderWPSProcessOutput width={'100%'} height={'300px'} url={url} title={basename} identifier={basename} abstract={''} />),
            title: basename
          })
        );
      }
    }
  }

  /**
   * Deleting an item by dispatching an action.
   **/
  deleteBasketItem () {
    const { dispatch, actions } = this.props;

    /* Getting the path of the currently selected item. */
    let pathItem = this.state.cursor.id;
    const pathItemWithoutGoogleId =
      pathItem.substring(pathItem.indexOf('/'), pathItem.length);

    dispatch(actions.deleteBasketItem({ path: pathItemWithoutGoogleId, actions:actions, dispatch:dispatch }));
  }

  /**
   * Download a basket item.
   **/
  downloadBasketItem () {
    // There's always an if..
    if (!this.state.cursor) return;
    console.log(this.state.cursor.httpurl);

    var win = window.open(this.state.cursor.httpurl, '_blank');
    win.focus();

    // /* this.state.cursor is always the current selected item in the basket. */
    // let link = this.state.cursor.httpurl + '?key=' + this.props.accessToken;
    // fileDownload(link, this.state.cursor.httpurl.substring(this.state.cursor.httpurl.lastIndexOf('/') + 1));
  }

  previewFile () {
    this.setState({ previewActive: !this.state.previewActive });
  }

  /**
   * Small functions that checks if selected file is a CSV file.
   * Only then, activate the preview button.
   */
  isPreviewButtonDisabled () {
    if (!this.state.cursor) return false;
    return !(this.state.cursor.type === 'LEAF' && this.state.cursor.name.endsWith('.csv'));
  }

  /**
   * Small functions that checks if selected file is a CSV file.
   * Only then, activate the wrangle button.
   */
  isWrangleButtonDisabled () {
    if (!this.state.cursor) return false;
    return !(this.state.cursor.type === 'LEAF' && this.state.cursor.name.endsWith('.csv'));
  }

  /**
   * Small functions that checks if selected file is a CSV file.
   * Only then, activate the download button.
   */
  isDownloadButtonDisabled () {
    if (!this.state.cursor) return false;
    return this.state.cursor.type === 'NODE';
  }

  // goToWrangler () {
  //   if (!this.state.cursor) return;

  //   const { dispatch } = this.props;

  //   let fullId = this.state.cursor.id;
  //   const idWithoutGoogleId = fullId.substring(fullId.indexOf('/') + 1);

  //   dispatch(wpsActions.setCSVFileToWrangle({ fileName: idWithoutGoogleId }));
  //   this.props.router.push('/wrangler');
  // }

  reloadBasket () {
    this.props.dispatch(this.props.actions.fetchBasketItems(this.props));
  }

  uploadBasketItem () {
    this.props.dispatch(this.props.actions.showWindow(
      {
        component:(<FileUploadComponent dispatch={this.props.dispatch} actions={this.props.actions} backend={this.props.backend} accessToken={this.props.accessToken} />),
        title:'Upload',
        dispatch: this.props.dispatch,
        width: 700,
        height: 500
      })
    );
  }

  render () {
    if (this.props.data) {
      this.props.data.toggled = true;
      if (this.props.data.children) {
        this.props.data.children.toggled = true;
      }
    }
    // console.log(this.props);
    let errorMessage = this.props.data ? this.props.data.error ? this.props.data.error : null : 'Unable to fetch basket list from server';
    return (

      <div className='basketTreeContainer'>
        <Row className='basketTreeContainerMainSection'>
          { this.props.accessToken ? errorMessage ? ('Error getting basket: ' + errorMessage) : (
            <ScrollArea speed={1} horizontal={false} contentClassName='content' className='scrollAreaBasket' >
              {/* More about Treebeard: https://github.com/alexcurtis/react-treebeard */}
              { this.props.data ? <Treebeard
                data={this.props.data}
                onToggle={this.onToggle}
                style={treeBeardStyling}
                decorators={decorators}
              /> : <div>{this.props.accessToken ? 'Loading basket ...' : 'Not signed in.'}</div> }
            </ScrollArea>) : 'Not signed in.' }
        </Row>
        { this.props.accessToken && <Row>

          <hr />
          <Button className='basketButton' onClick={() => this.uploadBasketItem()}><Icon name='upload' /> Upload</Button>
          <Button className='basketButton' onClick={() => this.downloadBasketItem()}
            disabled={this.isDownloadButtonDisabled()}><Icon name='download' /> Download</Button>
          <Button className='basketButton' onClick={() => this.deleteBasketItem()}><Icon name='recycle' /> Delete</Button>
          <Button className='basketButton' onClick={() => this.reloadBasket()}><Icon name='refresh' /> Reload</Button>
          <hr />
          {
            this.state.previewActive
              ? <PreviewComponent
                file={this.state.cursor ? this.state.cursor.httpurl : ''}
                tableClassName='previewTable'
                componentClassName='previewComponent'
                numberOfLinesDisplayed={30} />
              : null
          }
        </Row> }
      </div>
    );
  }
}

BasketTreeComponent.propTypes = {
  // wpsActions: PropTypes.object.isRequired,
  data: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  router: PropTypes.object,
  accessToken: PropTypes.string,
  backend: PropTypes.string
};

export default withRouter(BasketTreeComponent);
