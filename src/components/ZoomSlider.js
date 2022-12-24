import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { millisecondsToTimeCode } from 'common/helpers'

const Container = styled.div`
  position: absolute;
  top: 16px;
  right: 20px;
  cursor: default;
  user-select: none;
`

const TriggerContainer = styled.div`
  background: rgba(230, 230, 230, 1);
  padding: 0 10px;
  height: 30px;
  line-height: 30px;
  text-align: center;
`

const RangeContainer = styled.div`
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 30px;
  right: 0;
  width: 30px;
  height: 250px;

  background: white;
  box-shadow: 0 1px 6px 0 rgba(0,0,0,0.1);
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

  handleToggle = () => {
    this.setState({ isOpen: !this.state.isOpen })
  }

  renderRange () {
    if (!this.state.isOpen) return null

    const { value, max, onChange } = this.props
    return (
      <RangeContainer>
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
    return (
      <Container>
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
