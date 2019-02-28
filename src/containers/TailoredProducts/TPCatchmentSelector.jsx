import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Form, Label, Row, Col, Card, CardBody, CardTitle, CardText } from 'reactstrap';
import { withRouter } from 'react-router';
import axios from 'axios';
import ADAGUCViewerComponent from '../../components/ADAGUCViewerComponent';
import AdagucMapDraw from '../../components/ADAGUC/AdagucMapDraw.js';
import { WMJSLayer } from 'adaguc-webmapjs';
import RechartsComponent from '../../components/RechartsComponent.jsx';
import { XAxis, YAxis, Tooltip, CartesianGrid, LabelList, ScatterChart, Scatter, Cell, Line, LineChart } from 'recharts';

// ogr2ogr bundle.shp Thames.shp && ogr2ogr -append bundle.shp Elbe.shp && ogr2ogr -append bundle.shp MotalaStrom.shp && ogr2ogr -f GeoJSON catchments.geojson bundle.shp
// ssconvert  -O 'separator=; format=raw' recipe_shapeselect_py_20181207_130446/work/diagnostic1/script1/CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_pr_1990-1999_polygon.xlsx Thames_CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_pr_1990-1999_polygon.txt
// ssconvert  -O 'separator=; format=raw' recipe_shapeselect_py_20181207_130446/work/diagnostic1/script1/CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_tas_1990-1999_polygon.xlsx Thames_CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_tas_1990-1999_polygon.txt
// ssconvert  -O 'separator=; format=raw' recipe_shapeselect_py_20181207_130454/work/diagnostic1/script1/CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_pr_1990-1999_polygon.xlsx MotolaStrom_CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_pr_1990-1999_polygon.txt
// ssconvert  -O 'separator=; format=raw' recipe_shapeselect_py_20181207_130454/work/diagnostic1/script1/CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_tas_1990-1999_polygon.xlsx MotolaStrom_CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_tas_1990-1999_polygon.txt
// ssconvert  -O 'separator=; format=raw' recipe_shapeselect_py_20181207_130502/work/diagnostic1/script1/CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_pr_1990-1999_polygon.xlsx Elbe_CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_pr_1990-1999_polygon.txt
// ssconvert  -O 'separator=; format=raw' recipe_shapeselect_py_20181207_130502/work/diagnostic1/script1/CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_tas_1990-1999_polygon.xlsx Elbe_CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_tas_1990-1999_polygon.txt

class CustomTooltipPrecipitation extends Component {
  render () {
    const { active } = this.props;

    if (active) {
      const { payload } = this.props;
      if (!payload) return (<div />);
      return (
        <div className='custom-tooltip'>
          {(payload && payload.length > 0 && payload[0].payload && payload[0].payload.time) && <p className='label'>{`date : ${payload[0].payload.time}`}</p> }
          {
            payload.map((k, i) => {
              return (<p key={i} className='label'>{`${k.name} : ${parseFloat(k.value).toFixed(2)} mm/h`}</p>);
            })
          }

        </div>
      );
    }
    return null;
  }
};

CustomTooltipPrecipitation.propTypes = {
  payload: PropTypes.array
};

class CustomTooltipTemperature extends Component {
  render () {
    const { active } = this.props;

    if (active) {
      const { payload } = this.props;
      if (!payload) return (<div />);
      return (
        <div className='custom-tooltip'>
          {(payload && payload.length > 0 && payload[0].payload && payload[0].payload.time) && <p className='label'>{`date : ${payload[0].payload.time}`}</p> }
          {
            payload.map((k, i) => {
              return (<p key={i} className='label'>{`${k.name} : ${parseFloat(k.value).toFixed(2)} degrees Celsius`}</p>);
            })
          }

        </div>
      );
    }
    return null;
  }
};

CustomTooltipTemperature.propTypes = {
  payload: PropTypes.array
};
class TPCatchmentSelector extends Component {
  constructor (props) {
    super(props);

    this.hoverFeatureCallback = this.hoverFeatureCallback.bind(this);
    this.csvData = {};
    let csvJSON = (csv) => {
      var lines = csv.split('\n');
      var result = [];
      var headers = ['key', 'value']; // lines[0].split(';');
      for (var i = 2; i < lines.length; i++) {
        var obj = {};
        var currentline = lines[i].split(';');
        let hasData = true;
        for (var j = 0; j < headers.length; j++) {
          let col = currentline[j];
          if (!col) { hasData = false; col = ''; continue; }
          let value = col.trim().replaceAll('"', '').replaceAll(',', '.');
          // console.log('value' + headers[j], col, value);
          obj[headers[j]] = value;
        }
        if (hasData) result.push(obj);
      }
      return result;
    };
    let csvDataEntries = [
      { featureId:0, name:'Thames', variable: 'pr', key:'Thames_pr', csvFile:'tailoredproducts/catchments/Thames_CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_pr_1990-1999_polygon.txt' },
      { featureId:0, name:'Thames', variable: 'tas', key:'Thames_tas', csvFile:'tailoredproducts/catchments/Thames_CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_tas_1990-1999_polygon.txt' },
      { featureId:2, name:'MotolaStrom', variable: 'pr', key:'MotolaStrom_pr', csvFile:'tailoredproducts/catchments/MotolaStrom_CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_pr_1990-1999_polygon.txt' },
      { featureId:2, name:'MotolaStrom', variable: 'tas', key:'MotolaStrom_tas', csvFile:'tailoredproducts/catchments/MotolaStrom_CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_tas_1990-1999_polygon.txt' },
      { featureId:1, name:'Elbe', variable: 'pr', key:'Elbe_pr', csvFile:'tailoredproducts/catchments/Elbe_CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_pr_1990-1999_polygon.txt' },
      { featureId:1, name:'Elbe', variable: 'tas', key:'Elbe_tas', csvFile:'tailoredproducts/catchments/Elbe_CMIP5_EC-EARTH_Amon_historical_r12i1p1_T2Ms_tas_1990-1999_polygon.txt' }
    ]
    let fetchGeoJSON = () => {
      return new Promise((resolve, reject) => {
        axios({
          method: 'get',
          url: 'tailoredproducts/catchments/catchments.geojson',
          withCredentials: true,
          responseType: 'json'
        }).then(src => {
          if (src.data) {
            let geojson = src.data;
            for (let featureIndex = 0; featureIndex < geojson.features.length; featureIndex++) {
              const feature = geojson.features[featureIndex];
              const featureProps = feature.properties;
            };
            geojson.features.map((feature) => {
              const featureProps = feature.properties;
              featureProps['fill-opacity'] = 1.0;
              featureProps['stroke-width'] = 0.8;
              featureProps['fill'] = '#0077be';
              featureProps['fill-opacity'] = 0.25;
            });
            this.setState({ geojson: geojson });
            if (this.state.webMapJSInstance && this.state.webMapJSInstance) {
              this.state.webMapJSInstance.setProjection({ srs:'EPSG:3857', bbox:[-700000, 6000000, 2200000, 8400000] });
              this.state.webMapJSInstance.draw();
            }

            let getCatchmentData = new Promise((resolve, reject) => {
              for (let i = 0, p = Promise.resolve(); i < csvDataEntries.length; i++) {
                p = p.then(_ => new Promise(resolve => {
                  console.log('getting' + csvDataEntries[i].csvFile);
                  axios({
                    method: 'get',
                    url: csvDataEntries[i].csvFile,
                    withCredentials: true,
                    responseType: 'text'
                  }).then(src => {
                    if (src.data) {
                      this.csvData[csvDataEntries[i].key] = csvJSON(src.data);
                    }
                    resolve(csvDataEntries[i].key);
                  });
                }
                )).then(() => {
                  if (i === csvDataEntries.length - 1) {
                    resolve();
                  }
                });
              }
            }).then(() => {
              resolve();
            });
          }
        }).catch(error => {
          reject(error);
        });
      });
    };

    this.state = {
      dropdownOpen: false,
      dropDownValue: 'add',
      inputa: 10,
      inputb: 20,
      currentValue: 1960,
      changeValue: 1960,
      step: 1,
      min: 1960,
      max:1991,
      hoveredValue: '',
      featureIndex: -1,
      precipitationData:[],
      temperatureData:[]
    };

    fetchGeoJSON().then(() => {
      this.hoverFeatureCallback(0);
    })
  }

  /* kg m-2 s-1 to mm/h */
  extractPrecipValuesFromCSV (key) {
    let data = [];
    this.csvData[key].map((csvItem) => {
      data.push({ time:csvItem.key, value:parseFloat(csvItem.value) * 60 * 60 })
    });
    return data;
  }

  /* Kelvin to Celsius */
  extractTemperatureValuesFromCSV (key) {
    let data = [];
    this.csvData[key].map((csvItem) => {
      data.push({ time:csvItem.key, value:parseFloat(csvItem.value) - 272.15 });
    });
    return data;
  }

  hoverFeatureCallback (featureIndex) {
    if (this.state.geojson && featureIndex >= 0 && this.state.geojson.features[featureIndex] && this.state.geojson.features[featureIndex]) {
      if (featureIndex === 0) {
        this.setState({
          precipitationData:this.extractPrecipValuesFromCSV('Thames_pr'),
          temperatureData:this.extractTemperatureValuesFromCSV('Thames_tas'),
          catchmentName:'Thames'
        })
      }
      if (featureIndex === 1) {
        this.setState({
          precipitationData:this.extractPrecipValuesFromCSV('Elbe_pr'),
          temperatureData:this.extractTemperatureValuesFromCSV('Elbe_tas'),
          catchmentName:'Elbe'
        })
      }
      if (featureIndex === 2) {
        this.setState({
          precipitationData:this.extractPrecipValuesFromCSV('MotolaStrom_pr'),
          temperatureData:this.extractTemperatureValuesFromCSV('MotolaStrom_tas'),
          catchmentName:'MotolaStrom'
        })
      }
      this.setState({ hoveredValue:this.state.geojson.features[featureIndex].properties.value, featureIndex: featureIndex });
    }
  }

  render () {
    const getPrecipChart = (that) => {
      return (<LineChart width={that.state.rechartsWidth} height={that.state.rechartsHeight} data={that.props.data}>
        <XAxis dataKey='time' />
        <YAxis />
        <CartesianGrid stroke='#eee' strokeDasharray='5 5' />
        <Tooltip content={<CustomTooltipPrecipitation />} />
        <Line type='monotone' dataKey='value' stroke='#00F' />
      </LineChart>);
    };
    const getTemperatureChart = (that) => {
      return (<LineChart width={that.state.rechartsWidth} height={that.state.rechartsHeight} data={that.props.data}>
        <XAxis dataKey='time' />
        <YAxis />
        <CartesianGrid stroke='#eee' strokeDasharray='50 50' />
        <Tooltip content={<CustomTooltipTemperature />} />
        <Line type='monotone' dataKey='value' stroke='#0F0' />
      </LineChart>);
    };
    return (<div className='MainViewportNoOverflow' >
      <h1>Hydrology - catchment selector</h1>
      <Row>
        <div className='text' style={{ paddingBottom:'15px' }}>
        Impact models often require extraction of gridded data for irregular regions, typically defined by a shapefile. This is a tool for extracting gridded data for a user defined shapefile, here exemplified by three river catchments in Europe. The tool identifies grid points within the shapefile, or a representative point when no grid points are included, and outputs timeseries for selected variables. Here, a typical selection of daily temperature and precipitation time series are extracted as area averages for the shapefile. Outputs are available for download as either NetCDF or Excel format.
          &nbsp;Please check the <a href='/#/diagnostics/shapefile_selection'>shapefile selection metric</a> to calculate.
        </div>
      </Row>
      <Row>
        <Col xs='7'>
          <ADAGUCViewerComponent
            height={'60vh'}
            stacklayers
            baselayers={[new WMJSLayer({
              name: 'Klokantech_Basic_NL_NoLabels',
              title: 'World base layer Natural Earth ',
              type: 'twms',
              enabled: true
            }), new WMJSLayer({
              service: config.backendHost + '/wms?dataset=baselayers&',
              name:'overlay',
              format:'image/png',
              title:'World country borders',
              enabled: false,
              keepOnTop:true
            })]}
            controls={{ showprojectionbutton: false, showdownloadbutton: false }}
            webMapJSInitializedCallback={
              (webMapJSInstance) => {
                webMapJSInstance.enableInlineGetFeatureInfo(false);
                if (!this.state.initialized) {
                  this.setState({ webMapJSInstance:webMapJSInstance, initialized: true });
                  // this.state.webMapJSInstance.getLayers()[0].zoomToLayer();
                }
              }
            }
          />
          { this.state.initialized ? <AdagucMapDraw
            geojson={this.state.geojson}
            webmapjs={this.state.webMapJSInstance}
            dispatch={this.props.dispatch}
            actions={this.props.actions}
            hoverFeatureCallback={this.hoverFeatureCallback}
          /> : null }
        </Col>
        <Col xs='5'>
          <Row><b>Selected data for catchment {this.state.catchmentName}</b></Row>
          <Row style={{ height:'25vh' }}>

            <RechartsComponent data={this.state.precipitationData} type={'custom'} getCustom={getPrecipChart} />
          </Row>
          <Row>
            <Col>Precipitation in mm/h</Col>
          </Row>
          <Row><Col><hr /></Col></Row>
          <Row style={{ height:'25vh' }}>

            <RechartsComponent data={this.state.temperatureData} type={'custom'} getCustom={getTemperatureChart} />
          </Row>
          <Row>
            <Col>Temperature in degrees Celsius</Col>
          </Row>
        </Col>
      </Row>

    </div>);
  }
};

TPCatchmentSelector.propTypes = {
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
};

export default withRouter(TPCatchmentSelector);
