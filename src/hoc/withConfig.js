import React from 'react'
import UserConfig from '../common/user-config'

const userConfig = new UserConfig({ watch: true })

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
      config: userConfig.store,
    }

    componentDidMount () {
      this.configDisposable = userConfig.onDidAnyChange(this.updateConfig)
    }

    componentWillUnmount (nextProps) {
      this.configDisposable()
    }

    updateConfig = (newConfig) => {
      this.setState({ config: newConfig })
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
