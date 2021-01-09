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

const tabFunction = {
  [KEYLEFT]: 'onPreviousTab',
  [KEYRIGHT]: 'onNextTab',
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
    const { metaKey, altKey, ctrlKey, keyCode } = event

    if (keyCode >= KEYLEFT && keyCode <= KEYDOWN) {
      if (((metaKey && altKey) || (ctrlKey && altKey)) && (keyCode === KEYLEFT || keyCode === KEYRIGHT)) {
        return this.callHandler(tabFunction[keyCode], { event, handle, isHandled })
      }
      return this.callHandler('onArrow', { direction: arrowDirection[keyCode], event, handle, isHandled })
    } else if (keyCode === KEYSPACE) {
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
  onNextTab: PropTypes.func,
  onPreviousTab: PropTypes.func,
}

export default KeyboardTool
