import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import LogFile from 'lib/LogFile'

import ReactDataSheet from 'react-datasheet'
import 'react-datasheet/lib/react-datasheet.css'

const Container = styled.div`
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
    return (
      <Container>
        <div>
          fname: {filename}
        </div>
        <div>
          {JSON.stringify(configProfile)}
        </div>

        <ReactDataSheet
          data={table}
          valueRenderer={(cell) => cell.value}
          onCellsChanged={(changes) => {
            console.log(changes)
          }}
        />
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
