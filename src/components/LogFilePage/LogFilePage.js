import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import LogFile from 'lib/LogFile'
import DataGrid from 'components/DataGrid'
import Tabs from 'components/Tabs'
import { round } from 'common/helpers'

import StatusPanel from './StatusPanel'

import req from 'common/req'
const path = req('path')

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
`

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const GridContainer = styled.div`
  flex-grow: 1;
  width: 100%;
`

class LogFilePage extends React.Component {
  state = {
    loaded: false,
    selectedCell: null,
    selectedStart: null,
    selectedEnd: null,
    tabIndex: 0,
  }

  componentDidMount () {
    const { filename } = this.props
    document.title = path.basename(filename)
    this.loadFile()
  }

  componentDidUpdate (prevProps) {
    if (this.props.configProfile !== prevProps.configProfile) {
      this.loadFile()
    }
  }

  handleSelect = ({ start, end, cell }) => {
    this.setState({
      selectedCell: cell,
      selectedStart: start,
      selectedEnd: end,
    })
  }

  handleChangeTab = ({ tabIndex }) => {
    this.setState({ tabIndex })
  }

  loadFile () {
    const { filename, configProfile } = this.props
    if (this.state.loaded) {
      this.setState({ loaded: false })
    }
    this.logFile = new LogFile(filename, configProfile)
    this.logFile.readFile().then(() => {
      this.setState({ loaded: true })
    })
  }

  renderLoading () {
    return (
      <div>
        loading...
      </div>
    )
  }

  renderHoverTip = (cell) => {
    if (!cell.length) return null
    const counts = getCellVCountArray(cell)
      .map(({ value, count }) => `${value}(${count})`)
      .join(', ')
    return `min ${round(cell.min, 2)}, max ${round(cell.max, 2)}, weight ${round(cell.weight, 2)}, length ${cell.length};\n${counts}`
  }

  renderSidePanel () {
    const { selectedCell, selectedStart } = this.state

    let mainValue = null
    let values = null

    if (selectedCell && selectedCell.value) {
      mainValue = selectedCell.value

      const counts = getCellVCountArray(selectedCell)
        .map(({ value, count }) => (
          <div key={`v${value}`}>
            {value} ({count})
          </div>
        ))

      values = [{
        name: 'Range',
        value: `${round(selectedCell.min, 2)} - ${round(selectedCell.max, 2)}`,
      }, {
        name: 'Weight',
        value: `${round(selectedCell.weight, 2)}`,
      }, {
        name: 'Samples',
        value: `${selectedCell.length}`,
      }, {
        name: counts,
        key: 'counts',
      }]
    }

    const subValue = selectedStart
      ? (
        <span title="Table Location">
          ({selectedStart.x}, {selectedStart.y})
        </span>
      )
      : null

    return (
      <StatusPanel
        mainValue={mainValue}
        subValue={subValue}
        values={values}
      />
    )
  }

  renderAverageMixture = () => {
    const { configProfile } = this.props
    const table = this.logFile.getAvgFuelMixtureTable()
    const rowHeaders = configProfile.getFuelMapRows()
    const columnHeaders = configProfile.getFuelMapColumns()
    return (
      <GridContainer>
        <DataGrid
          data={table}
          rowHeaders={rowHeaders}
          columnHeaders={columnHeaders}
          readOnly
          renderHoverTip={this.renderHoverTip}
          onSelect={this.handleSelect}
        />
      </GridContainer>
    )
  }

  renderOtherTab () {
    return (
      <div>
        IHIUD IUHSIUDFHIUSHDFIUHSIUDHF
      </div>
    )
  }

  renderTabs () {
    const { tabIndex } = this.state
    const tabs = [{
      name: 'Average AFR',
      render: this.renderAverageMixture,
    }, {
      name: 'Target AFR',
      render: this.renderOtherTab,
    }]
    return (
      <Tabs
        tabIndex={tabIndex}
        onChangeTab={this.handleChangeTab}
        tabs={tabs}
      />
    )
  }

  renderData () {
    return (
      <Container>
        <LeftPanel>
          {this.renderTabs()}
        </LeftPanel>
        {this.renderSidePanel()}
      </Container>
    )
  }

  render () {
    return this.state.loaded
      ? this.renderData()
      : this.renderLoading()
  }
}

function getCellVCountArray (cell) {
  return Object.keys(cell.vCount)
    .map((value) => ({ value, count: cell.vCount[value] }))
    .sort((a, b) => b.count - a.count)
}

LogFilePage.propTypes = {
  filename: PropTypes.string.isRequired,
  configProfile: PropTypes.object.isRequired,
}

export default LogFilePage
