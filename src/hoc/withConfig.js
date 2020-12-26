import React from 'react'
import UserConfigStore from 'common/UserConfigStore'

const userConfigStore = new UserConfigStore({ watch: true })

// Will inject the user config in as a `config` param. Watches for changes.
//
// compose(
//   withConfig()
// )(SomeView)
// OR
// withConfig()(SomeView)
const withConfig = (options) => (Component) => {
  class WithConfig extends React.Component {
    state = {
      userConfig: userConfigStore.getUserConfig(),
    }

    componentDidMount () {
      this.configDisposable = userConfigStore.onDidAnyChange(this.updateConfig)
    }

    componentWillUnmount (nextProps) {
      this.configDisposable()
    }

    updateConfig = (newStore, prevStore) => {
      this.setState({
        userConfig: userConfigStore.getUserConfig(),
        prevUserConfig: userConfigStore.getUserConfig(prevStore),
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
