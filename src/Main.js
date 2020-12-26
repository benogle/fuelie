import qs from 'qs'
import React from 'react'
import PropTypes from 'prop-types'

import getMainProcess from 'lib/getMainProcess'
import WelcomePage from 'components/WelcomePage'
import LogFilePage from 'components/LogFilePage'

function getParams () {
  return qs.parse((global.location.search || '').slice(1))
}

class Main extends React.Component {
  constructor (props) {
    super(props)
    const { filename } = getParams()
    this.filename = filename
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
    const { userConfig, prevUserConfig } = this.props
    return (
      <LogFilePage
        filename={this.filename}
        configProfile={userConfig.getConfigProfile()}
        prevConfigProfile={prevUserConfig ? prevUserConfig.getConfigProfile() : null}
      />
    )
  }

  render () {
    return this.filename
      ? this.renderFile()
      : this.renderWelcome()
  }
}

Main.propTypes = {
  userConfig: PropTypes.object.isRequired,
  prevUserConfig: PropTypes.object,
}

export default Main
