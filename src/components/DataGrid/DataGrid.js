import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import FloatingCell from './FloatingCell'
import DataGridSheet from './DataGridSheet'

const InnerContaier = styled.div`
  height: 100%;
  position: relative;
`

class DataGrid extends React.Component {
  renderFloatingCell () {
    const { rowHeaders, columnHeaders, floatingCellPosition } = this.props
    if (!floatingCellPosition) return null

    return (
      <FloatingCell
        numRows={rowHeaders.length + 1}
        numColumns={columnHeaders.length + 1}
        {...floatingCellPosition}
      >
        {floatingCellPosition.value}
      </FloatingCell>
    )
  }

  render () {
    const { floatingCellPosition, ...gridProps } = this.props
    return (
      <InnerContaier>
        <DataGridSheet
          {...gridProps}
        />
        {this.renderFloatingCell()}
      </InnerContaier>
    )
  }
}

DataGrid.defaultProps = {
}

DataGrid.propTypes = {
  // All is forwarded to the DataGridSheet
  readOnly: PropTypes.bool,
  columnHeaders: PropTypes.arrayOf(
    PropTypes.number,
  ).isRequired,
  rowHeaders: PropTypes.arrayOf(
    PropTypes.number,
  ).isRequired,
  rowSigFigs: PropTypes.number,
  columnSigFigs: PropTypes.number,
  data: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.object),
  ).isRequired,
  colorScale: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.string,
    value: PropTypes.number,
  })).isRequired,

  renderHoverTip: PropTypes.func,
  onSelect: PropTypes.func,
  onCellsChanged: PropTypes.func,

  // Renders this
  floatingCellPosition: PropTypes.shape({
    x: PropTypes.number, // actual column
    y: PropTypes.number, // actual row
    xWeight: PropTypes.number, // range: 0 - 1
    yWeight: PropTypes.number, // range: 0 - 1
    value: PropTypes.node,
  }),
}

export default DataGrid
