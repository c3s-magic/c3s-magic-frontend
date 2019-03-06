import React from 'react';
import { slide as Menu } from 'react-burger-menu';
import PropTypes from 'prop-types';
import Icon from 'react-fa';

export default props => {

  return (
    <Menu>

      <p style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: '10px' }}>
        <a href='http://www.copernicus.eu/' style={{ marginBottom: '10px' }} >
          <img alt='' src='./sites/default/files/copernicus-logo.png' style={{ marginRight: '40px', width: '187px', height: '69px' }} />
        </a>
        <a href='/'>
          <img alt='' src='./sites/default/files/repository/website-structure/c3s-logo.png' style={{ width: '236px', height: '69px' }} />
        </a>
      </p>


      <a className='menu-item' href='#/'>
        Home
      </a>

      <a className='menu-item' href='#/tailoredproducts'>
        Tailored products
      </a>

      <a className='menu-item' href='#/diagnostics'>
        Diagnostics
      </a>

      <a className='menu-item' href='#/calculate/'>
        Calculate
      </a>

      <a className='menu-item' href='#/esgfsearch'>
        Search
      </a>

      <a className='menu-item' href='#/about'>
        About
      </a>

    </Menu>
  );
};
