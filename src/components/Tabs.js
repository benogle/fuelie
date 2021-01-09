import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import theme from 'style/theme'

const BACKGROUND = theme.colors.blacks[20]
const BACKGROUND_ACTIVE = 'white'
const CONTENT_PADDING = 20
const TAB_PADDING = 30
const TAB_HEIGHT = 40
const TAB_WIDTH = 120

const Tab = styled.div`
  position: relative;
  z-index: 10;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-width: ${TAB_WIDTH}px;
  height: ${TAB_HEIGHT}px;
  padding: 0 ${TAB_PADDING}px;
  background: ${BACKGROUND};

  cursor: pointer;

  ${({ isActive }) => isActive && `
    background: ${BACKGROUND_ACTIVE};
    box-shadow: ${theme.boxShadows[50]};

    /* super ghetto to cover the tabs shadow */
    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -${CONTENT_PADDING / 2}px;
      height: ${CONTENT_PADDING / 2}px;
      background: ${BACKGROUND_ACTIVE};
    }
  `}
`

const TabBar = styled.div`
  display: flex;
  padding-top: 10px;
  padding-left: ${CONTENT_PADDING}px;
  ${Tab} {
    margin-right: 10px;
  }
`

class Tabs extends React.Component {
  handleClickTab = (tabIndex) => {
    const { onChangeTab } = this.props
    onChangeTab({ tabIndex })
  }

  renderTab = ({ name }, index) => {
    const { tabIndex } = this.props
    const isActive = index === tabIndex
    return (
      <Tab
        key={name}
        isActive={isActive}
        onMouseDown={() => this.handleClickTab(index)}
      >
        {name}
      </Tab>
    )
  }

  renderTabBar () {
    const { tabs } = this.props
    return (
      <TabBar>
        {tabs.map(this.renderTab)}
      </TabBar>
    )
  }

  renderTabContent () {
    const { tabs, tabIndex } = this.props
    return (
      tabs[tabIndex].render()
    )
  }

  render () {
    return (
      <>
        {this.renderTabBar()}
        {this.renderTabContent()}
      </>
    )
  }
}

Tabs.defaultProps = {
  tabIndex: 0,
}

Tabs.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  onChangeTab: PropTypes.func.isRequired,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
  })).isRequired,
}

export default Tabs
