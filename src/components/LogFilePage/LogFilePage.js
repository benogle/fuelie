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
  flex-direction: column;
  padding: 20px;
`

const InfoContainer = styled.div`
`

const GridContainer = styled.div`
  flex-grow: 1;
  width: 100%;
`

class LogFilePage extends React.Component {
  state = {
    loaded: false,
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

  renderData () {
    const { filename, configProfile } = this.props
    const table = this.logFile.getAvgFuelMixtureTable()
    const rowHeaders = configProfile.getFuelMapRows()
    const columnHeaders = configProfile.getFuelMapColumns()
    return (
      <Container>
        <InfoContainer>
          fname: {filename}
        </InfoContainer>

        <GridContainer>
          <DataGrid
            data={table}
            rowHeaders={rowHeaders}
            columnHeaders={columnHeaders}
            readOnly
            renderHoverTip={(cell) => {
              if (!cell.length) return null
              const counts = Object.keys(cell.vCount)
                .map((value) => ({ value, count: cell.vCount[value] }))
                .sort((a, b) => b.count - a.count)
                .map(({ value, count }) => `${value}(${count})`)
                .join(', ')
              return `min ${round(cell.min, 2)}, max ${round(cell.max, 2)}, weight ${round(cell.weight, 2)}, length ${cell.length};\n${counts}`
            }}
          />
        </GridContainer>
      </Container>
    )
  }

  render () {
    return this.state.loaded
      ? this.renderData()
      : this.renderLoading()
  }
}

LogFilePage.propTypes = {
  filename: PropTypes.string.isRequired,
  configProfile: PropTypes.object.isRequired,
}

export default LogFilePage
