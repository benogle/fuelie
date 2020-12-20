import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const PADDING = 20

const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;

  background: #eee;
  min-width: 250px;
  padding: ${PADDING}px;
`

const PanelScroller = styled.div`
  flex: 1;
  overflow: auto;
  margin: -${PADDING}px;
  margin-top: 0;
`

const MainValueContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
`

const MainValue = styled.div`
  font-size: 20px;
  font-weight: bold;
`

const SubValue = styled.div`
  color: #999;
  margin-left: auto;
`

const ValueContainer = styled.div`
  display: flex;
  padding: 5px ${PADDING}px;

  &:hover {
    background: #f5f5f5;
  }
`

const ValueName = styled.div`
`

const Value = styled.div`
  font-weight: bold;
  margin-left: auto;
`

class StatusPanel extends React.Component {
  render () {
    const { mainValue, subValue, values } = this.props

    const content = []
    if (mainValue || subValue) {
      content.push(
        <MainValueContainer key="value">
          <MainValue>{mainValue}</MainValue>
          <SubValue>{subValue}</SubValue>
        </MainValueContainer>,
      )
    }

    if (values && values.length) {
      content.push(
        <PanelScroller>
          {values.map(({ key, name, value }, i) => (
            <ValueContainer key={`v${key || name}${i}`}>
              <ValueName>{name}</ValueName>
              <Value>{value}</Value>
            </ValueContainer>
          ))}
        </PanelScroller>,
      )
    }

    return (
      <PanelContainer>
        {content}
      </PanelContainer>
    )
  }
}

StatusPanel.propTypes = {
  mainValue: PropTypes.string,
  subValue: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.node,
    value: PropTypes.node,
  })),
}

export default StatusPanel