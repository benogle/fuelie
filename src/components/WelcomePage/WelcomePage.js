import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import chroma from 'chroma-js'
import theme from 'style/theme'

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
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
    const { onClick } = this.props
    return (
      <Container>
        <Button onClick={onClick}>
          Open a CSV log file
        </Button>
        <OrContainer>or</OrContainer>
        <LinkButton>Open your config</LinkButton>
      </Container>
    )
  }
}

WelcomePage.propTypes = {
  onClick: PropTypes.func.isRequired,
}

export default WelcomePage
