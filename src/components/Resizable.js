import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'

// <Resizable> will watch for window resize events, and pass you the size of
// the element when it changes.
//
// Usage:
//
// <Resizable>
//   {({ width, height }) => (
//     <YourComponent width={width}>
//       cats
//     </YourComponent>
//   )}
// </Resizable>
//
// Note that unless there is content, the height will be junk.

const RESIZE_DEBOUNCE_MS = 100

class Resizable extends React.Component {
  state = {
    width: 0,
    height: 0,
    isHidden: false,
  }

  componentDidMount () {
    this.updateWidth()
    window.addEventListener('resize', this.handleResize)
  }

  UNSAFE_componentWillReceiveProps (nextProps) { // eslint-disable-line react/sort-comp
    if (this.state.isHidden) this.handleResize()
  }

  componentWillUnmount () {
    this.handleResize.cancel()
    window.removeEventListener('resize', this.handleResize)
  }

  handleResize = _.debounce(() => {
    this.updateWidth()
  }, RESIZE_DEBOUNCE_MS)

  updateWidth = () => {
    if (!this.element) return
    const { offsetWidth, offsetHeight } = this.element
    const width = offsetWidth
    const height = offsetHeight
    if (width === 0) {
      this.setState({ isHidden: true })
    } else if (width !== this.state.width || height !== this.state.height) {
      this.setState({
        isHidden: false,
        width,
        height,
      })
    }
  }

  render () {
    const { children, component, innerRef, ...others } = this.props
    const Component = component
    const refFn = (el) => {
      if (el) {
        this.element = el
        if (innerRef) innerRef(el)
      }
    }
    const props = { ref: refFn }

    // Capture refs on styled components...
    if (typeof component !== 'string') {
      props.innerRef = refFn
    }

    return (
      <Component {...others} {...props}>
        {children(this.state)}
      </Component>
    )
  }
}

Resizable.defaultProps = {
  component: 'div',
}

Resizable.propTypes = {
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  children: PropTypes.func.isRequired,
  innerRef: PropTypes.func,
}

export default Resizable
