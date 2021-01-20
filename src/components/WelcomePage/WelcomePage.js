import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import theme from 'style/theme'

import Button from 'components/Button'

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
`

const LinkButton = styled.button`
  background: none;
  color: ${theme.colors.blues[70]};
  border: 0;
  padding: 0;
  margin: 0;
  transition: color .2s ease;
  cursor: pointer;

  &:hover,
  &:active,
  &:focus {
    color: ${theme.colors.blues[80]};
    outline: none;
  }
`

const OrContainer = styled.div`
  margin: 10px 0;
`

class WelcomePage extends React.Component {
  render () {
    const { onClickOpenFile, onClickOpenUserConfig } = this.props
    return (
      <Container>
        <Button onClick={onClickOpenFile}>
          Open a CSV log file
        </Button>
        <OrContainer>or</OrContainer>
        <LinkButton
          onClick={onClickOpenUserConfig}
        >
          Open your config
        </LinkButton>
      </Container>
    )
  }
}

WelcomePage.propTypes = {
  onClickOpenFile: PropTypes.func.isRequired,
  onClickOpenUserConfig: PropTypes.func.isRequired,
}

export default WelcomePage
