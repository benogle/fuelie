import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import isNumber from 'lodash/isNumber'

import theme from 'style/theme'

import LogFile from 'lib/LogFile'
import DataGrid from 'components/DataGrid'
import Tabs from 'components/Tabs'
import { round } from 'common/helpers'

import IconPlay from 'components/icons/IconPlay'
import IconPause from 'components/icons/IconPause'

import StatusPanel from './StatusPanel'

import req from 'common/req'
const path = req('path')

// FIXME: This is stupid but I am fighting flexbox
const CHROME_HEIGHT = 90

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const TabContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  height: calc(100% - ${CHROME_HEIGHT}px); /* FIXME: This is stupid but i am fighting flexbox */
`

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 20px;
  background: white;
  box-shadow: ${theme.boxShadows[50]};

  .data-grid-container {
    height: 100%;
    display: block;
  }

`

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  font-size: 14px;
  padding: 0 20px;
`

class LogFilePage extends React.Component {
  state = {
    loaded: false,
    selectedCell: null,
    selectedStart: null,
    selectedEnd: null,
    tabIndex: 0,

    // Replay things
    isReplayMode: true,
    isPlaying: false,
    replayIndex: 0,
    replaySpeedFactor: 1,
  }

  componentDidMount () {
    const { filename } = this.props
    document.title = path.basename(filename)
    this.loadFile()
  }

  async componentDidUpdate (prevProps) {
    if (this.props.configProfile !== prevProps.configProfile) {
      await this.logFile.setConfigProfile(this.props.configProfile, this.props.prevConfigProfile)
      this.setState({ loaded: this.state.loaded })
    }
  }

  handleSelect = ({ start, end, cell }) => {
    console.log('select', cell)
    this.setState({
      selectedCell: cell,
      selectedStart: start,
      selectedEnd: end,
    })
  }

  handleChangeTab = ({ tabIndex }) => {
    this.setState({ tabIndex })
  }

  handleChangeReplayEnable = ({ target }) => {
    this.setState({ isReplayMode: target.value, replayIndex: 0 })
  }

  handleChangeReplayIndex = (value) => {
    this.handlePause()
    this.setState({ replayIndex: parseInt(value) })
  }

  handleChangeReplaySpeed = (value) => {
    this.setState({ replaySpeedFactor: parseFloat(value) })
  }

  handlePlay = () => {
    this.setState({ isPlaying: true }, () => {
      this.playFrom(this.state.replayIndex)
    })
  }

  handlePause = () => {
    clearInterval(this.interval)
    this.interval = null
    this.setState({ isPlaying: false })
  }

  playFrom = (index) => { // eslint-disable-line
    const nextMS = this.logFile.getMSTilNextLine(index, this.state.replaySpeedFactor)
    if (!nextMS) return this.handlePause()

    this.interval = setTimeout(() => {
      const nextIndex = index + 1
      this.setState({ replayIndex: nextIndex }, () => this.playFrom(nextIndex))
    }, nextMS)
  }

  getReplayCellPosition () {
    const { isReplayMode, replayIndex } = this.state
    if (!isReplayMode) return null

    const logLine = this.logFile.getLineAtindex(replayIndex)
    return {
      x: logLine.colI.index + 1, // +1 to account for the header
      xWeight: logLine.colI.weight,
      y: logLine.rowI.index,
      yWeight: logLine.rowI.weight,
      value: logLine.m.toFixed(2),
    }
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

  renderReplaySidePanel () {
    const { configProfile } = this.props
    const { isReplayMode, replayIndex } = this.state
    if (!isReplayMode) return null

    const logLine = this.logFile.getLineAtindex(replayIndex)
    const { t, rowV, rowI, colV, colI, m, ...logParams } = logLine

    const mainValue = logLine.m.toFixed(2)
    const x = logLine.colI.weight > 0.5
      ? logLine.colI.index + 2
      : logLine.colI.index + 1
    const y = logLine.rowI.weight > 0.5
      ? logLine.rowI.index + 1
      : logLine.rowI.index

    const values = []
    const logParamValues = Object.keys(logParams).map((name) => name && ({
      name,
      value: isNumber(logParams[name])
        ? logParams[name].toFixed(configProfile.getLogFileColumnDecimals(name))
        : logParams[name],
    }))
    values.push(...logParamValues)

    const subValue = (
      <span title="Table Location">
        {Math.round(t)} sec ({x}, {y})
      </span>
    )

    return (
      <StatusPanel
        mainValue={mainValue}
        subValue={subValue}
        values={values}
      />
    )
  }

  renderSidePanel ({ isAvgFuelMixture, isTargetMixture, isSuggestedMixtureChange }) {
    const { selectedCell, selectedStart, isReplayMode } = this.state

    if (isReplayMode) return this.renderReplaySidePanel()

    let mainValue = null
    let values = null

    if (selectedCell) {
      const avgFuelMixtureTable = this.logFile.getAvgFuelMixtureTable()
      const targetMixtureTable = this.logFile.getTargetMixtureTable()
      const suggestedMixtureChangeTable = this.logFile.getSuggestedMixtureChangeTable()

      const avgFuelMixtureCell = avgFuelMixtureTable[selectedStart.y][selectedStart.x]
      const targetMixtureCell = targetMixtureTable[selectedStart.y][selectedStart.x]
      const suggestedMixtureChangeCell = suggestedMixtureChangeTable[selectedStart.y][selectedStart.x]

      if (isAvgFuelMixture) {
        mainValue = avgFuelMixtureCell.value ? avgFuelMixtureCell.value : null
      } else if (isTargetMixture) {
        mainValue = targetMixtureCell.value
      } else if (isSuggestedMixtureChange) {
        mainValue = suggestedMixtureChangeCell.value ? suggestedMixtureChangeCell.value + '%' : null
      }

      values = []

      const hasLoggedValues = avgFuelMixtureCell && avgFuelMixtureCell.value

      if (hasLoggedValues) {
        if (!isAvgFuelMixture) {
          values.push({
            name: 'Avg Mixture',
            value: `${round(avgFuelMixtureCell.value, 2)}`,
          })
        }

        values.push({
          name: 'Mix. Range',
          value: `${round(avgFuelMixtureCell.min, 2)} - ${round(avgFuelMixtureCell.max, 2)}`,
        })
      }

      if (!isTargetMixture) {
        values.push({
          name: 'Target',
          value: `${round(targetMixtureCell.value, 2)}`,
        })
      }

      if (hasLoggedValues) {
        if (!isSuggestedMixtureChange) {
          values.push({
            name: 'Sug. Change',
            value: `${round(suggestedMixtureChangeCell.value, 2)}%`,
          })
        }

        values.push({
          name: 'Weight',
          value: `${round(avgFuelMixtureCell.weight, 2)}`,
        }, {
          name: 'Samples',
          value: `${avgFuelMixtureCell.length}`,
        }, {
          key: 'counts',
          name: getCellVCountArray(avgFuelMixtureCell)
            .map(({ value, count }) => (
              <div key={`v${value}`}>
                {value} ({count})
              </div>
            )),
        })
      }
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
      <TabContainer>
        <GridContainer>
          <DataGrid
            data={table}
            rowHeaders={rowHeaders}
            columnHeaders={columnHeaders}
            readOnly
            renderHoverTip={this.renderHoverTip}
            onSelect={this.handleSelect}
            floatingCellPosition={this.getReplayCellPosition()}
          />
        </GridContainer>
        {this.renderSidePanel({ isAvgFuelMixture: true })}
      </TabContainer>
    )
  }

  renderTargetMixture = () => {
    const { configProfile } = this.props
    const table = this.logFile.getTargetMixtureTable()
    const rowHeaders = configProfile.getFuelMapRows()
    const columnHeaders = configProfile.getFuelMapColumns()
    const min = 9
    const max = 22
    const handleChange = (changes) => {
      configProfile.updateFuelMixtureTarget(changes.map(({ x, y, value, cell }) => ({
        x,
        y,
        value: Math.min(max, Math.max(min, parseFloat(value))) || cell.value,
      })))
    }

    return (
      <TabContainer>
        <GridContainer>
          <DataGrid
            data={table}
            rowHeaders={rowHeaders}
            columnHeaders={columnHeaders}
            readOnly={false}
            onSelect={this.handleSelect}
            onCellsChanged={handleChange}
            floatingCellPosition={this.getReplayCellPosition()}
          />
        </GridContainer>
        {this.renderSidePanel({ isTargetMixture: true })}
      </TabContainer>
    )
  }

  renderSuggestedMixtureChange = () => {
    const { configProfile } = this.props
    const table = this.logFile.getSuggestedMixtureChangeTable()
    const rowHeaders = configProfile.getFuelMapRows()
    const columnHeaders = configProfile.getFuelMapColumns()
    return (
      <TabContainer>
        <GridContainer>
          <DataGrid
            data={table}
            rowHeaders={rowHeaders}
            columnHeaders={columnHeaders}
            readOnly
            onSelect={this.handleSelect}
            floatingCellPosition={this.getReplayCellPosition()}
            colorScale={[
              { color: 'red', value: -18 },
              { color: 'yellow', value: -10 },
              { color: 'blue', value: -4 },
              { color: 'green', value: 0 },
              { color: 'blue', value: 4 },
              { color: 'yellow', value: 10 },
              { color: 'red', value: 18 },
            ]}
          />
        </GridContainer>
        {this.renderSidePanel({ isSuggestedMixtureChange: true })}
      </TabContainer>
    )
  }

  renderTabs () {
    const { tabIndex } = this.state
    const tabs = [{
      name: 'Average AFR',
      render: this.renderAverageMixture,
    }, {
      name: 'Target AFR',
      render: this.renderTargetMixture,
    }, {
      name: 'Suggested Change',
      render: this.renderSuggestedMixtureChange,
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
    const { isPlaying, replaySpeedFactor } = this.state
    return (
      <Container>
        {this.renderTabs()}
        <StatusBar>
          <input
            type="checkbox"
            checked={this.state.isReplayMode}
            onChange={this.handleChangeReplayEnable}
          />

          {isPlaying
            ? (<IconPause onClick={this.handlePause} />)
            : (<IconPlay onClick={this.handlePlay} />)}

          <input
            style={{ flexGrow: 1 }}
            type="range"
            value={this.state.replayIndex}
            step="1"
            min={0}
            max={this.logFile.length - 1}
            onChange={({ target }) => this.handleChangeReplayIndex(target.value)}
          />

          <select
            onChange={({ target }) => this.handleChangeReplaySpeed(target.value)}
          >
            <option value="2" selected={replaySpeedFactor === 2}>2x</option>
            <option value="1" selected={replaySpeedFactor === 1}>1x</option>
            <option value="0.5" selected={replaySpeedFactor === 0.5}>1/2x</option>
            <option value="0.25" selected={replaySpeedFactor === 0.25}>1/4x</option>
            <option value="0.1" selected={replaySpeedFactor === 0.1}>1/10x</option>
            <option value="0.01" selected={replaySpeedFactor === 0.01}>1/100x</option>
          </select>

          <div style={{ width: 75 }}>
            {this.state.replayIndex}
          </div>
        </StatusBar>
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
  if (!cell || !cell.vCount) return []
  return Object.keys(cell.vCount)
    .map((value) => ({ value, count: cell.vCount[value] }))
    .sort((a, b) => b.count - a.count)
}

LogFilePage.propTypes = {
  filename: PropTypes.string.isRequired,
  configProfile: PropTypes.object.isRequired,
  prevConfigProfile: PropTypes.object,
}

export default LogFilePage
