import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import StatusPanel, { PADDING as STATUS_PANEL_PADDING } from 'components/StatusPanel'

const ValueContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 5px ${STATUS_PANEL_PADDING}px;

  &:hover {
    background: white;
  }

  ${({ isSelected }) => isSelected && `
    background: white;
  `}
`

const Color = styled.div`
  cursor: default;
  width: 10px;
  height: 10px;
  background: transparent;
`

const ValueName = styled.div`
  cursor: default;
  margin-left: 10px;
`

const Value = styled.div`
  font-weight: bold;
  margin-left: auto;
`

const Checkbox = styled.input.attrs({
  type: 'checkbox',
})`
`

class ChartStatusPanel extends React.Component {
  handleChangeSelectedColumn = ({ event, selectedColumnName }) => {
    const { onChangeSelectedColumn } = this.props
    if (event.target.nodeName !== 'INPUT') { // TODO: cant remember better way without internet
      onChangeSelectedColumn({ selectedColumnName })
    }
  }

  handleChangeColumnVisibility = ({ event, columnName, index }) => {
    const visible = event.target.checked
    const { pageConfig, onChangeColumnVisibility } = this.props

    // Work out which lines in which charts need to change.
    const lineIndices = [
      // e.g.{ chartIndex: 0, lineIndex: 1 }
    ]
    const charts = pageConfig.charts
    for (let chartIndex = 0; chartIndex < charts.length; chartIndex++) { // eslint-disable-line react/prop-types
      const chart = pageConfig.charts[chartIndex]
      for (let lineIndex = 0; lineIndex < chart.lines.length; lineIndex++) {
        const line = chart.lines[lineIndex]
        if (line.column === columnName) {
          lineIndices.push({ chartIndex, lineIndex })
        }
      }
    }

    onChangeColumnVisibility({ visible, columnName, lineIndices })
  }

  getColumnDataByColumnName () {
    const { pageConfig } = this.props
    const columnDataByName = {}
    for (const chart of pageConfig.charts) {
      for (const line of chart.lines) {
        columnDataByName[line.column] = line
      }
    }
    return columnDataByName
  }

  renderValue ({ name, value, index, columnData }) {
    const { selectedColumnName } = this.props
    const color = columnData?.color
    const show = !!columnData && (columnData.show != null ? !!columnData.show : true)
    return (
      <ValueContainer
        key={`v${name}${index}`}
        isSelected={name === selectedColumnName}
        onClick={(event) => this.handleChangeSelectedColumn({ event, selectedColumnName })}
      >
        <Color style={{ background: color }} />
        <Checkbox
          checked={show}
          disabled={!color}
          onChange={(event) => this.handleChangeColumnVisibility({ event, columnName: name, index })}
        />
        <ValueName>{name}</ValueName>
        <Value>{value}</Value>
      </ValueContainer>
    )
  }

  render () {
    const { values } = this.props
    const columnDataByName = this.getColumnDataByColumnName()
    const content = values.map(({ name, value }, index) => name != null
      ? this.renderValue({ name, value, index, columnData: columnDataByName[name] })
      : null)

    return (
      <StatusPanel>
        {content}
      </StatusPanel>
    )
  }
}

ChartStatusPanel.defaultProps = {
  onChangeSelectedIndex: () => {},
  onChangeColumnVisibility: () => {},
}

ChartStatusPanel.propTypes = {
  pageConfig: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      charts: PropTypes.arrayOf(PropTypes.shape({
        lines: PropTypes.array,
      })).isRequired,
    }),
  ).isRequired,
  values: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.node,
    value: PropTypes.node,
  })),

  selectedColumnName: PropTypes.string,
  onChangeSelectedColumn: PropTypes.func,
  onChangeColumnVisibility: PropTypes.func,
}

export default ChartStatusPanel
