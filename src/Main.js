import qs from 'qs'
import React from 'react'
import PropTypes from 'prop-types'

import getMainProcess from 'lib/getMainProcess'
import WelcomePage from 'components/WelcomePage'
import LogFilePage from 'components/LogFilePage'
import UserConfigPage from 'components/UserConfigPage'
import withConfig from 'hoc/withConfig'

import { USER_CONFIG_FILENAME } from 'common/helpers'

const UserConfigPageWithConfig = withConfig()(UserConfigPage)

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

  handleOpenUserConfig = () => {
    const mainProcess = getMainProcess()
    mainProcess.openUserConfig()
  }

  renderWelcome () {
    return (
      <WelcomePage
        onClickOpenFile={this.handleOpenFile}
        onClickOpenUserConfig={this.handleOpenUserConfig}
      />
    )
  }

  renderUserConfig () {
    return <UserConfigPageWithConfig />
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
    if (this.filename === USER_CONFIG_FILENAME) {
      return this.renderUserConfig()
    }
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
