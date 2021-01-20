import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import chroma from 'chroma-js'
import theme from 'style/theme'

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

const Button = styled.button`
  background: ${theme.colors.blue};
  border: 0;
  font-weight: bold;
  padding: 10px 20px;
  transition: background .2s ease;
  cursor: pointer;

  &:hover,
  &:active,
  &:focus {
    background: ${chroma(theme.colors.blue).saturate(0.5).hex()};
    outline: none;
  }
`
const ErrorMessage = styled.div`
  color: red;
`

class UserConfigPage extends React.Component {
  state = {
    configValue: null,
  }

  async componentDidUpdate (prevProps) {
    if (this.props.userConfig !== prevProps.userConfig) {
      this.handleChangeConfig()
    }
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

  handleSave = (value) => {
    const { userConfig } = this.props
    const { configValue } = this.state
    if (!configValue) return

    try {
      const newStore = parseJSON(configValue)
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
    console.log('render', !!configValue)
    const jsonString = configValue || JSON.stringify(userConfig.getConfig(), null, 2)
    return (
      <Container>
        <JSONEditor
          value={jsonString}
          onChange={this.handleChange}
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

function parseJSON (jsonStr) {
  // HACK: Welll, this is not so safe
  const func = new Function(`return ((${jsonStr}))`) // eslint-disable-line
  return func()
}

UserConfigPage.propTypes = {
  userConfig: PropTypes.object, // UserConfig instance
}

export default UserConfigPage
