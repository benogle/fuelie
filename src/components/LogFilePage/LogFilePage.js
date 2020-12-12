import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import LogFile from 'lib/LogFile'

const Container = styled.div`
`

class LogFilePage extends React.Component {
  constructor (props) {
    super(props)
    const { filename, configProfile } = props
    this.logFile = new LogFile(filename, configProfile)
  }

  render () {
    const { filename, configProfile } = this.props
    return (
      <Container>
        <div>
          fname: {filename}
        </div>
        <div>
          {JSON.stringify(configProfile)}
        </div>
      </Container>
    )
  }
}

LogFilePage.propTypes = {
  filename: PropTypes.string.isRequired,
  configProfile: PropTypes.object.isRequired,
}

export default LogFilePage
