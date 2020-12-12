import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Container = styled.div`
`

class WelcomePage extends React.Component {
  render () {
    const { onClick } = this.props
    return (
      <Container>
        <button onClick={onClick}>
          Open a CSV log file
        </button>
      </Container>
    )
  }
}

WelcomePage.propTypes = {
  onClick: PropTypes.func.isRequired,
}

export default WelcomePage
