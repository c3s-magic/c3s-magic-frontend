import React, { Component } from 'react';
import { getConfig } from '../getConfig';

import { Col, Row, Navbar, NavItem, Nav, NavLink, Button } from 'reactstrap';
import PropTypes from 'prop-types';
// import MSPLogo from '../components/assets/dsp_logo.svg';
import Icon from 'react-fa';
let config = getConfig();

export default class TitleComponent extends Component {
  constructor () {
    super();
    this.canRender = this.canRender.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.parseGetId = this.parseGetId.bind(this);
  }

  componentDidMount () {
    this.canRender();
  }

  componentWillUpdate () {
    // this.canRender();
  }

  render () {
    const { clientId, location } = this.props;
    var { pathname } = location;

    if (!pathname) pathname = '';

    return (
      <div className='TitleComponent'>
        <Navbar dark >
          <Row className='navbar-header-c3s'>
            <Col className='welcomeSign'>
              <p style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: '10px' }}>
                <a href='http://www.copernicus.eu/'>
                  <img alt='' src='./sites/default/files/copernicus-logo.png' style={{ marginRight: '40px', width: '187px', height: '69px' }} />
                </a>
                <a href='/'>
                  <img alt='' src='./sites/default/files/repository/website-structure/c3s-logo.png' style={{ width: '236px', height: '69px' }} />
                </a>
              </p>
            </Col>
            <Col xs='auto' className='signInOffButton'>
              <Button color='success' href='https://goo.gl/forms/AaQf8yoRjWAMh8T22' target='_blank'>Feedback</Button>
            </Col>
            {
              clientId !== null
                ? <Col xs='auto' className='signInOffButton'>
                  <Button href='#/account'>Account</Button>
                </Col> : null
            }
            {
              clientId !== null ? (

                <Col xs='auto' className='signInOffButton'>
                  <Button color='primary' onClick={this.logout}><Icon name='sign-out' />&nbsp;Sign out</Button>
                </Col>
              )
                : <Col xs='auto' className='signInOffButton'>
                  <Button onClick={this.login}><Icon name='sign-in' />&nbsp;Sign in</Button>
                </Col>
            }

          </Row>
        </Navbar>
        <Navbar style={{ backgroundColor: '#941333', color: 'white', height: '38px', textAlign: 'center' }} className='navbar-static-top'>
          <Nav>
            <NavItem>
              <NavLink href='#/' active={pathname === '/'} >Home</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/tailoredproducts' active={pathname === '/tphome' || pathname.indexOf('/tailored') !== -1} >Tailored Products</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/diagnostics' active={pathname === '/diagnostics' || pathname.indexOf('/diagnostics') !== -1} >Metrics &amp; Diagnostics</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/calculate/' active={pathname === '/calculate/'} >Calculate</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/esgfsearch' active={pathname === '/esgfsearch'} >Explore Data</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/about' active={pathname === '/about'} >About</NavLink>
            </NavItem>
            { /* <NavItem>
              <NavLink href='#/interactivecharts' active={pathname === '/interactivecharts'} >Charts</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/adagucviewer' active={pathname === '/adagucviewer'} >Data viewer</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/basket' active={pathname === '/basket'}><Icon name='shopping-basket' /> Basket</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/jobs' active={pathname === '/jobs'}><Icon name='list' /> Joblist</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/account' active={pathname === '/account'}><Icon name='user-o' /> Account</NavLink>
            </NavItem> */ }

          </Nav>
        </Navbar>
        { /* <Navbar style={{ backgroundColor:'#941333', color:'white', height:'38px', textAlign: 'center' }} className='navbar-static-top'>
          <Nav>
            <NavItem>
              <NavLink href='#/' active={pathname === '/'} ><Icon name='home' /> Home</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/diagnostics' active={pathname.startsWith('/diagnostics')} ><Icon name='' /> Diagnostics</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/metrics/home' active={pathname.startsWith('/metrics')} ><Icon name='' /> Metrics</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/multimodelproducts/home' active={pathname.startsWith('/multimodelproducts')} ><Icon name='' /> Multi Model Products</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/timeseries/home' active={pathname.startsWith('/timeseries')} ><Icon name='' /> Timeseries</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/tailoredproducts/home' active={pathname.startsWith('/tailoredproducts')} ><Icon name='' /> Tailored products</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/system/home' active={pathname.startsWith('/system')} ><Icon name='' /> System</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/demo' active={pathname === '/demo'}><Icon name='gears' /> Demo</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/actuaries' active={pathname === '/actuaries'}><Icon name='gears' /> Actuaries index</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/knmi_climexp_correlate' active={pathname === '/knmi_climexp_correlate'}><Icon name='gears' /> Correlate</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/basket' active={pathname === '/basket'}><Icon name='shopping-basket' /> Basket</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/joblist' active={pathname === '/joblist'}><Icon name='list' /> Joblist</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/account' active={pathname === '/account'}><Icon name='user-o' /> Account</NavLink>
            </NavItem>
          </Nav>
        </Navbar> */ }
      </div>);
  }

  parseGetId (getIdJSON, actions, dispatch) {
    if (getIdJSON.error) {
      console.log('Not signed in');
      dispatch(actions.setAccessToken(null));
      dispatch(actions.setClientId(null));
      dispatch(actions.setEmailAddress(null));
      dispatch(actions.setBackend(null));
      dispatch(actions.setCompute(null));
    } else {
      console.log(getIdJSON);
      dispatch(actions.setAccessToken(getIdJSON.services_access_token));
      dispatch(actions.setClientId(getIdJSON.id));
      dispatch(actions.setEmailAddress(getIdJSON.email_address));
      dispatch(actions.setBackend(getIdJSON.backend));
      dispatch(actions.setCompute(getIdJSON.compute));
    }
  }

  canRender () {
    const { dispatch, actions } = this.props;
    const { backendHost } = config;
    fetch(backendHost + '/getid', {
      credentials: 'include'
    }).then(function (response) {
      return response.json();
    }).then(json => {
      this.parseGetId(json, actions, dispatch);
    }).catch(e => {
      /* Try without credentials, this will allow cors which enables talking with the backend */
      fetch(backendHost + '/getid', {
      }).then(function (response) {
        return response.json();
      }).then(json => {
        this.parseGetId(json, actions, dispatch);
      });
    });
  }

  login () {
    const { backendHost } = config;
    let currentLocation = window.location;
    window.location.assign(backendHost + '/oauth?provider=ceda&returnurl=' + encodeURIComponent(currentLocation));
  }

  logout () {
    const { backendHost } = config;
    fetch(backendHost + '/logout', {
      credentials: 'include'
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        this.canRender();
      });
  }
}

TitleComponent.propTypes = {
  // accessToken: PropTypes.string,
  // emailAddress: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  clientId: PropTypes.string,
  // domain: PropTypes.string,
  location: PropTypes.object,
  actions: PropTypes.object
};
