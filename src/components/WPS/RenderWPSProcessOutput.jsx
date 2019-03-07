import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, CardBody, CardText, CardLink, CardTitle } from 'reactstrap';

import ClickableImage from '../ClickableImage';
import YMLViewer from './YMLViewer';
import JSONViewer from './JSONViewer';
import TXTViewer from './TXTViewer';
import SVGViewer from './SVGViewer';
import ADAGUCViewerComponent from '../ADAGUCViewerComponent';
import Icon from 'react-fa';

export default class RenderWPSProcessOutput extends Component {
  render () {
    const { processOutput, url, identifier, title, abstract } = this.props;
    let myProcessOutput = processOutput;
    if (!processOutput) {
      myProcessOutput = {
        Identifier:{
          value:identifier || '<value>'
        },
        Title:{
          value:title || '<title>'
        },
        Abstract:{
          value:abstract || '<abstract>'
        },
        Reference:{
          attr:{
            href:url
          }
        }
      };
    }
    let output = {
      identifier: null,
      title: '<no title>',
      abstract: '<no abstract>',
      data: null,
      imageLink: null,
      reference: null,
      esmRecipe: null,
      txtViewer:null,
      netcdfOpenDAP: null,
      svgViewer: null
    };
    if (myProcessOutput && myProcessOutput.Identifier && myProcessOutput.Identifier.value) { output.identifier = myProcessOutput.Identifier.value; }
    if (output.identifier === null) {
      return null;
    }
    if (myProcessOutput && myProcessOutput.Title && myProcessOutput.Title.value) { output.title = myProcessOutput.Title.value; }
    if (myProcessOutput && myProcessOutput.Abstract && myProcessOutput.Abstract.value) { output.abstract = myProcessOutput.Abstract.value; }
    /* Parse literaldata */
    if (myProcessOutput && myProcessOutput.Data !== undefined && myProcessOutput.Data !== null) {
      if (myProcessOutput.Data.LiteralData && myProcessOutput.Data.LiteralData.value) {
        output.data = myProcessOutput.Data.LiteralData.value;
      }
    }

    /* Parse referenced data */
    if (myProcessOutput && myProcessOutput.Reference) {
      if (myProcessOutput.Reference.attr && myProcessOutput.Reference.attr.href) {
        output.reference = myProcessOutput.Reference.attr.href;
        /* Check if is image */
        if (output.reference.endsWith('.png')) {
          output.imageLink = output.reference;
        }
        /* Check if is esmvaltool recipe */
        if (output.reference.endsWith('.yml')) {
          output.esmRecipe = output.reference;
        }
        /* Check if is JSON */
        if (output.reference.endsWith('.json') || output.reference.endsWith('.wpssettings')) {
          output.jsonViewer = output.reference;
        }
        /* Check if this is a textfile */
        if (output.reference.endsWith('.txt')) {
          output.txtViewer = output.reference;
        }
        /* Check if this is a NetCDF file served over opendap */
        if (output.reference.endsWith('.nc')) {
          output.netcdfOpenDAP = output.reference;
        }
        /* Check if this is a svg file */
        if (output.reference.endsWith('.svg')) {
          output.svgViewer = output.reference;
        }
      }
    }
    const isSuccess = output.identifier === 'success' ? output.data === 'True' ? true : (output.data === 'False' ? false : undefined) : undefined;
    let className = 'RenderWPSProcessOutput_CardBody';
    if (isSuccess === true) className = 'RenderWPSProcessOutput_CardBody_Success';
    if (isSuccess === false) className = 'RenderWPSProcessOutput_CardBody_NoSuccess';
    return (<div key={output.identifier}>
      <Card className={className}>
        <CardBody>
          <CardTitle>{output.title}&nbsp;<span style={{ color:'darkgrey', fontStyle:'italic' }}>-&nbsp;({output.identifier})</span></CardTitle>
          <CardText>{output.abstract}</CardText>
        </CardBody>
        <CardBody>
          { output.data && (<CardText>{output.data}</CardText>) }
          { output.imageLink && (<Row>
            <Col xs='10'><div style={{ maxHeight:'250px', overflow: 'hidden', width: '50%' }}><ClickableImage src={output.imageLink} /></div></Col>
            {/* <Col><Button color='secondary' onClick={() =>{ this.props.resultClickCallback(output.imageLink);}}>Open image</Button></Col> */}
          </Row>)
          }
          { output.esmRecipe && (<Row><Col xs='10'><YMLViewer url={output.esmRecipe} /></Col></Row>) }
          { output.jsonViewer && (<Row><Col xs='10'><JSONViewer url={output.jsonViewer} /></Col></Row>) }
          { output.txtViewer && (<Row><Col xs='10'><TXTViewer url={output.txtViewer} /></Col></Row>) }
          { output.svgViewer && (<Row><Col xs='12'><SVGViewer url={output.svgViewer} /></Col></Row>) }
          { output.netcdfOpenDAP && (<Row><Col xs='10'>
            <ADAGUCViewerComponent
              height={'300px'}
              layers={[]}
              controls={{
                showprojectionbutton: true,
                showlayerselector: true,
                showtimeselector: true,
                showstyleselector: true
              }}
              parsedLayerCallback={(layer, webMapJSInstance) => {
                // console.log('webMapJSInstance', webMapJSInstance);
                layer.zoomToLayer();
                webMapJSInstance.draw();
              }}
              dapurl={output.netcdfOpenDAP}
            />

          </Col></Row>) }
          { output.reference && <CardLink href={output.reference} target='_blank'><Icon name='download' /> Download</CardLink> }
        </CardBody>
      </Card>
    </div>);
  }
};
RenderWPSProcessOutput.propTypes = {
  processOutput:PropTypes.object,
  url:PropTypes.string,
  identifier:PropTypes.string,
  title:PropTypes.string,
  abstract:PropTypes.string
};
