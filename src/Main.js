import qs from 'qs'
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import getMainProcess from './lib/getMainProcess'
import WelcomePage from './components/WelcomePage'

const Container = styled.div`
`

function getParams () {
  return qs.parse((global.location.search || '').slice(1))
}

class Main extends React.Component {
  constructor (props) {
    super(props)
    const { filename } = getParams()
    this.state = {
      filename,
    }
  }

  handleOpenFile = () => {
    const mainProcess = getMainProcess()
    mainProcess.openFile()
  }

  renderWelcome () {
    return (
      <WelcomePage
        onClick={this.handleOpenFile}
      />
    )
  }

  renderFile () {
    const { config } = this.props
    return (
      <Container>
        <div>
          fname: {this.state.filename}
        </div>
        <div>
          {JSON.stringify(config)}
        </div>
      </Container>
    )
  }

  render () {
    const { filename } = this.state
    return filename
      ? this.renderFile()
      : this.renderWelcome()
  }
}

Main.propTypes = {
  config: PropTypes.object.isRequired,
}

export default Main
