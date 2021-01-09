import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import flatten from 'lodash/flatten'
import isNumber from 'lodash/isNumber'

import theme from 'style/theme'

import LogFile from 'lib/LogFile'
import DataGrid from 'components/DataGrid'
import Tabs from 'components/Tabs'
import { round } from 'common/helpers'

import PlaybackBar from 'components/PlaybackBar'
import KeyboardTool from 'components/KeyboardTool'

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
    isTableFocused: false,

    // Replay things
    isReplayMode: false,
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

  handleTableFocus = () => {
    this.setState({ isTableFocused: true })
  }

  handleTableBlur = () => {
    this.setState({ isTableFocused: false })
  }

  handleChangeTab = ({ tabIndex }) => {
    this.setState({ tabIndex })
  }

  handleChangeReplayEnable = (isReplayMode) => {
    if (!isReplayMode) this.handlePause()
    this.setState({ isReplayMode, replayIndex: 0 })
  }

  handleChangeReplayIndex = (replayIndex) => {
    this.handlePause()
    this.setState({ replayIndex, isReplayMode: true })
  }

  handleChangeReplaySpeed = (replaySpeedFactor) => {
    this.setState({ replaySpeedFactor })
  }

  handlePlay = () => {
    this.setState({ isPlaying: true, isReplayMode: true }, () => {
      this.playFrom(this.state.replayIndex)
    })
  }

  handlePause = () => {
    clearInterval(this.interval)
    this.interval = null
    this.setState({ isPlaying: false })
  }

  handlePausePlayToggle = ({ handle }) => {
    handle()
    return this.state.isPlaying
      ? this.handlePause()
      : this.handlePlay()
  }

  handleArrow = ({ direction, handle, event }) => {
    const { isTableFocused, replayIndex } = this.state
    const changes = { left: -1, right: 1 }
    const largeChanges = { left: -10, right: 10 }
    if (!isTableFocused && (direction === 'left' || direction === 'right')) {
      const change = event.shiftKey ? largeChanges[direction] : changes[direction]
      const newIndex = replayIndex + change
      if (newIndex >= 0 && newIndex < this.logFile.length) {
        handle()
        this.handleChangeReplayIndex(newIndex)
      }
    }
  }

  playFrom = (index) => { // eslint-disable-line
    const nextMS = this.logFile.getMSTilNextLine(index, this.state.replaySpeedFactor)
    if (!nextMS) return this.handlePause()

    this.interval = setTimeout(() => {
      const nextIndex = index + 1
      this.setState({ replayIndex: nextIndex }, () => this.playFrom(nextIndex))
    }, nextMS)
  }

  getReplayCellPosition (index = 0) {
    const { isReplayMode, replayIndex } = this.state
    if (!isReplayMode) return null

    const logLine = this.logFile.getLineAtindex(replayIndex)
    return {
      x: logLine.colI.index + 1, // +1 to account for the header
      xWeight: logLine.colI.weight,
      y: logLine.rowI.index,
      yWeight: logLine.rowI.weight,
      value: logLine.m[index].toFixed(2),
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

    const mainValue = m[0].toFixed(2) // FIXME
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
        playback ({x}, {y})
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

  renderSidePanel ({
    isAvgFuelMixture,
    isTargetMixture,
    isSuggestedMixtureChange,
    mixtureIndex = 0,
  }) {
    const { selectedCell, selectedStart, isReplayMode, isTableFocused } = this.state

    if (isReplayMode && !isTableFocused) return this.renderReplaySidePanel()

    let mainValue = null
    let values = null

    if (selectedCell) {
      const avgFuelMixtureTables = this.logFile.getAvgFuelMixtureTable()
      const targetMixtureTable = this.logFile.getTargetMixtureTable()
      const suggestedMixtureChangeTables = this.logFile.getSuggestedMixtureChangeTable()

      const avgFuelMixtureCell = avgFuelMixtureTables[mixtureIndex][selectedStart.y][selectedStart.x]
      const targetMixtureCell = targetMixtureTable[selectedStart.y][selectedStart.x]
      const suggestedMixtureChangeCell = suggestedMixtureChangeTables[mixtureIndex][selectedStart.y][selectedStart.x]

      if (isAvgFuelMixture) {
        mainValue = avgFuelMixtureCell.value ? avgFuelMixtureCell.value : 'N/A'
      } else if (isTargetMixture) {
        mainValue = targetMixtureCell.value || 'N/A'
      } else if (isSuggestedMixtureChange) {
        mainValue = suggestedMixtureChangeCell.value ? suggestedMixtureChangeCell.value + '%' : 'N/A'
      }

      values = []

      const hasLoggedValues = avgFuelMixtureCell && avgFuelMixtureCell.value

      if (hasLoggedValues) {
        values.push(
          ...flatten(avgFuelMixtureTables.map((table, index) => {
            const afrCell = table[selectedStart.y][selectedStart.x]
            const suggestionCell = suggestedMixtureChangeTables[index][selectedStart.y][selectedStart.x]
            const indexDisplay = getIndexDisplay(avgFuelMixtureTables, index)
            return [
              {
                name: `${indexDisplay} Avg. Mixture`,
                value: round(afrCell.value, 2),
              },
              {
                name: `${indexDisplay} Mix. Range`,
                value: `${round(afrCell.min, 2)} - ${round(afrCell.max, 2)}`,
              },
              {
                name: `${indexDisplay} Sug. Change`,
                value: `${round(suggestionCell.value, 2)}%`,
              },
              {
                name: `${indexDisplay} Weight`,
                value: `${round(afrCell.weight, 2)}`,
              },
            ]
          })),
        )
      }

      if (!isTargetMixture) {
        values.push({
          name: 'Target',
          value: `${round(targetMixtureCell.value, 2)}`,
        })

        if (hasLoggedValues) {
          values.push({
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

  renderAverageMixture = (mixtureIndex) => {
    const { configProfile } = this.props
    const table = this.logFile.getAvgFuelMixtureTable(mixtureIndex)
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
            onFocus={this.handleTableFocus}
            onBlur={this.handleTableBlur}
            floatingCellPosition={this.getReplayCellPosition(mixtureIndex)}
          />
        </GridContainer>
        {this.renderSidePanel({ mixtureIndex, isAvgFuelMixture: true })}
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
            onFocus={this.handleTableFocus}
            onBlur={this.handleTableBlur}
            floatingCellPosition={this.getReplayCellPosition()}
          />
        </GridContainer>
        {this.renderSidePanel({ isTargetMixture: true })}
      </TabContainer>
    )
  }

  renderSuggestedMixtureChange = (mixtureIndex) => {
    const { configProfile } = this.props
    const table = this.logFile.getSuggestedMixtureChangeTable(mixtureIndex)
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
            onFocus={this.handleTableFocus}
            onBlur={this.handleTableBlur}
            floatingCellPosition={this.getReplayCellPosition(mixtureIndex)}
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
        {this.renderSidePanel({ mixtureIndex, isSuggestedMixtureChange: true })}
      </TabContainer>
    )
  }

  renderTabs () {
    const { tabIndex } = this.state

    const allTables = this.logFile.getAvgFuelMixtureTable()

    const mixtureTabs = allTables.map((table, index) => ({
      name: `Average AFR ${getIndexDisplay(allTables, index)}`,
      render: () => this.renderAverageMixture(index),
    }))
    const suggestionTabs = allTables.map((table, index) => ({
      name: `Suggested Change ${getIndexDisplay(allTables, index)}`,
      render: () => this.renderSuggestedMixtureChange(index),
    }))

    const tabs = [
      ...mixtureTabs,
      {
        name: 'Target AFR',
        render: this.renderTargetMixture,
      },
      ...suggestionTabs,
    ]
    return (
      <Tabs
        tabIndex={tabIndex}
        onChangeTab={this.handleChangeTab}
        tabs={tabs}
      />
    )
  }

  renderData () {
    const { isPlaying, isReplayMode, replayIndex, replaySpeedFactor, selectedCell } = this.state
    const ticks = selectedCell
      ? selectedCell.lineRanges
      : []
    return (
      <Container>
        {this.renderTabs()}
        <KeyboardTool
          onArrow={this.handleArrow}
          onPausePlay={this.handlePausePlayToggle}
        />
        <StatusBar>
          <PlaybackBar
            isEnabled={isReplayMode}
            isPlaying={isPlaying}
            currentIndex={replayIndex}
            maxIndex={this.logFile.getLastIndex()}
            currentTimeMS={this.logFile.getTimeMS(replayIndex)}
            lengthMS={this.logFile.getTotalTimeMS()}
            replaySpeedFactor={replaySpeedFactor}
            ticks={ticks}
            onPause={this.handlePause}
            onPlay={this.handlePlay}
            onStop={() => this.handleChangeReplayEnable(false)}
            onChangeIndex={this.handleChangeReplayIndex}
            onChangeReplaySpeedFactor={this.handleChangeReplaySpeed}
          />
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

function getIndexDisplay (allTables, index) {
  return allTables.length > 1 ? `#${index + 1}` : ''
}

LogFilePage.propTypes = {
  filename: PropTypes.string.isRequired,
  configProfile: PropTypes.object.isRequired,
  prevConfigProfile: PropTypes.object,
}

export default LogFilePage
