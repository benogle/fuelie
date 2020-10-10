import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Container = styled.div`
`
class Main extends React.Component {
  render () {
    const { config } = this.props
    return (
      <Container>
        <div>
          {JSON.stringify(config)}
        </div>
      </Container>
    )
  }
}

Main.propTypes = {
  config: PropTypes.object.isRequired,
}

export default Main
