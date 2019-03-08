import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '../getConfig';
import { debounce } from 'throttle-debounce';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Alert, Card, CardText, CardBody, CardTitle, CardSubtitle, Row, Col } from 'reactstrap';
import ReactSlider from 'react-slider';
import Icon from 'react-fa';
import ReactWebMapJS from './ReactWebMapJS';
import { WMJSLayer, WMJSGetServiceFromStore } from 'adaguc-webmapjs';
let config = getConfig();
// console.log(config);

const mapTypeConfiguration = [
  {
    title: 'World Lat/Lon',
    bbox: [-180, -90, 180, 90],
    srs: 'EPSG:4326',
    baselayer:{ service:'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?', name:'naturalearth2', type: 'wms' }
  }, {
    title: 'World Mollweide',
    bbox: [-18157572.744146045, -11212941.682924412, 18085661.018022258, 11419683.192411266],
    srs: 'EPSG:7399',
    baselayer:{ service:'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?', name:'naturalearth2', type: 'wms' }
  },
  {
    title: 'World Robinson',
    bbox: [-17036744.451383516, -10711364.114367772, 16912038.081015453, 10488456.659686875],
    srs: 'EPSG:54030',
    baselayer:{ service:'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?', name:'naturalearth2', type: 'wms' }
  }, {
    title: 'World Mercator',
    bbox: [-19000000, -19000000, 19000000, 19000000],
    srs: 'EPSG:3857',
    baselayer:{ service:'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?', name:'naturalearth2', type: 'wms' }
  }, {
    title: 'Northern Hemisphere',
    bbox: [-5661541.927991125, -3634073.745615984, 5795287.923063262, 2679445.334384017],
    srs: 'EPSG:3411',
    baselayer:{ service:'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?', name:'naturalearth2', type: 'wms' }
  }, {
    title: 'Southern Hemisphere',
    bbox: [-4589984.273212382, -2752857.546211313, 5425154.657417289, 2986705.2537886878],
    srs: 'EPSG:3412',
    baselayer:{ service:'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?', name:'naturalearth2', type: 'wms' }
  }, {
    title: 'Europe North Pole',
    bbox: [-13000000, -13000000, 13000000, 13000000],
    srs: 'EPSG:3575',
    baselayer:{ service:'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?', name:'naturalearth2', type: 'wms' }
  }, {
    title: 'Europe stereographic',
    bbox: [-2776118.977564746, -6499490.259201691, 9187990.785775745, 971675.53185069],
    srs: 'EPSG:32661',
    baselayer:{ service:'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?', name:'naturalearth2', type: 'wms' }
  }, {
    title: 'North America',
    bbox: [-2015360.8716608454, -697107.5349683464, 9961718.159421016, 6782157.107682772],
    srs: 'EPSG:50001',
    baselayer:{ service:'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?', name:'naturalearth2', type: 'wms' }
  }
];

export default class ADAGUCViewerComponent extends PureComponent {
  constructor (props) {
    super(props);
    this.setProjection = this.setProjection.bind(this);
    this.getLayersForService = this.getLayersForService.bind(this);

    this.listeners = [
      { name:'onupdatebbox', callbackfunction: (webmapjs, bbox) => { this.updateBBOXDebounced(webmapjs, bbox); }, keep:true },
      { name: 'onmaploadingcomplete', callbackfunction: (webmapjs) => { this.drawDebounced(webmapjs); }, keep:true }
    ];

    // console.log('wmjsRegistry = {}');
    this.webMapJSInstances = {};
    this.drawDebounced = debounce(500, this.drawDebounced);
    this.updateBBOXDebounced = debounce(10, this.updateBBOXDebounced);
    this.toggle = this.toggle.bind(this);
    this.selectLayer = this.selectLayer.bind(this);
    this.selectStyle = this.selectStyle.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);
    this.debouncedHandleSliderChange = debounce(25, this.debouncedHandleSliderChange);

    this.state = {
      dropdownOpen: {},
      maprojection: 'Map projection',
      wmsLayers: [],
      currentStyles: [],
      numTimeValues: 0,
      currentValue: 0,
      bbox: '',
      title: null,
      error: null
    };
    this.prevProps = {};
  }

  debouncedHandleSliderChange (v) {
    this.handleSliderChange(v);
  }

  handleSliderChange (v) {
    if (v <= 0) v = 0;
    if (this.timeDim) {
      if (v >= this.timeDim.size()) v = this.timeDim.size() - 1;
      this.setState({ currentValue:v });
      let timeValue = this.timeDim.getValueForIndex(v);
      this.setState({ timeValue:timeValue });
      if (this.webMapJSInstances['first']) {
        this.webMapJSInstances['first'].setDimension('time', timeValue);
        this.webMapJSInstances['first'].draw();
      }
    }
  }

  drawDebounced (webmapjs) {
    for (let key in this.webMapJSInstances) {
      let otherWebMapJS = this.webMapJSInstances[key];
      if (webmapjs !== otherWebMapJS) {
        otherWebMapJS.suspendEvent('onmaploadingcomplete');
        otherWebMapJS.draw();
        otherWebMapJS.resumeEvent('onmaploadingcomplete');
      }
    };
  };

  updateBBOXDebounced (webmapjs, bbox) {
    for (let key in this.webMapJSInstances) {
      let otherWebMapJS = this.webMapJSInstances[key];
      if (webmapjs !== otherWebMapJS) {
        otherWebMapJS.suspendEvent('onupdatebbox');
        otherWebMapJS.setBBOX(bbox);
        otherWebMapJS.resumeEvent('onupdatebbox');
      }
    };
    this.setState({ 'bbox': bbox.toString() });
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.dapurl && this.prevProps.dapurl !== nextProps.dapurl) {
      this.prevProps.dapurl = nextProps.dapurl;
      let WMSGetCapabiltiesURL = config.backendHost + '/wms?source=' + encodeURIComponent(nextProps.dapurl);
      this.getLayersForService(WMSGetCapabiltiesURL, nextProps.dapurl);
    } else if (nextProps.wmsurl && this.prevProps.wmsurl !== nextProps.wmsurl) {
      this.prevProps.wmsurl = nextProps.wmsurl;
      this.getLayersForService(nextProps.wmsurl);
    }
  }

  componentDidMount () {
    // console.log('ADAGUCViewerComponent componentDidMount');
    mapTypeConfiguration.map((proj, index) => {
      if (proj.title === 'World Lat/Lon') {
        this.setProjection(proj);
      }
    });
    this.componentWillReceiveProps(this.props);
  }

  componentWillUnmount () {
    // console.log('Viewer componentWillUnMount');
  }

  getLayersForService (WMSGetCapabiltiesURL, dapurl) {
    // console.log('getLayersForService' + WMSGetCapabiltiesURL);
    this.setState({ wmsLayers:[], error:null, title:'Loading...' });
    // console.log(WMSGetCapabiltiesURL);

    // eslint-disable-next-line no-undef
    this.WMSServiceStore = WMJSGetServiceFromStore(WMSGetCapabiltiesURL);

    let httpCallbackWMSCapabilities = (_layerNames, serviceURL) => {
      // console.log('httpCallbackWMSCapabilities');
      if (_layerNames.error) {
        console.log('error');
        return;
      }
      // console.log(this.props);

      if (dapurl) {
        // console.log(this.props.dapurl);
        let baseName = (str) => {
          let base = str.substring(str.lastIndexOf('/') + 1);
          // if (base.lastIndexOf('.') !== -1) base = base.substring(0, base.lastIndexOf('.'));
          // console.log(base);
          return base;
        };

        this.setState({ title: baseName(dapurl) });
      }
      let wmsLayers = [];
      for (let j = 0; j < _layerNames.length; j++) {
        if (_layerNames[j].indexOf('baselayer') === -1 &&
            _layerNames[j].indexOf('overlay') === -1 &&
            _layerNames[j].indexOf('grid') === -1
        ) {
          // eslint-disable-next-line
          new WMJSLayer({
            service:WMSGetCapabiltiesURL,
            name:_layerNames[j],
            onReady: (callbackLayer) => {
              wmsLayers.push(callbackLayer);
              callbackLayer.onReady = null;
            }
          });
        }
      }
      if (wmsLayers.length > 0) { // } && this.props.controls && this.props.controls.showlayerselector) {
        this.selectLayer(wmsLayers[0]);
      } else {
        console.log('no selectLayer', wmsLayers, this.props.controls);
      }
      // console.log('layerNames', wmsLayers);
      this.setState({ wmsLayers:wmsLayers });
    };
    this.WMSServiceStore.getCapabilities(
      () => {
        this.WMSServiceStore.getLayerNames(
          (data) => { httpCallbackWMSCapabilities(data, WMSGetCapabiltiesURL); },
          (error) => { console.log(error); });
      },
      (error) => {
        this.setState({ title:null, error: error });
        throw new Error(error);
      },
      false
    );
  }
  setProjection (p) {
    for (let key in this.webMapJSInstances) {
      let otherWebMapJS = this.webMapJSInstances[key];
      // console.log('Set projection', p, otherWebMapJS);
      otherWebMapJS.setProjection(p);
      if (this.state.selectedLayer) {
        this.state.selectedLayer.zoomToLayer();
      }
      otherWebMapJS.draw();
    }
    this.setState({
      'maprojection':p.title,
      'srs': p.srs
    });
  }

  toggle (id) {
    // console.log('toggle', this.state.dropdownOpen);
    let dropDownOpen = Object.assign({}, { ...this.state.dropdownOpen });
    dropDownOpen[id] = !dropDownOpen[id];
    this.setState({
      dropdownOpen: dropDownOpen
    });
  }

  selectLayer (wmjsLayer) {
    // console.log('selectLayer', wmjsLayer)
    if (this.webMapJSInstances['first']) this.webMapJSInstances['first'].removeAllLayers();
    if (wmjsLayer) {
      this.setState({ selectedLayer:wmjsLayer });
      if (this.webMapJSInstances['first']) {
        this.webMapJSInstances['first'].addLayer(wmjsLayer);
        if (this.props.parsedLayerCallback) this.props.parsedLayerCallback(wmjsLayer, this.webMapJSInstances['first']);
      }
    }

    if (this.webMapJSInstances['first']) this.webMapJSInstances['first'].draw();

    if (wmjsLayer) {
      let styles = wmjsLayer.getStyles();
      if (styles.length > 0) {
        // console.log(styles);
        this.setState({ currentStyles: styles, selectedStyle: styles[0] });
      } else {
        this.setState({ currentStyles: [], selectedStyle: 'default' });
      }
    }

    if (wmjsLayer && wmjsLayer.getDimension('time')) {
      // console.log(wmjsLayer.getDimension('time').size());
      this.timeDim = wmjsLayer.getDimension('time');
      this.setState({ numTimeValues:this.timeDim.size() });
      this.handleSliderChange(this.timeDim.size() - 1);
      // console.log(this.state.numTimeValues);
    } else {
      // console.log('no time dim');
      this.setState({ numTimeValues:0, timeValue:'No time dimension' });
    }
  }

  selectStyle (wmjsStyle) {
    // console.log(wmjsStyle);
    if (wmjsStyle) {
      this.setState({ selectedStyle:wmjsStyle });
      this.state.selectedLayer.setStyle(wmjsStyle.name);
      this.webMapJSInstances['first'].draw();
    }
  }

  // shouldComponentUpdate (nextProps, nextState) {
  //   // console.log(this.props, nextProps);
  //   // console.log(this.state, nextState);
  //   if (nextState.wmsLayers && this.state.wmsLayers && nextState.wmsLayers.length !== this.state.wmsLayers.length) return true;
  //   return false;
  // }

  render () {
    const { title, error } = this.state;

    // console.log('layer0', this.state.wmsLayers[0]);
    return (<div className={'ADAGUCViewerComponent'} style={{ width:this.props.width || '100%' }}>
      <CardBody style={{ padding:'0' }}>
        { this.props.showmetadata ? <div>
          { title ? (<CardTitle>NetCDF file: {this.state.title}</CardTitle>) : null }
          { error ? (<Alert color='danger'>{this.state.error}</Alert>) : null }
          <CardSubtitle>{this.WMSServiceStore.title}</CardSubtitle>
          <CardText>{this.WMSServiceStore.abstract}</CardText>
        </div>
          : null }
        { this.props.controls && this.props.controls.showlayerselector ? <Row>
          <Col xs='3'>Layer</Col><Col><Dropdown
            isOpen={this.state.dropdownOpen['showlayerselector']}
            toggle={() => { this.toggle('showlayerselector'); }}
          >
            <DropdownToggle caret>
              <Icon name='align-justify' />&nbsp;{(this.state.selectedLayer && this.state.selectedLayer.title) || 'Select a layer'}
            </DropdownToggle>
            <DropdownMenu>
              {
                this.state.wmsLayers.map((wmjsLayer, index) => {
                  return (<DropdownItem key={index} onClick={(event) => {
                    this.state.wmsLayers.map((wmjsLayer, index) => {
                      if (wmjsLayer.title === event.target.innerText) {
                        this.selectLayer(wmjsLayer);
                      }
                    });
                  }
                  }>{wmjsLayer.title}</DropdownItem>);
                })
              }
            </DropdownMenu>
          </Dropdown></Col><Col>({this.state.wmsLayers.length} layers)</Col></Row> : null
        }
        { this.props.controls && this.props.controls.showstyleselector ? <Row>
          <Col xs='3'>Style</Col><Col><Dropdown
            isOpen={this.state.dropdownOpen['showstyleselector']}
            toggle={() => { this.toggle('showstyleselector'); }}
          >
            <DropdownToggle caret>
              <Icon name='align-justify' />&nbsp;{(this.state.selectedStyle && this.state.selectedStyle.title) || 'Select a style'}
            </DropdownToggle>
            <DropdownMenu>
              {
                this.state.currentStyles.map((wmjsStyle, index) => {
                  return (<DropdownItem key={index} onClick={(event) => {
                    this.state.currentStyles.map((wmjsStyle, index) => {
                      if (wmjsStyle.title === event.target.innerText) {
                        this.selectStyle(wmjsStyle);
                      }
                    });
                  }
                  }>{wmjsStyle.title}</DropdownItem>);
                })
              }
            </DropdownMenu>
          </Dropdown></Col></Row> : null
        }
        { this.props.controls && this.props.controls.showprojectionbutton ? <Row>
          <Col xs='3'>Projection</Col><Col><Dropdown
            isOpen={this.state.dropdownOpen['showprojectionbutton']}
            toggle={() => { this.toggle('showprojectionbutton'); }}
          >
            <DropdownToggle caret>
              <Icon name='globe' />&nbsp;{this.state.maprojection || 'Map projection'}
            </DropdownToggle>
            <DropdownMenu>
              {
                mapTypeConfiguration.map((proj, index) => {
                  return (<DropdownItem key={index} onClick={(event) => {
                    mapTypeConfiguration.map((proj, index) => {
                      if (proj.title === event.target.innerText) {
                        this.setProjection(proj);
                      }
                    });
                  }
                  }>{proj.title}</DropdownItem>);
                })
              }
            </DropdownMenu>
          </Dropdown></Col></Row> : null
        }
        { this.props.controls && this.props.controls.showtimeselector ? (<div><Row>
          <Col xs='3'>Time:</Col>
          <Col xs='3'>
            <div style={{ display:'inline' }}>
              <Button onClick={() => {
                this.debouncedHandleSliderChange(this.state.currentValue - 1);
              }}>&lt;</Button>
              <Button onClick={() => {
                this.debouncedHandleSliderChange(this.state.currentValue + 1);
              }}>&gt;</Button>
            </div>
          </Col>
          <Col>
            <div style={{}}>
              <ReactSlider
                className={'horizontal-slider'}
                min={0}
                max={parseInt(this.state.numTimeValues) - 1}
                value={this.state.currentValue}
                onChange={(v) => { this.debouncedHandleSliderChange(v); }}
              />
            </div>
          </Col>
        </Row><Row>
          <Col xs='3'>Timevalue (UTC)</Col><Col><b>{this.state.timeValue + ' (' + (this.state.currentValue + 1) + '/' + this.state.numTimeValues + ')'}</b></Col>
        </Row></div>) : null
        }
        { (this.props.controls && this.props.controls.showdownloadbutton !== false && 1 === 0) ? (<div><Row>
          <Col xs='3' />
          <Col xs='1'>
            <abbr title='Use the Web Coverage service to download the data behind this map for current date,
              &nbsp;geographical location and projection. Right click and copy the link to get the GetCoverage URL.'>
              <Button disabled={!this.state.selectedLayer} target={'_blank'} href={
                this.state.selectedLayer && this.webMapJSInstances['first'] ? this.state.selectedLayer.service + '&SERVICE=WCS&REQUEST=GetCoverage' +
                '&COVERAGE=' + this.state.selectedLayer.name + '&FORMAT=NetCDF3&' +
                '&CRS=' + this.state.srs + '&BBOX=' + this.state.bbox + '&width=1000&height=1000' +
                '&TIME=' + this.state.timeValue
                // '&TIME=*'
                  : '#'}
              ><Icon name='download' /></Button>
            </abbr>
          </Col>
          <Col xs='1'>
            <abbr title='Download high quality image of this map'>
              <Button ref={'imagedownloadbutton'} disabled={!this.state.selectedLayer} onClick={() => {
                /* Set the map size to a high quality big image size, load and redraw the scene, capture the canvas and set orignal size back */
                let webMapJS = this.state.selectedLayer.parentMaps[0];
                let currentSize = webMapJS.getSize();
                webMapJS.setSize(1920, 1920, true); // New big size for high quality images
                webMapJS.addListener('onmaploadingcomplete', () => { // Add a listener once to listen to load ready
                  const ctx = webMapJS.getFrontBufferCanvasContext(); // Get the ctx
                  let dataURL = ctx.canvas.toDataURL('image/png'); // Convert canvas to a data url (base64 encoded PNG image)
                  window.open(dataURL); // Open this in a new tab
                  webMapJS.setSize(currentSize.width, currentSize.height, true); // Set original size back
                  webMapJS.draw(); // Redraw orignal smaller size
                }, false);
                webMapJS.draw(); // Draw big size
              }}
              ><Icon name='image' /></Button>
            </abbr>
          </Col>

        </Row></div>) : null
        }
        {
          (this.props.stacklayers === false) ? this.state.wmsLayers.map((wmjslayer, index) => {
            // console.log(' this.state.wmsLayers',  this.state.wmsLayers);
            return (
              <Card style={{ padding:'0' }} body key={index} >
                <CardBody style={{ padding:'0' }} >
                  <CardTitle>Layer {wmjslayer.name} - {wmjslayer.title}</CardTitle>
                  <div style={{ width:this.props.width || '100%', height:this.props.height || '100%' }}>
                    <ReactWebMapJS
                      id={index}
                      key={wmjslayer.name}
                      layers={[wmjslayer]}
                      listeners={this.listeners}
                      layerReadyCallback={(layer, webMapJS) => {
                        if (this.props.parsedLayerCallback) this.props.parsedLayerCallback(layer, webMapJS); else webMapJS.draw();
                      }}
                      webMapJSInitializedCallback={(wmjs, appendOrRemove) => {
                        let id = wmjslayer.name;
                        // console.log('stack', id, index, wmjslayer.name);
                        if (appendOrRemove) this.webMapJSInstances[id] = wmjs; else {
                          this.webMapJSInstances[id].destroy();
                          delete this.webMapJSInstances[id];
                        }
                        if (appendOrRemove && this.props.webMapJSInitializedCallback) this.props.webMapJSInitializedCallback(wmjs);
                      }}
                    />
                  </div>
                </CardBody>
              </Card>
            );
          }) : <Card body style={{ padding:'0' }} >
            <CardBody style={{ padding:'0' }}>
              <div style={{ width:this.props.width || '100%', height:this.props.height || '100%' }}>
                <ReactWebMapJS
                  baselayers={this.props.baselayers}
                  layers={this.state.wmsLayers.filter(wmjsLayer => {
                    if (this.props.controls && this.props.controls.showlayerselector) return false;
                    return (this.props.layernames.includes(wmjsLayer.name) || this.props.layernames.length === 0);
                  })}
                  listeners={this.listeners}
                  layerReadyCallback={(wmjsLayer, webMapJS) => {
                    if (this.props.parsedLayerCallback && webMapJS) this.props.parsedLayerCallback(wmjsLayer, webMapJS);
                  }}
                  webMapJSInitializedCallback={(wmjs, appendOrRemove) => {
                    if (appendOrRemove) this.webMapJSInstances['first'] = wmjs; else {
                      this.webMapJSInstances['first'].destroy();
                      delete this.webMapJSInstances['first'];
                    }
                    if (appendOrRemove && this.props.webMapJSInitializedCallback) this.props.webMapJSInitializedCallback(wmjs);
                  }}
                />
              </div>
            </CardBody>
          </Card>
        }
      </CardBody>

    </div>);
  }
}

ADAGUCViewerComponent.defaultProps = {
  layernames: []
};

ADAGUCViewerComponent.propTypes = {
  dapurl: PropTypes.string,
  wmsurl: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  stacklayers: PropTypes.bool,
  showmetadata: PropTypes.bool,
  controls: PropTypes.object,
  parsedLayerCallback: PropTypes.func,
  webMapJSInitializedCallback: PropTypes.func,
  baselayers: PropTypes.array,
  layernames: PropTypes.array
};
