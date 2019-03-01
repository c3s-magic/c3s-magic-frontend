
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { XAxis, YAxis, Tooltip, CartesianGrid, LabelList, ScatterChart, Scatter, Cell, Line, LineChart } from 'recharts';
import { Button, Row, Col, Alert } from 'reactstrap';

const colors = ['#e6194b', '#f58231', '#911eb4', '#f032e6', '#d2f53c', '#fabebe', '#008080',
  '#e6beff', '#aa6e28', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000080', '#808080', '#000000'];

class CustomTooltip extends Component {
  render () {
    const { active } = this.props;

    if (active) {
      const { payload } = this.props;
      return (
        <div className='custom-tooltip'>
          {
            payload.map((k, i) => {
              return (<p key={i} className='label'>{`${k.name} : ${k.value}`}</p>);
            })
          }
          <p className='label'>{`${'model'} : ${payload[0].payload.model}`}</p>
        </div>
      );
    }

    return null;
  }
};

CustomTooltip.propTypes = {
  payload: PropTypes.array
};

export default class RechartsComponent extends Component {
  constructor (props) {
    super(props);

    this.loaddap = this.loaddap.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getScatterChart = this.getScatterChart.bind(this);
    this.getLineChart = this.getLineChart.bind(this);

    this.state = {
      scatterdata: { tas:[], tas_0:[] },
      // dataurl:'https://portal.c3s-magic.eu/backend/adagucopendap/recipe_flato13ipcc_20180825_091035%2Fwork%2Ffig09-42a%2Ffig09-42a%2Fch09_fig09-42a.nc',
      dataurl: this.props.dapurl,
      data: this.props.data,
      error:'',
      rechartsWidth:400,
      rechartsHeight:400
    };
    this.resize = this.resize.bind(this);
    this._handleWindowResize = this._handleWindowResize.bind(this);
  }
  _handleWindowResize () {
    this.resize();
  }

  componentDidMount () {
    this.loaddap();
    this.resize();
    window.addEventListener('resize', this._handleWindowResize);
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this._handleWindowResize);
  }

  loaddap () {
    if (!this.state.dataurl || this.state.dataurl.length <= 0) return;
    this.setState({ scatterdata: { tas: [], tas_0: [] }, error: '' });
    fetch(this.state.dataurl + '.dods', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then((response) => {
      let contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      throw new TypeError('Oops, we haven\'t got JSON!');
    })
      .catch(error => {
        throw error;
      }).then(data => {
      // console.log(data);
        let tas = [];
        data.data.tas.map((d, i) => {
          tas.push({ y: data.data.tas[i], x: data.data.ecs[i], model: data.data.models[i].trim() });
        });
        let tas0 = [];
        data.data.tas.map((d, i) => {
          tas0.push({ y: data.data.tas_0[i], x: data.data.ecs[i], model: data.data.models[i].trim() });
        });
        this.setState({ scatterdata: { tas: tas, tas_0: tas0 } });
      }).catch(error => {
        console.log(error);
        if (error.toString) {
          this.setState({ error: error.toString() });
        } else {
          this.setState({ error: JSON.stringify(error, null, 2) });
        }
      });
  }

  handleChange (event) {
    this.setState({ dataurl: event.target.value });
  }

  handleSubmit (event) {
    event.preventDefault();
    this.loaddap();
  }

  handleToolTip (event) {

  }

  resize () {
    const element = this.refs.rechartscontainer;
    if (element) {
      this.setState({ rechartsWidth: parseInt(element.clientWidth), rechartsHeight: parseInt(element.clientHeight) });
    }
  }
  getScatterChart () {
    return (<ScatterChart width={this.state.rechartsWidth} height={this.state.rechartsHeight} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
      <XAxis label={{ value: 'ECS /°C', angle: 0, position: 'insideBottomRight', offset: 0 }} type='number' dataKey={'x'} name='ecs' unit=''
        domain={[dataMin => Math.round(dataMin * 0.9), dataMax => Math.round(dataMax * 1.2)]}
      />
      <YAxis label={{ value: 'TAS /°C', angle: -90, position: 'insideLeft' }} type='number' dataKey={'y'} name='tas' unit=''
        domain={[dataMin => Math.floor(dataMin * 1), dataMax => Math.ceil(dataMax * 1)]}
      />
      <CartesianGrid />
      <Tooltip content={<CustomTooltip />} />
      <Scatter name='tas' data={this.state.scatterdata.tas} fill='#8884d8' shape='triangle' >
        {
          this.state.scatterdata.tas.map((entry, index) => {
            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
          })
        }
        <LabelList dataKey='model' position='right' />
      </Scatter>
      <Scatter name='tas_0' data={this.state.scatterdata.tas_0} fill='#8884d8' shape='star'>
        {
          this.state.scatterdata.tas_0.map((entry, index) => {
            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
          })
        }
        <LabelList dataKey='model' position='right' />
      </Scatter>
    </ScatterChart>);
  }
  getLineChart () {
    return (<LineChart width={this.state.rechartsWidth} height={this.state.rechartsHeight} data={this.props.data}>
      <XAxis dataKey='name' />
      <YAxis />
      <CartesianGrid stroke='#eee' strokeDasharray='5 5' />
      <Line type='monotone' dataKey='temperature' stroke='#8884d8' />
      <Line type='monotone' dataKey='precipitation' stroke='#82ca9d' />
    </LineChart>);
  }
  render () {
    // console.log(this.state);

    let chartType = 'scatter_1';

    if (this.props.type) {
      chartType = this.props.type;
    }

    return (
      <div className='RechartsComponent' style={{ height:'100%', width:'100%', border:'none', display:'block', overflow:'hidden' }}>
        {/* <Row>
          { <Col xs='10'>
            <input style={{ width:'100%' }} type='text' name='name' value={this.state.dataurl} onChange={this.handleChange} />
          </Col> }
          <Col xs='1'>
            <Button color='primary' onClick={this.handleSubmit}>Refresh</Button>
          </Col>
        </Row> */}
        { this.state.error && this.state.error.length > 0 ? (<Alert style={{ margin: '10px' }} color='danger'>{this.state.error.replace('\n', '<br />')}</Alert>)
          : (<div className='RechartsArea' ref={(container) => { this.container = container; }}
            style={{ height:'100%', width:'100%', border:'none', display:'block', overflow:'hidden' }} >
            <div ref='rechartscontainer' style={{
              minWidth:'inherit',
              minHeight:'inherit',
              width: 'inherit',
              height: 'inherit',
              overflow: 'hidden',
              display:'block',
              border: 'none'
            }}>
              <div style={{ overflow: 'visible' }} >
                { chartType === 'scatter_1' && this.getScatterChart() }
                { chartType === 'linechart_1' && this.getLineChart() }
                { chartType === 'custom' && this.props.getCustom(this) }
              </div>
            </div>
          </div>)
        }
      </div>);
  }
}

RechartsComponent.propTypes = {
  dapurl: PropTypes.string,
  data: PropTypes.array,
  type: PropTypes.string,
  getCustom: PropTypes.func
};
