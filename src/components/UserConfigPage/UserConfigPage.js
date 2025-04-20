import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import theme from 'style/theme'

import Button from 'components/Button'
import JSONEditor from 'components/JSONEditor'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  padding : 10px;

  > * {
    margin-right: 10px;
  }
`

const StyledJSONEditor = styled(JSONEditor)`
  box-shadow: ${theme.boxShadows[50]};
`

const ErrorMessage = styled.div`
  color: red;
`

class UserConfigPage extends React.Component {
  state = {
    configValue: null,
    error: null,
  }

  componentDidMount () {
    window.electron.on('save', this.handleSave)
    this.editor.focus()
    this.editor.setCursorPosition(0, 0)
    document.title = 'Edit Config - Fuelie'
  }

  async componentDidUpdate (prevProps) {
    if (this.props.userConfig !== prevProps.userConfig) {
      this.handleChangeConfig()
    }
  }

  componentWillUnmount () {
    window.electron.removeListener('save', this.handleSave)
  }

  handleChangeConfig = () => {
    // Triggers a render and will re-read the config
    this.setState({ configValue: null, error: null })
  }

  handleChange = (value) => {
    this.setState({
      configValue: value,
      error: null,
    })
  }

  handleSave = () => {
    const { userConfig } = this.props
    const { configValue } = this.state
    if (!configValue) return

    this.editor.focus()

    console.log('SAving')

    try {
      const newStore = JSON.parse(configValue)
      userConfig.replaceConfig(newStore)
      // No need to update the state here. After setting the config, it will
      // trigger a change and ultimately call handleChangeConfig
    } catch (e) {
      // Problem parsing JSON
      console.log(e)
      this.setState({ error: e.message })
    }
  }

  render () {
    const { userConfig } = this.props
    const { configValue, error } = this.state
    const jsonString = configValue || JSON.stringify(userConfig.getConfig(), null, 2)
    return (
      <Container>
        <StyledJSONEditor
          ref={(e) => { this.editor = e }}
          value={jsonString}
          onChange={this.handleChange}
          mode="code"
          theme="ace/theme/monokai"
        />
        <ButtonContainer>
          <Button onClick={this.handleSave} disabled={!configValue}>
            Save
          </Button>
          <ErrorMessage>{error}</ErrorMessage>
        </ButtonContainer>
      </Container>
    )
  }
}

UserConfigPage.propTypes = {
  userConfig: PropTypes.object, // UserConfig instance
}

export default UserConfigPage
