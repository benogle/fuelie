import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import FloatingCell from './FloatingCell'
import DataGridSheet from './DataGridSheet'

const minCellSize = {
  width: 34,
  height: 20,
}

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
    const { rowHeaders, columnHeaders } = this.props
    const minWidth = (columnHeaders.length + 1) * minCellSize.width
    const minHeight = (rowHeaders.length + 1) * minCellSize.height

    return (
      <InnerContaier
        style={{ minWidth, minHeight }}
      >
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
  columnHeaders: PropTypes.arrayOf(
    PropTypes.number,
  ).isRequired,
  rowHeaders: PropTypes.arrayOf(
    PropTypes.number,
  ).isRequired,

  // All props other than the following are forwarded to the DataGridSheet
  floatingCellPosition: PropTypes.shape({
    x: PropTypes.number, // actual column
    y: PropTypes.number, // actual row
    xWeight: PropTypes.number, // range: 0 - 1
    yWeight: PropTypes.number, // range: 0 - 1
    value: PropTypes.node,
  }),
}

export default DataGrid
