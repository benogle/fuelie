import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import ReactDataSheet from 'react-datasheet'
import 'react-datasheet/lib/react-datasheet.css'

const GridContainer = styled.table`
  width: 100%;
  height: 100%;

  td.cell.read-only {
    background: white !important;
    color: inherit !important;
  }
`

const CellContainer = styled.div`
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  > span {
    display: block;
  }

  input {
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border-radius: 0;
    border: none;
    text-align: center;
  }
`

class DataGrid extends React.Component {
  getRow (rowValues) {
    const { readOnly } = this.props
    return rowValues.map((v) => ({
      ...v,
      readOnly,
    }))
  }

  getTableData () {
    const { data, rowHeaders, columnHeaders, rowSigFigs, columnSigFigs } = this.props

    const newData = data.map((row, index) => [
      this.buildHeaderCellData(rowHeaders[index].toFixed(rowSigFigs)),
    ].concat(this.getRow(row)))

    newData.push(
      [this.buildHeaderCellData(null)]
        .concat(columnHeaders.map((columnHeader) => this.buildHeaderCellData(columnHeader.toFixed(columnSigFigs)))),
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

  renderCell = (props) => {
    const {
      cell, row, col, columns, attributesRenderer,
      selected, editing, updated, style,
      ...rest
    } = props

    // hey, how about some custom attributes on our cell?
    const attributes = {
      ...cell.attributes,
      ...(attributesRenderer ? attributesRenderer(cell) : {}),
    }

    const Tag = cell.isHeader ? 'th' : 'td'
    return (
      <Tag {...rest} {...attributes}>
        <CellContainer>
          {props.children}
        </CellContainer>
      </Tag>
    )
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
        cellRenderer={this.renderCell}
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
