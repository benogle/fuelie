import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import LogFile from 'lib/LogFile'

import DataGrid from 'components/DataGrid'

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

  // TODO: Maybe try to use constructor as this is deprecated, but the
  // constructor gets run twice.... Probably a better place to read the file.
  componentWillMount () {
    const { filename, configProfile } = this.props
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
