
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge, Container, Row, Col, Card, CardImg, CardText, CardSubtitle, CardBody } from 'reactstrap';
import { getConfig } from '../../getConfig';
let config = getConfig();
const YAML = require('yamljs');
// var $RefParser = require('json-schema-ref-parser');

export default class DiagnosticsHome extends Component {
  constructor (props) {
    super(props);
    this.state = {
      diagList: [],
      overview: true,
      selectedPageYaml: '',
      selectedPageId: ''
    };
    this.switchOverview = this.switchOverview.bind(this);
    this.getTags = this.getTags.bind(this);
    this.getCard = this.getCard.bind(this);
    this.clickEvent = this.clickEvent.bind(this);
  }

  switchOverview () {
    this.setState({ overview: !this.state.overview });
  }

  clickEvent (item) {
    this.setState({ selectedPageYaml: item.info_file, selectedPageId: item.id });
    this.context.router.push('/diagnostics/' + item.name);
  }

  getTags (item) {
    var tagList = [];
    for (var key in item.tags) {
      if (item.tags.hasOwnProperty(key)) {
        tagList.push(item.tags[key]);
      }
    }
    var tagBadges = tagList.map(function (name) {
      return (<Badge
        key={name}
        style={{ fontSize: '15px', marginLeft: '10px', marginTop: '10px', backgroundColor: '#921A36' }}
        color='success'>{name}</Badge>);
    });
    return <div style={{ }}> {tagBadges} </div>;
  }

  getCard (item) {
    var tagList = this.getTags(item);

    return (
      <div key={item.id} className='diagCard' >

        <Card key={item.id}
          onClick={() => this.clickEvent(item)}
          body className='text-left' outline color='primary'
          style={{ backgroundColor: '#ffffff', borderColor: '#921A36', borderWidth: '2px', marginBottom: '30px', overflowX: 'auto' }}
        >

          <CardBody key={item.id}>
            <Row key={item.id} style={{ height: 'inherit' }}>
              <Col key={item.id}>
                <CardBody>
                  <h4 style={{ fontSize: '25px', color:'#921A36', textAlign: 'center', marginTop: '25px' }}> {item.title} </h4>
                  <CardSubtitle style={{ marginTop: '20px' }}> {item.sub_title} </CardSubtitle>
                </CardBody>

                <CardText> {item.info_text} </CardText>
                <Row>
                  <div>
                    {tagList}
                  </div>
                </Row>
              </Col>
              <Col style={{ minHeight:'200px', border:'1px solid #FFF', margin:'1px', padding:'1px', display: 'grid' }}>
                <CardImg style={{ width: '350px', display:'block', height:'auto' }} src={item.image_file} />
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    );
  }

  componentDidMount () {
    fetch('diagnosticsdata/index.yml').then((response) => {
      return response.text().then((text) => {
        text = text.replace('{DATAURL}', config.dataURL);
        text = text.replace('{STATICWMS}', config.staticWMS);
        this.setState({ diagList: YAML.parse(text).diagnostics, readSuccess: true });
      });
    });
  }

  componentWillMount () {
  }

  componentDidUpdate () {
  }

  render () {
    var diagList = this.state.diagList;
    var diagOverviewList = [];
    var that = this;
    Object.keys(diagList).forEach(function (key, i) {
      diagOverviewList.push(that.getCard(diagList[key]));
    });

    if (this.props.params && diagList.length !== 0) {
      if (diagList[that.props.params.diag]) {
        this.state.overview = false;
      }
    }
    return (
      <div className='vspace2em'>
        <Container>
          <Row>
            <Col sm='12'>
              {diagOverviewList}
            </Col>
          </Row>
        </Container>

      </div>
    );
  }
}

DiagnosticsHome.contextTypes = {
  router: PropTypes.object.isRequired
};

DiagnosticsHome.propTypes = {
  params: PropTypes.object
};
