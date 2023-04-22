import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { millisecondsToTimeCode } from 'common/helpers'

const ZOOM_SLIDER_CLASSNAME = 'zoom-slider'

const Container = styled.div`
  background: rgba(230, 230, 230, 1);
  position: absolute;
  top: 16px;
  right: 20px;
  cursor: default;
  user-select: none;

  ${({ isOpen }) => isOpen && `
    background: white;
    box-shadow: 0 1px 6px 0 rgba(0,0,0,0.1);
  `}
`

const TriggerContainer = styled.div`
  padding: 0 10px;
  height: 30px;
  line-height: 30px;
  text-align: center;
`

const RangeContainer = styled.div`
  padding: 20px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 250px;
`

const RangeTicks = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  justify-content: space-between;
  font-family: monospace;
`

const StyledRange = styled.input.attrs({ type: 'range' })`
  position: relative;
  cursor: pointer;
  padding: 0;
  margin: 0;
  outline: none;
  height: 100%;
  width: 20px;
  -webkit-appearance: slider-vertical;
`

class ZoomSlider extends React.Component {
  state = {
    isOpen: false,
  }

  handleWindowClose = (event) => {
    const isInSlider = !!event.target.closest(`.${ZOOM_SLIDER_CLASSNAME}`)
    if (!isInSlider && this.state.isOpen) {
      this.handleToggle()
    }
  }

  handleToggle = () => {
    const newIsOpen = !this.state.isOpen
    this.setState({ isOpen: newIsOpen })
    window[newIsOpen ? 'addEventListener' : 'removeEventListener']('mousedown', this.handleWindowClose)
  }

  renderRange () {
    if (!this.state.isOpen) return null

    const { value, max, onChange } = this.props
    return (
      <RangeContainer>
        <RangeTicks>
          <div>+</div>
          <div>-</div>
        </RangeTicks>
        <StyledRange
          value={value}
          step="1"
          min={0}
          max={max}
          onChange={onChange}
        />
      </RangeContainer>
    )
  }

  render () {
    const { msShown } = this.props
    const { isOpen } = this.state
    return (
      <Container isOpen={isOpen} className={ZOOM_SLIDER_CLASSNAME}>
        <TriggerContainer onClick={this.handleToggle}>
          Z {millisecondsToTimeCode(msShown)}
        </TriggerContainer>
        {this.renderRange()}
      </Container>
    )
  }
}

ZoomSlider.defaultProps = {
}

ZoomSlider.propTypes = {
  max: PropTypes.number,
  value: PropTypes.number,
  msShown: PropTypes.number,
  onChange: PropTypes.func.isRequired,
}

export default ZoomSlider
