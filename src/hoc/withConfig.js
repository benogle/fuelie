import React from 'react'
import UserConfigStore from 'common/UserConfigStore'

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
      this.userConfigStore = new UserConfigStore({
        onChange: this.handleConfigChange,
        store: window.electron.store,
      })
      this.state = {
        userConfig: this.userConfigStore.getUserConfig(),
      }
    }

    componentWillUnmount () {
      this.userConfigStore.destroy()
      this.userConfigStore = null
    }

    handleConfigChange = (newConfig, oldConfig) => {
      this.setState({
        userConfig: this.userConfigStore.getUserConfig(),
        prevUserConfig: this.userConfigStore.getUserConfig(oldConfig),
      })
    }

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
