import React, { Component } from 'react';
import PropTypes from 'prop-types';

class YoutubeVideo extends Component {
  componentWillMount () {
    // console.log("\n\nDEBUG Youtube:\n\n " + this.props.video);
    // console.log(this.props.video);
  }

  componentDidMount () {
  }

  render () {
    var videoSrc = 'https://www.youtube.com/embed/' +
      this.props.video + '?autoplay=' +
      this.props.autoplay + '&rel=' +
      this.props.rel + '&modestbranding=' +
      this.props.modest;
    return (
      <iframe className='youtubeplayer' type='text/html'
        src={videoSrc}
        frameBorder='0' allowFullScreen />
    );
  }
}

class DiagnosticPlot extends Component {
  render () {
    return (
      <div><img src={this.props.url} width='100%' height='100%' /></div>
    );
  }
}

export {
  YoutubeVideo,
  DiagnosticPlot
}
