import React, { Component } from 'react';
import MarkdownFromFile from './MarkdownFromFile';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Row, Col } from 'reactstrap';
import Icon from 'react-fa';
import ADAGUCViewerComponent from '../components/ADAGUCViewerComponent';
export default class AdagucViewerContainer extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    let wmsDataServer = config.staticWMS;// 'https://portal.c3s-magic.eu/backend/wms';
    this.state = {
      datasets: [
        {
          wmsurl:wmsDataServer + '?DATASET=WP4-6_ISAC_hyint&',
          name:'WP4-6_ISAC_hyint',
          title:'WP4-6_ISAC_hyint'
        }, {
          wmsurl:wmsDataServer + '?DATASET=WP4-6_ISAC_miles&',
          name:'WP4-6_ISAC_miles',
          title:'WP4-6_ISAC_miles'
        }, /* {
        wmsurl:wmsDataServer + '?DATASET=WP4-6_ISAC_zmnam&',
        name:'WP4-6_ISAC_zmnam',
        title:'WP4-6_ISAC_zmnam'
      }, */{
          wmsurl:wmsDataServer + '?DATASET=WP4_BSC_Modes of variability&',
          name:'WP4_BSC_Modes_of_variability',
          title:'WP4_BSC_Modes_of_variability'
        }, {
          wmsurl:wmsDataServer + '?DATASET=WP4_ISAC_quantilebias&',
          name:'WP4_ISAC_quantilebias',
          title:'WP4_ISAC_quantilebias'
        }, {
          wmsurl:wmsDataServer + '?DATASET=WP5_ISAC_ensclus&',
          name:'WP5_ISAC_ensclus',
          title:'WP5_ISAC_ensclus'
        }, /* {
        wmsurl:wmsDataServer + '?DATASET=WP6_BSC_COMBINATION_AND_AREA_AVERAGING&',
        name:'WP6_BSC_COMBINATION_AND_AREA_AVERAGING',
        title:'WP6_BSC_COMBINATION_AND_AREA_AVERAGING'
      }, */{
          wmsurl:wmsDataServer + '?DATASET=WP6_ISAC_teleconnection&',
          name:'WP6_ISAC_teleconnection',
          title:'WP6_ISAC_teleconnection'
        }, {
          wmsurl:wmsDataServer + 'source=c3smagic%2FWP6_KNMI_Correlations%2Fclimexp_correlate_output.nc&',
          name:'WP6_KNMI_correlations',
          title:'WP6_KNMI_correlations'
        }, {
          wmsurl:wmsDataServer + '?DATASET=WP7_BSC_ACI_Components&',
          name:'WP7_BSC_ACI_Components',
          title:'WP7_BSC_ACI_Components'
        }, {
          wmsurl:wmsDataServer + '?DATASET=WP7_BSC_Energy',
          name:'WP7_BSC_Energy',
          title:'WP7_BSC_Energy'
        }, {
          wmsurl:wmsDataServer + '?DATASET=WP7-drought_indicator',
          name:'WP7-drought_indicator',
          title:'WP7-drought_indicator'
        }, /* {
        wmsurl:wmsDataServer + '?DATASET=WP7_shapefileselector',
        name:'WP7_shapefileselector',
        title:'WP7_shapefileselector'
      }, */{
          wmsurl:wmsDataServer + '?DATASET=WP7_ISAC_rainfarm',
          name:'WP7_ISAC_rainfarm',
          title:'WP7_ISAC_rainfarm'
        }, {
          wmsurl:wmsDataServer + '?source=c3smagic%2FWP7-surge_estimator%2Fsurge_heights_EC-Earth_s01r14_20131201-20140131.nc&',
          name:'WP7_surge_estimator',
          title:'WP7_surge_estimator'
        }
      ],
      datasetIndex:0,
      dropdownOpen: {}
    }
  }

  toggle (id) {
    let dropDownOpen = Object.assign({}, { ...this.state.dropdownOpen });
    dropDownOpen[id] = !dropDownOpen[id];
    this.setState({
      dropdownOpen: dropDownOpen
    });
  }

  render () {
    return (
      <div className='MainViewport'>
        <Row>
          <Col xs='3'>Dataset:</Col><Col xs='1'><Dropdown
            isOpen={this.state.dropdownOpen['datasets']}
            toggle={() => { this.toggle('datasets'); }}
          >
            <DropdownToggle caret>
              <Icon name='globe' />&nbsp;{this.state.datasets[this.state.datasetIndex].title || 'Map projection'}
            </DropdownToggle>
            <DropdownMenu>
              {
                this.state.datasets.map((dataset, index) => {
                  return (<DropdownItem key={index} onClick={(event) => {
                    this.setState({ datasetIndex: index });
                  }
                  }>{dataset.title}</DropdownItem>);
                })
              }
            </DropdownMenu>
          </Dropdown>
          </Col>
        </Row>
        <Row>
          <ADAGUCViewerComponent
            height={'40vh'}
            layers={[]}
            controls={{
              showprojectionbutton: true,
              showlayerselector: true,
              showtimeselector: true,
              showstyleselector: true
            }}
            parsedLayerCallback={(layer, webMapJSInstance) => {
              // console.log(webMapJSInstance);
              layer.zoomToLayer();
              webMapJSInstance.draw();
            }}
            wmsurl={this.state.datasets[this.state.datasetIndex].wmsurl}
          />
        </Row>
        <Row>
          <Col xs='8'>
            <div className='text'>
              <span>Our advanced adaguc viewer is available for expert users to browse and inspect available datasets. There you can combine different layers and change their styling individually. It allows you to view and set other NetCDF dimensions, like elevation, member, ensemble and threshold.
                To browse our datasets, first click on the big gear and then on the AutoWMS menu. On the right pane you can explore our datasets.
                Open it <a href={config.adagucViewerURL} target='_blank'>here </a>.
              </span>
            </div>
          </Col>
        </Row>

      </div>);
  }
}
