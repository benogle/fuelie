import debounce from 'lodash/debounce'
import React from 'react'
import UserConfigStore from 'common/UserConfigStore'
import req from 'common/req'

const fs = req('fs')

// Will inject the user config in as a `config` param. Watches for changes.
//
// compose(
//   withConfig()
// )(SomeView)
// OR
// withConfig()(SomeView)
const withConfig = (options) => (Component) => {
  class WithConfig extends React.Component {
    constructor (props) {
      super(props)
      this.userConfigStore = new UserConfigStore()
      this.state = {
        userConfig: this.userConfigStore.getUserConfig(),
      }
    }

    componentDidMount () {
      this.watchConfigFile()
    }

    componentWillUnmount (nextProps) {
      this.cleanUpWatcher()
    }

    cleanUpWatcher = () => {
      if (this.watcher) {
        this.watcher.close()
        this.watcher = null
      }
    }

    watchConfigFile = () => {
      this.cleanUpWatcher()

      // Save current config so child components can compare what changed on next change
      this.prevUserConfigValue = this.userConfigStore.store

      // https://nodejs.org/docs/latest/api/fs.html#fs_class_fs_fswatcher
      this.watcher = fs.watch(this.userConfigStore.path, { persistent: false }, this.updateConfig)
    }

    updateConfig = debounce(() => { // eslint-disable-line react/sort-comp
      this.setState({
        userConfig: this.userConfigStore.getUserConfig(),
        prevUserConfig: this.userConfigStore.getUserConfig(this.prevUserConfigValue),
      })

      // HACK: ideally calling watch only on mount would be all we need to do.
      // But I can't get the file watcher to work reliably more than once for
      // edits within the app. e.g. open the UserConfigPage window and edit a
      // thing 2x, the handler would only be called once. This will setup the
      // file watcher again after each change.
      this.watchConfigFile()
    }, 100)

    render () {
      return (
        <Component {...this.props} {...this.state} />
      )
    }
  }

  WithConfig.propTypes = {}

  return WithConfig
}

export default withConfig
