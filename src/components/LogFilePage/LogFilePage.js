// The main file. This displays all the tabs, sidebar, playback, etc.
// TODO: Probably should split this up so it isnt 600 lines...

import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import flatten from 'lodash/flatten'
import compact from 'lodash/compact'
import isNumber from 'lodash/isNumber'

import theme from 'style/theme'

import LogFile from 'lib/LogFile'
import DataGrid from 'components/DataGrid'
import LogFileChart from 'components/LogFileChart'
import Tabs from 'components/Tabs'
import { round } from 'common/helpers'

import PlaybackBar from 'components/PlaybackBar'
import KeyboardTool from 'components/KeyboardTool'

import StatusPanel from './StatusPanel'

import req from 'common/req'
const path = req('path')

// FIXME: This is stupid but I am fighting flexbox
const CHROME_HEIGHT = 94

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
  overflow: auto;

  .data-grid-container {
    height: 100%;
    display: block;
  }

`

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  height: 50px;
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
    document.title = `${path.basename(filename)} - Fuelie`
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

  handleNextTab = () => {
    this.moveToRelativeTabIndex(1)
  }

  handlePreviousTab = () => {
    this.moveToRelativeTabIndex(-1)
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

  getLineRanges () {
    const { selectedStart, selectedEnd } = this.state
    if (!selectedStart || !selectedEnd) return []
    const minX = Math.min(selectedStart.x, selectedEnd.x)
    const maxX = Math.max(selectedStart.x, selectedEnd.x)
    const minY = Math.min(selectedStart.y, selectedEnd.y)
    const maxY = Math.max(selectedStart.y, selectedEnd.y)
    return this.logFile.getLineRanges({ minX, maxX, minY, maxY })
  }

  playFrom = (index) => {
    const nextMS = this.logFile.getMSTilNextLine(index, this.state.replaySpeedFactor)
    if (!nextMS) return this.handlePause()

    this.interval = setTimeout(() => {
      const nextIndex = index + 1
      this.setState({ replayIndex: nextIndex }, () => this.playFrom(nextIndex))
    }, nextMS)
  }

  moveToRelativeTabIndex (countToMove) {
    const numberOfTabs = this.numberOfTabs || 3
    // NOTE: add the numberOfTabs to guard against modding -1
    this.setState({
      tabIndex: (numberOfTabs + this.state.tabIndex + countToMove) % numberOfTabs,
    })
  }

  loadFile () {
    const { filename, configProfile } = this.props
    if (this.state.loaded) {
      this.setState({ loaded: false })
    }
    this.logFile = new LogFile(filename, configProfile)
    this.logFile.readFile().then(() => {
      this.setState({ loaded: true })
      console.log('Loaded log file', this.logFile)
    })
  }

  renderLoading () {
    return (
      <div>
        loading...
      </div>
    )
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
    const sortedHeaders = this.logFile.getSortedColumnHeaders()
    const logParamValues = sortedHeaders.map((name) => name && ({
      name,
      value: isNumber(logParams[name])
        ? logParams[name].toFixed(configProfile.getLogFileColumnDecimals(name))
        : logParams[name],
    }))
    values.push(...compact(logParamValues))

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
    isMixtureDifference,
    isSuggestedMixtureChange,
    mixtureIndex = 0,
  }) {
    const { selectedCell, selectedStart, isReplayMode, isTableFocused } = this.state
    const { configProfile } = this.props

    if (isReplayMode && !isTableFocused) return this.renderReplaySidePanel()

    let mainValue = null
    let values = null

    if (selectedCell) {
      const avgFuelMixtureTables = this.logFile.getAvgFuelMixtureTable()
      const targetMixtureTable = this.logFile.getTargetMixtureTable()
      const mixtureDifferenceTable = this.logFile.getMixtureDifferenceTable()
      const mixtureDifferenceUnits = configProfile.getMixtureDifferenceUnits()
      const suggestedMixtureChangeTables = this.logFile.getSuggestedMixtureChangeTable()
      const suggestedMixtureChangeUnits = configProfile.getSuggestedMixtureChangeUnits()

      const avgFuelMixtureCell = avgFuelMixtureTables[mixtureIndex][selectedStart.y][selectedStart.x]
      const targetMixtureCell = targetMixtureTable[selectedStart.y][selectedStart.x]
      const suggestedMixtureChangeCell = suggestedMixtureChangeTables[mixtureIndex][selectedStart.y][selectedStart.x]
      const mixtureDifferenceCell = mixtureDifferenceTable
        ? mixtureDifferenceTable[selectedStart.y][selectedStart.x]
        : null

      if (isAvgFuelMixture) {
        mainValue = avgFuelMixtureCell.value ? avgFuelMixtureCell.value : 'N/A'
      } else if (isTargetMixture) {
        mainValue = targetMixtureCell.value || 'N/A'
      } else if (isSuggestedMixtureChange) {
        mainValue = suggestedMixtureChangeCell.value ? suggestedMixtureChangeCell.value + suggestedMixtureChangeUnits : 'N/A'
      } else if (isMixtureDifference) {
        mainValue = mixtureDifferenceCell.value ? mixtureDifferenceCell.value + mixtureDifferenceUnits : 'N/A'
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
                value: `${round(suggestionCell.value, 2)}${suggestedMixtureChangeUnits}`,
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

  renderMixtureDifference = () => {
    const { configProfile } = this.props
    const table = this.logFile.getMixtureDifferenceTable()
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
            floatingCellPosition={this.getReplayCellPosition()}
            colorScale={[
              { color: 'red', value: -1 },
              { color: 'yellow', value: -0.6 },
              { color: 'blue', value: -0.2 },
              { color: 'green', value: 0 },
              { color: 'blue', value: 0.2 },
              { color: 'yellow', value: 0.6 },
              { color: 'red', value: 1 },
            ]}
          />
        </GridContainer>
        {this.renderSidePanel({ isMixtureDifference: true })}
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

  renderCharts = () => {
    const { configProfile } = this.props
    return (
      <TabContainer>
        <GridContainer>
          <LogFileChart
            logFile={this.logFile}
            replayIndex={this.state.replayIndex}
            zoomConfig={configProfile.getChartZoom()}
            onChangeZoom={({ pointsInView }) => configProfile.setChartZoomPointsInView(pointsInView)}
          />
        </GridContainer>
        {this.renderSidePanel({ })}
      </TabContainer>
    )
  }

  renderTabs () {
    const { tabIndex } = this.state

    const allTables = this.logFile.getAvgFuelMixtureTable()
    const mixtureDifferenceTable = this.logFile.getMixtureDifferenceTable()

    const mixtureTabs = allTables.map((table, index) => ({
      name: `Avg. AFR ${getIndexDisplay(allTables, index)}`,
      render: () => this.renderAverageMixture(index),
    }))
    const suggestionTabs = allTables.map((table, index) => ({
      name: `Sug. Change ${getIndexDisplay(allTables, index)}`,
      render: () => this.renderSuggestedMixtureChange(index),
    }))

    const diffTabs = []
    if (mixtureDifferenceTable) {
      diffTabs.push({
        name: 'AFR Diff',
        render: this.renderMixtureDifference,
      })
    }

    const tabs = [
      ...mixtureTabs,
      ...diffTabs,
      {
        name: 'Target',
        render: this.renderTargetMixture,
      },
      {
        name: 'Charts',
        render: this.renderCharts,
      },
      ...suggestionTabs,
    ]

    // HACK: it's fine, you'll get over it
    this.numberOfTabs = tabs.length

    return (
      <Tabs
        tabIndex={tabIndex}
        onChangeTab={this.handleChangeTab}
        tabs={tabs}
      />
    )
  }

  renderData () {
    const { isPlaying, isReplayMode, replayIndex, replaySpeedFactor } = this.state
    const ticks = this.getLineRanges()
    return (
      <Container>
        {this.renderTabs()}
        <KeyboardTool
          onArrow={this.handleArrow}
          onPausePlay={this.handlePausePlayToggle}
          onNextTab={this.handleNextTab}
          onPreviousTab={this.handlePreviousTab}
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
