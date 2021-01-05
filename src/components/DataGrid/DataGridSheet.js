import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import chroma from 'chroma-js'
import isEqual from 'lodash/isEqual'

import ReactDataSheet from 'react-datasheet'
import 'react-datasheet/lib/react-datasheet.css'

const GridContainer = styled.table`
  width: 100%;
  height: 100%;

  td.cell.read-only {
    background: white !important;
    color: inherit !important;
  }

  td {
    font-size: 16px;
  }

  th {
    font-size: 12px;
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

const colorMap = {
  red: chroma('#ffaeae').alpha(0.7),
  blue: chroma('#aaf1ff').alpha(0.7),
  green: chroma('#99ff99').alpha(0.7),
  yellow: chroma('#fbff18').alpha(0.7),
}

class DataGridSheet extends React.Component {
  componentDidMount () {
    // HACK: This dgDom thing is undocumented, hope it doesnt go away!
    this.grid.dgDom.addEventListener('focus', this.handleFocus)
    this.grid.dgDom.addEventListener('blur', this.handleBlur)
  }

  shouldComponentUpdate (nextProps) {
    return this.props.data !== nextProps.data
  }

  componentWillUnmount () {
    this.handleBlur()
    this.grid.dgDom.removeEventListener('focus', this.handleFocus)
    this.grid.dgDom.removeEventListener('blur', this.handleBlur)
  }

  handleFocus = () => {
    const { onFocus } = this.props
    if (onFocus) onFocus()
  }

  handleBlur = () => {
    const { onBlur } = this.props
    if (onBlur) onBlur()
  }

  handleSelect = ({ start: ogStart, end: ogEnd }) => {
    const { onSelect, data } = this.props
    if (onSelect) {
      // -1 cause the header is in the 0 position
      const end = { x: ogEnd.j - 1, y: ogEnd.i }
      const start = { x: ogStart.j - 1, y: ogStart.i }
      const cell = isEqual(start, end) && data[start.y] && data[start.y][start.x]
        ? data[start.y][start.x]
        : null
      onSelect({ start, end, cell })
    }
  }

  handleCellsChanged = (changes) => {
    const { onCellsChanged } = this.props
    // changes will be an array of objects
    // [{cell, col, row, value}, ...]
    // value is the value that the user set
    if (onCellsChanged) {
      const updatedChanges = changes.map(({ col, row, value, cell }) => ({
        x: col - 1,
        y: row,
        value,
        cell,
      }))
      onCellsChanged(updatedChanges)
    }
  }

  getColorScaleFunc () {
    const { colorScale } = this.props
    const colors = []
    const values = []
    for (const { color, value } of colorScale) {
      colors.push(colorMap[color] || color)
      values.push(value)
    }
    return chroma.scale(colors).domain(values)
  }

  getRow (rowValues) {
    const { readOnly } = this.props
    const getColor = this.getColorScaleFunc()
    return rowValues.map((v) => {
      const { value } = v
      const background = value ? getColor(value) : null
      return {
        ...v,
        background,
        readOnly,
      }
    })
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
    const { renderHoverTip } = this.props
    const {
      cell, row, col, columns, attributesRenderer,
      selected, editing, updated, style,
      ...rest
    } = props

    // hey, how about some custom attributes on our cell?
    const attributes = {
      ...cell.attributes,
      ...(attributesRenderer ? attributesRenderer(cell) : null),
    }

    const title = renderHoverTip ? renderHoverTip(cell) : null
    const Tag = cell.isHeader ? 'th' : 'td'
    return (
      <Tag {...rest} {...attributes} title={title}>
        <CellContainer style={{ background: cell.background }}>
          {props.children}
        </CellContainer>
      </Tag>
    )
  }

  render () {
    return (
      <ReactDataSheet
        ref={(el) => { this.grid = el }}
        data={this.getTableData()}
        isCellNavigable={(cell, row, col) => (
          !cell.isHeader
        )}
        onSelect={this.handleSelect}
        onCellsChanged={this.handleCellsChanged}
        cellRenderer={this.renderCell}
        valueRenderer={(cell) => cell.value}
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

DataGridSheet.defaultProps = {
  rowSigFigs: 2,
  columnSigFigs: 0,
  colorScale: [
    { color: 'red', value: 9.5 },
    { color: 'blue', value: 11.5 },
    { color: 'green', value: 14.7 },
    { color: 'yellow', value: 16 },
    { color: 'red', value: 22 },
  ],
}

DataGridSheet.propTypes = {
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
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
}

export default DataGridSheet
