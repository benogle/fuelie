import React from 'react'
import PropTypes from 'prop-types'

const KEYLEFT = 37
const KEYUP = 38
const KEYRIGHT = 39
const KEYDOWN = 40
const KEYSPACE = 32

const arrowDirection = {
  [KEYUP]: 'up',
  [KEYDOWN]: 'down',
  [KEYLEFT]: 'left',
  [KEYRIGHT]: 'right',
}

class KeyboardTool extends React.Component {
  componentDidMount () {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown = (event) => {
    if (document.activeElement instanceof HTMLInputElement && document.activeElement.type !== 'range') return

    function handle () {
      event.preventDefault()
      event.stopPropagation()
      event.keyboardToolHandled = true
    }

    const isHandled = !!event.keyboardToolHandled

    if (event.keyCode >= KEYLEFT && event.keyCode <= KEYDOWN) {
      return this.callHandler('onArrow', { direction: arrowDirection[event.keyCode], event, handle, isHandled })
    } else if (event.keyCode === KEYSPACE) {
      return this.callHandler('onPausePlay', { event, handle, isHandled })
    }
  }

  callHandler (action, options) {
    const handler = this.props[action]
    if (handler) {
      handler(options)
    }
  }

  render () {
    return null
  }
}

KeyboardTool.propTypes = {
  onArrow: PropTypes.func,
  onPausePlay: PropTypes.func,
}

export default KeyboardTool
