
import React, { Component } from 'react';
import MarkdownFromFile from './MarkdownFromFile';
// import EnsembleAnomalyPlots from '../containers/Diagnostics/EnsembleAnomalyPlots';
import ADAGUCViewerComponent from '../components/ADAGUCViewerComponent';
import { Row, Col } from 'reactstrap';

const wmsurl = 'https://portal-dev.c3s-magic.eu/backend/adagucserver?source=c3smagic%2Frecipes%2Frecipe_cvdp_20190306_155022%2Fpreproc%2Fdiagnostic1%2Fpr%2FCMIP5_MPI-ESM-LR_Amon_historical_r1i1p1_T2Ms_pr_2000-2002.nc&&service=WMS&request=GetCapabilities';

export default class WP1Home extends Component {
  render () {
    return (
      <div className='MainViewportNoOverflow' style={{ display:'flex', flexDirection:'column' }}>
        <Row>
          <Col xs='2' />
          <Col xs='8'>
            <MarkdownFromFile url={'/contents/Home.md'} />
          </Col>
          <Col xs='2' />
        </Row>
        <Row style={{ flex:2 }}>
          <Col xs='2' />
          <Col xs='8' style={{ display:'flex', flexDirection:'column' }}>
            {/* <EnsembleAnomalyPlots showSlider map_data={'https://portal.c3s-magic.eu/backend/wms?DATASET=anomaly_agreement_stippling&'} /> */}
            <ADAGUCViewerComponent
              height={'40vh'}
              layers={['pr']}
              controls={{
                showprojectionbutton: false,
                showlayerselector: false,
                showtimeselector: false,
                showstyleselector: false
              }}
              webMapJSInitializedCallback={(webMapJSInstance, appendOrRemove) => {
                let nextAnimationStepEvent = (map) => {
                  try {
                    if (webMapJSInstance) webMapJSInstance.setTimeOffset(map.getDimension('time').currentValue);
                  } catch (e) {
                  }
                };
                webMapJSInstance.addListener('onnextanimationstep', nextAnimationStepEvent, true);
                webMapJSInstance.baseLayers[0].enabled = false;
              }}
              parsedLayerCallback={(layer, webMapJSInstance) => {
                // console.log(webMapJSInstance);
                webMapJSInstance.setProjection('EPSG:54030');
                layer.setStyle('auto/bilinear');
                layer.zoomToLayer();
                layer.getlegendgraphicURL = null;
                webMapJSInstance.displayLegendInMap(false);
                try {
                  let timeDim = layer.getDimension('time');
                  let animationDates = [];
                  for (let j = 0; j < timeDim.size(); j++) {
                    animationDates.push({ name: 'time', value: timeDim.getValueForIndex(j) });
                  }
                  webMapJSInstance.stopAnimating();
                  webMapJSInstance.setAnimationDelay(500);
                  webMapJSInstance.draw(animationDates);
                } catch (e) {
                  console.log(e);
                  webMapJSInstance.draw();
                }
              }}
              wmsurl={wmsurl}
            />
          </Col>
          <Col xs='2' />
        </Row>
      </div>);
  }
}

/*

WP4 - Metrics
 - Mean state
 - Climate variability
 - Extreme events

WP5 - MMP
 - Sub ensemble selections
 - Future climate

WP6 - Timeseries
 - Indices on area averages
 - Spatio temporal analyses
 - Correlations

 WP7 - Tailored products
 - User consultations
 - Coastal areas
 - Water / Hydrology
 - Energy
 - Insurance

 */
