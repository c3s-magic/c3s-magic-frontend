import React, { Component } from 'react';
import { Navbar, NavItem, Nav, NavLink } from 'reactstrap';
import PropTypes from 'prop-types';
import Icon from 'react-fa';

export default class MultiModelProductsMenu extends Component {
  render () {
    const { location } = this.props;
    var { pathname } = location;

    return (
      <div className='TitleComponent'>
        <Navbar style={{ backgroundColor:'#941333', color:'white', height:'38px', textAlign: 'center' }} className='navbar-static-top'>
          <Nav>
            <NavItem>
              <NavLink href='#/multimodelproducts/home' active={pathname === '/multimodelproducts/home'} >
                Multi model products
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/multimodelproducts/futureclimate' active={pathname === '/multimodelproducts/futureclimate'} >
                Future climate
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/multimodelproducts/subensembleselections' active={pathname === '/multimodelproducts/subensembleselections'} >
                <Icon name='' />
                Sub ensemble selections
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href='#/multimodelproducts/estimateofagreement' active={pathname === '/multimodelproducts/estimateofagreement'} >
                <Icon name='' />
                Estimate of Agreement
              </NavLink>
            </NavItem>

          </Nav>
        </Navbar>
      </div>);
  }
}

MultiModelProductsMenu.propTypes = {
  location: PropTypes.object
};
