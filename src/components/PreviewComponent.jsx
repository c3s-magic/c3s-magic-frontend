import React, { Component } from 'react';
import PropTypes from 'prop-types';
import JsonTable from 'ts-react-json-table';
import ScrollArea from 'react-scrollbar';

export default class PreviewComponent extends Component {
  constructor (props) {
    super(props);
    this.state = {
      rows: null,
      columns: null
    };
    this.getFirstNDataFromCSV = this.getFirstNDataFromCSV.bind(this);
  }

  /**
   * Get the first N lines of text from a CSV file.
   * @param number The number of first lines you want to get.
   */
  getFirstNDataFromCSV (number) {
    /* Maybe not neccesary, but handy. */
    if (!this.props.file) return;
    let _this = this;

    const fullUrl = this.props.file + '?FORMAT=application/json&maxlines=' + number;

    fetch(fullUrl)
      .then((result) => {
        if (result.ok) {
          return result.json();
        } else {
          return null;
        }
      })
      .then((json) => {
      /* If null, leave it. */
        if (!json) return;
        /* Directly set the state. */
        _this.setState({ rows: json.rows, columns: json.columns });
      });
  }

  componentWillMount () {
    const { numberOfLinesDisplayed } = this.props;

    let numberOfLinesToDisplay;

    /* Set the number of lines to be displayed from property.
     * Else, set to default 1.
     * 1 means only showing the header + the 'noRowsMessage' property
     * in the JsonTable settings.
     */
    numberOfLinesDisplayed
      ? numberOfLinesToDisplay = numberOfLinesDisplayed
      : numberOfLinesToDisplay = 1; // Default is 1.

    this.getFirstNDataFromCSV(numberOfLinesToDisplay);
  }

  render () {
    if (!this.state.rows || !this.state.columns) return null;

    /* Setting for the JsonTable component. */
    const settingsJsonTable = {
      noRowsMessage: 'Error'
    };

    const { tableClassName, componentClassName } = this.props;

    return (
      <div className={componentClassName} >
        <ScrollArea speed={1} horizontal className={componentClassName} >
          <JsonTable
            rows={this.state.rows}
            settings={settingsJsonTable}
            className={tableClassName}
            columns={this.state.columns}
          />
        </ScrollArea>
      </div>);
  }
}

PreviewComponent.propTypes = {
  file: PropTypes.string.isRequired,
  tableClassName: PropTypes.string.isRequired,
  componentClassName: PropTypes.string.isRequired,
  numberOfLinesDisplayed: PropTypes.number
};
