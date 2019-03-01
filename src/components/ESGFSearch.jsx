import React, { Component } from 'react';
import { Row } from 'reactstrap';

export default class ESGFSearch extends Component {
  constructor () {
    super();
  }
  render () {
    return (
      <div className='MainViewportNoOverflow' style={{ display:'flex' }}>
        <Row style={{ paddingRight:'20px' }}>
          <p>The Metrics and Diagnostics in this portal can be used to asses the quality and applicability of climate projection data, as part of <a href='https://cmip.llnl.gov/cmip5/' target='_blank'>CMIP5.</a> In the <a href='https://cds.climate.copernicus.eu/' target='_blank'>Climate Data Store</a> a quality controlled subset of CMIP5 is provided by the <a href='https://cp4cds-qcapp.ceda.ac.uk/' target='_blank'>CP4CDS project.</a>
            <br />
            This search interface connects to the <a href='https://cp4cds-index1.ceda.ac.uk/projects/cp4cds_ceda/' target='_blank'>CP4CDS infrastructure</a>, and allows for exploration, viewing, and downloading of the data provided by the CP4CDS project.</p>
        </Row>
        <Row style={{ flex:2, border: '1px solid #DDD' }}>
          <iframe className='esgfsearchframe' type='text/html'
            src={'https://portal.c3s-magic.eu/esgfsearch/esgfsearch.html#'}
            frameBorder='0' allowFullScreen />
        </Row>
      </div>);
  }
}
