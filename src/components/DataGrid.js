import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { round } from 'common/helpers'

import ReactDataSheet from 'react-datasheet'
import 'react-datasheet/lib/react-datasheet.css'

const GridContainer = styled.table`
  width: 100%;
  height: 100%;
`

class DataGrid extends React.Component {
  getTableData () {
    const { data, rowHeaders, columnHeaders, readOnly, rowSigFigs, columnSigFigs } = this.props

    const newData = data.map((row, index) => [
      this.buildHeaderCellData(round(rowHeaders[index], rowSigFigs)),
    ].concat(row))

    newData.push(
      [this.buildHeaderCellData(null)]
        .concat(columnHeaders.map((columnHeader) => this.buildHeaderCellData(round(columnHeader, columnSigFigs)))),
    )
    return newData
  }

  buildHeaderCellData (text, options) {
    return {
      value: text,
      readOnly: true,
      isHeader: true,
      ...options,
    }
  }

  render () {
    return (
      <ReactDataSheet
        data={this.getTableData()}
        valueRenderer={(cell) => cell.value}
        isCellNavigable={(cell, row, col) => (
          !cell.isHeader
        )}
        onCellsChanged={(changes) => {
          console.log(changes)
        }}
        sheetRenderer={(props) => (
          <GridContainer className={props.className}>
            <tbody>
              {props.children}
            </tbody>
          </GridContainer>
        )}
      />
    )
  }
}

DataGrid.defaultProps = {
  rowSigFigs: 2,
  columnSigFigs: 0,
}

DataGrid.propTypes = {
  readOnly: PropTypes.bool,
  columnHeaders: PropTypes.arrayOf(
    PropTypes.string,
  ).isRequired,
  rowHeaders: PropTypes.arrayOf(
    PropTypes.string,
  ).isRequired,
  rowSigFigs: PropTypes.number,
  columnSigFigs: PropTypes.number,
  data: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.object),
  ).isRequired,
}

export default DataGrid
