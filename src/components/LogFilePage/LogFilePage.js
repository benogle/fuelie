import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import LogFile from 'lib/LogFile'
import DataGrid from 'components/DataGrid'
import { round } from 'common/helpers'

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
  padding: 20px;
  flex-grow: 1;
`

const RightPanel = styled.div`
  background: #eee;
  min-width: 250px;
  padding: 20px;
`

const ValueContainer = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
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
    const { selectedCell, selectedStart, selectedEnd } = this.state

    const content = []

    if (selectedCell && selectedCell.value) {
      const counts = getCellVCountArray(selectedCell)
        .map(({ value, count }) => (
          <div key={`v${value}`}>
            {value}({count})
          </div>
        ))

      content.push(
        <ValueContainer key="value">
          {selectedCell.value}
        </ValueContainer>,
        <div key="minmax">
          Range {round(selectedCell.min, 2)} - {round(selectedCell.max, 2)}
        </div>,
        <div key="len">
          Samples {selectedCell.length}
        </div>,
        <div key="weight">
          Weight {round(selectedCell.weight, 2)}
        </div>,
        <div key="counts">
          {counts}
        </div>,
      )
    }

    if (selectedStart) {
      content.push(
        <div key="cellloc">
          Location ({selectedStart.x}, {selectedStart.y})
        </div>,
      )
    }

    return (
      <RightPanel>
        {content}
      </RightPanel>
    )
  }

  renderData () {
    // console.log('render')
    const { configProfile } = this.props
    const table = this.logFile.getAvgFuelMixtureTable()
    const rowHeaders = configProfile.getFuelMapRows()
    const columnHeaders = configProfile.getFuelMapColumns()
    return (
      <Container>
        <LeftPanel>
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
