import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import StatusPanel, { PADDING as STATUS_PANEL_PADDING } from 'components/StatusPanel'

const ValueContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 5px ${STATUS_PANEL_PADDING}px;

  &:hover {
    background: #f2f2f2;
  }
`

const Color = styled.div`
  cursor: default;
  width: 10px;
  height: 10px;
  background: transparent;
  margin-right: 10px;
`

const ValueName = styled.div`
  cursor: default;
`

const Value = styled.div`
  font-weight: bold;
  margin-left: auto;
`

class ChartStatusPanel extends React.Component {
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

  render () {
    const { values } = this.props
    const columnDataByName = this.getColumnDataByColumnName()
    const content = values.map(({ name, value }, i) => name != null
      ? (
        <ValueContainer key={`v${name}${i}`}>
          <Color style={{ background: columnDataByName[name]?.color }} />
          <ValueName>{name}</ValueName>
          <Value>{value}</Value>
        </ValueContainer>
        )
      : null)

    return (
      <StatusPanel>
        {content}
      </StatusPanel>
    )
  }
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
}

export default ChartStatusPanel
