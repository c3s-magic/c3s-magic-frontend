
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { YoutubeVideo } from './DiagnosticMedia';
import { DiagnosticsChart } from './DiagnosticsChart';
import { withRouter } from 'react-router';

import WPSWranglerDemo from './EnsembleAnomalyPlots';
import ADAGUCViewerComponent from '../../components/ADAGUCViewerComponent';
import MarkdownFromFile from '../../containers/MarkdownFromFile';

import ClickableImage from '../../components/ClickableImage';

import { Row, Col, Button, Alert, Container } from 'reactstrap';
import Icon from 'react-fa';
import RenderWPSProcessOutput from '../../components/WPS/RenderWPSProcessOutput';
var $RefParser = require('json-schema-ref-parser');
var _ = require('lodash');

class DiagnosticPage extends Component {
  constructor (props) {
    super(props);
    this.state = {
      yamlData: '',
      readSuccess: false,
      yamlPath: '',
      staticPath: 'diagnosticsdata/'
    };
    this.readYaml = this.readYaml.bind(this);
    this.calculate = this.calculate.bind(this);
    this.downloadData = this.downloadData.bind(this);
    this.viewProvenance = this.viewProvenance.bind(this);
    this.renderPageElement = this.renderPageElement.bind(this);
  }

  readYaml () {
    var yamlPath = 'diagnosticsdata/' + this.props.params.diag + '/' + this.props.params.diag + '.yml';
    this.setState({ yamlPath: yamlPath });
    var that = this;
    $RefParser.dereference(yamlPath)
      .then(data => {
        that.setState({ yamlData: data, readSuccess: true });
      });
  }

  componentDidMount () {
    this.readYaml();
  }

  getElementProperty (elementName, paramName) {
    var elem = this.state.yamlData[elementName];
    var paramVal = _.filter(elem, function (item) {
      if (typeof item[paramName] !== 'undefined') {
        return item[paramName];
      }
    });
    if (paramName === 'data_url') {
      return paramVal[0].data_url;
    }
    if (paramName === 'description_file') {
      paramVal = this.state.staticPath + paramVal[0].md_file;
      return paramVal;
    }
    if (paramVal.length === 0) {
      return false;
    }
    return paramVal;
  }

  isEnabled (elementName) {
    if (this.state.yamlData && this.state.readSuccess) {
      var _element = this.state.yamlData[elementName];
      return Boolean(_element);
    }
  }

  renderPageElement (elementName) {
    if (this.state.yamlData && this.state.readSuccess) {
      var _element = '';
      if (elementName === 'partner') {
        _element = this.state.yamlData[elementName];
      } else if (elementName === 'authors') {
        _element = '<ul key={elementName + \'partner\'}>';
        this.state.yamlData[elementName].forEach(function (element) {
          _element += '<li key={element}>' + element + '</li>';
        });
        _element += '</ul>';
      } else if (elementName === 'contact') {
        _element = '<ul  key={elementName + \'contact\'}>';
        this.state.yamlData[elementName].forEach(function (element) {
          _element += '<li key={element}>' + element + '</li>';
        });
        _element += '</ul>';
      } else if (elementName === 'description_short') {
        _element = this.state.yamlData[elementName];
      } else if (elementName === 'description_file') {
        _element = this.state.yamlData[elementName];
      } else if (elementName === 'settings') {
        _element = '<Table class="table table-bordered table-striped"> <thead> </thead> <tbody>';
        var elem = this.state.yamlData[elementName];
        Object.keys(elem).forEach(function (key) {
          var subElem = elem[key];
          Object.keys(subElem).forEach(function (subKey) {
            _element += '</tr>';
            _element += '<th scope="row">' + subKey + '</th>';
            _element += '<td>' + subElem[subKey] + '</td>';
            _element += '</tr>';
          });
        });
        _element += '</tbody></Table>';
      } else if (elementName === 'enableEnsembleAnomalyPlots') {
        _element = this.state.yamlData[elementName];
        return Boolean(_element);
      } else if (elementName === 'enableADAGUC') {
        _element = this.state.yamlData[elementName];
        return Boolean(_element);
      } else if (elementName === 'references') {
        _element = '<ul>';
        if (this.state.yamlData[elementName]) {
          this.state.yamlData[elementName].forEach(function (element) {
            if (typeof element === 'object') {
              _element += '<li key={element}>' + element.text + '&nbsp;<a href="' + element.url + '" target="_blank">' + '[link]' + '</a></li>';
            } else {
              _element += '<li key={element}>' + element + '</li>';
            }
          });
        }
        _element += '</ul>';
      } else if (elementName === 'media') {
        _element = this.state.yamlData[elementName];
        return _element;
      } else if (elementName === 'title') {
        _element = this.state.yamlData[elementName];
        return _element;
      } else if (elementName === 'youtube') {
        _element = this.state.yamlData[elementName];
        return _element;
      } else if (elementName === 'chart') {
        _element = this.state.yamlData[elementName];
        return _element;
      } else if (elementName === 'data') {
        _element = this.state.yamlData[elementName];
        return _element;
      } else if (elementName === 'provenance') {
        _element = this.state.yamlData[elementName];
        return _element;
      } else if (elementName === 'process') {
        _element = this.state.yamlData[elementName];
        return _element;
      } else if (elementName === 'image_file') {
        _element = this.state.yamlData[elementName];
        return _element;
      } else {
        console.warn('Could not find the key ' + elementName + ' in the configuration file!');
        _element = 'No key was requested! Check the diagnostics settings.';
      }
      return (<div key={elementName} dangerouslySetInnerHTML={{ __html: _element }} />);
    }
  }
  viewProvenance () {
    this.props.dispatch(this.props.actions.showWindow(
      {
        component:(<RenderWPSProcessOutput width={'100%'} height={'300px'} url={this.renderPageElement('provenance')} title={'Provenance'} identifier={''} abstract={''} />),
        title: 'provenance'
      })
    );
  }

  downloadData (url) {
    var win = window.open(url, '_blank');
    win.focus();
  }

  readMore () {
    var element = document.getElementById('additional');
    element.scrollIntoView();
  }

  toTop () {
    var element = document.getElementById('pagetop');
    element.scrollIntoView();
    window.scrollTo(0, 0);
  }

  calculate () {
    this.context.router.push(this.renderPageElement('process'));
  }

  getBasename (str) {
    return str.split(/[\\/]/).pop();
  }

  render () {
    if (this.state.readSuccess) {
      let showSlider = false;
      let elProp = this.getElementProperty('enableEnsembleAnomalyPlots', 'map_slider');
      if (elProp.length >= 0 && elProp[0].map_slider === true) {
        showSlider = true;
      }
      return (
        <div className='MainViewport'>
          <Row id='pagetop'>
            <Col sm={{ size: 8, offset: 2 }}>

              <div className='text vspace2em text-center'>
                <h1>
                  {this.renderPageElement('title')}
                </h1>
              </div>

              <Row>
                <Col xs='6' className='diagnosticsCol'>
                  <div className='text'>
                    <h2 style={{ color: '#921A36' }}>Partners</h2>
                    {this.renderPageElement('partner')}
                  </div>

                  <div className='text vspace2em'>
                    <h2 style={{ color: '#921A36' }}>Description</h2>
                    {this.renderPageElement('description_short')}
                    <div className='text vspace2em'>
                      <Button color='primary' onClick={this.readMore}><Icon name='' />&nbsp;Read more</Button>{' '}
                    </div>
                  </div>

                  <div className='text vspace2em'>
                    <h2 style={{ color: '#921A36' }}>Authors</h2>
                    {this.renderPageElement('authors')}
                  </div>

                  <div className='text vspace2em'>
                    <h2 style={{ color: '#921A36' }}>References</h2>
                    {this.renderPageElement('references')}
                  </div>

                  <div className='text vspace2em'>
                    <h2 style={{ color: '#921A36' }}>Contact</h2>
                    {this.renderPageElement('contact')}
                  </div>

                  <div className='vspace2em'>
                    { this.renderPageElement('provenance') && (
                      <Button className='C3SMagicTooltip' onClick={this.viewProvenance}>
                        <Icon name='tag' />
                        &nbsp;Provenance
                        <span className='C3SMagicTooltipText'>
                          {
                            'This describes entities and processes involved in producing the resource. ' +
                            'Provenance provides a critical foundation for assessing authenticity, enabling trust, and allowing reproducibility.'
                          }
                        </span>
                      </Button>
                    )

                    }
                    &nbsp;
                    { /*  data consisting of single entry */ }
                    { (this.renderPageElement('data') && !Array.isArray(this.renderPageElement('data'))) && (
                      <Button className='C3SMagicTooltip' onClick={() => { this.downloadData(this.renderPageElement('data')); }}>
                        <Icon name='download' />
                        &nbsp;Download
                        <span className='C3SMagicTooltipText'>
                          {
                            'Download a zipped bundle of all output files'
                          }
                        </span>
                      </Button>) }

                    { /*  data consisting of multiple entries */ }
                    { (this.renderPageElement('data') && Array.isArray(this.renderPageElement('data'))) && (
                      <div><h2 style={{ color: '#921A36' }}>Datasets</h2><ul>{this.renderPageElement('data').map((dataUrl, key) => {
                        return (<li key={key}><Button color='primary' onClick={() => { this.downloadData(dataUrl); }}>
                          <Icon name='download' />&nbsp;{this.getBasename(dataUrl)}</Button></li>);
                      })}</ul></div>)
                    }
                  </div>

                </Col>
                <Col xs='6' className='diagnosticsCol'>

                  <div className='text'>
                    {this.isEnabled('youtube')
                      ? <div key={'youtube'} className='text'>
                        <h2 style={{ color: '#921A36' }}>Screencast</h2>
                        <YoutubeVideo video={this.renderPageElement('youtube')} autoplay='0' rel='0' modest='1' />
                      </div>
                      : null
                    }
                  </div>

                  <div className='text'>
                    {this.isEnabled('image_file')
                      ? <div key={'image_file'} className='vspace2em'>
                        <ClickableImage src={this.renderPageElement('image_file')} />
                      </div>
                      : null
                    }
                  </div>

                  <div className='text vspace2em'>
                    <h2 style={{ color: '#921A36' }}>Settings</h2>
                    {this.renderPageElement('settings')}
                    { this.renderPageElement('process') ? <div>
                      <p>You can change the settings above in order to calculate your own result:</p>
                      <Button onClick={this.calculate}><Icon name='gear' />&nbsp;Adjust settings</Button>
                    </div>
                      : null }
                  </div>
                </Col>
              </Row>l
              <Row>
                <Col xs='12' className='diagnosticsCol'>
                  <div className='text'>
                    {this.isEnabled('chart')
                      ? <div key={'chart'} className='text'>
                        <h2 style={{ color: '#921A36' }}>Interactive chart</h2>
                        <DiagnosticsChart data={this.renderPageElement('chart')} />
                      </div>
                      : null
                    }
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xs='12' className='diagnosticsCol'>
                  <div className='text vspace2em'>
                    <h2 style={{ color: '#921A36' }}>Metric Results</h2>

                    {this.isEnabled('enableEnsembleAnomalyPlots')
                      ? [
                        <WPSWranglerDemo key={'WPSWranglerDemo'} map_data={this.getElementProperty('enableEnsembleAnomalyPlots', 'data_url')}
                          showSlider={showSlider} />
                      ]
                      : null
                    }

                    {this.isEnabled('enableADAGUC') &&
                      <ADAGUCViewerComponent
                        height={'60vh'}
                        layers={[]}
                        controls={{
                          showprojectionbutton: this.getElementProperty('enableADAGUC', 'projectionbutton'),
                          showlayerselector: this.getElementProperty('enableADAGUC', 'layerselector'),
                          showtimeselector: this.getElementProperty('enableADAGUC', 'timeselector'),
                          showstyleselector: this.getElementProperty('enableADAGUC', 'styleselector')
                        }}
                        parsedLayerCallback={(layer, webMapJSInstance) => {
                          layer.zoomToLayer();
                          webMapJSInstance.draw();
                        }}
                        wmsurl={this.getElementProperty('enableADAGUC', 'data_url')}
                      />
                    }
                  </div>
                  { this.isEnabled('media') && !Array.isArray(this.renderPageElement('media'))
                    ? [
                      <div key={'media'} className='vspace2em'>
                        <ClickableImage src={this.renderPageElement('media')} />
                      </div>
                    ]
                    : null
                  }
                  { this.isEnabled('media') && Array.isArray(this.renderPageElement('media'))
                    ? this.renderPageElement('media').map((imageUrl, key) => {
                      return (<div key={'media' + key} className='vspace2em'>
                        <ClickableImage src={imageUrl} />
                      </div>);
                    })
                    : null
                  }

                  <div id='additional' className='vspace2em'>
                    { this.isEnabled('description_file')
                      ? [
                        <MarkdownFromFile key={'description_file'} url={this.state.staticPath + this.state.yamlData['description_file']} />
                      ]
                      : null
                    }
                  </div>

                  <div className='text'>
                    <Button color='primary' onClick={this.toTop}><Icon name='' />&nbsp;Go to the top of the page</Button>{' '}
                  </div>

                </Col>
              </Row>

            </Col>
          </Row>

        </div>);
    } else {
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }} className='text vspace2em'>

          <Container>
            <Row>
              <Col sm={{ size: 8, offset: 2 }}>

                <Alert color='danger'>
                  <h4 className='alert-heading'>Error!</h4>
                  <p>
                    This diagnostic is not ready yet or there is a technical problem.
                  </p>
                  <hr />
                  <p className='mb-0'>
                    If you think this is an error, please contact us at magicians@c3s-magic.eu
                  </p>
                </Alert>
              </Col>
            </Row>
          </Container>
        </div>
      );
    }
  }
}

DiagnosticPage.contextTypes = {
  router: PropTypes.object.isRequired
};

DiagnosticPage.propTypes = {
  params: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
};

export default withRouter(DiagnosticPage);
