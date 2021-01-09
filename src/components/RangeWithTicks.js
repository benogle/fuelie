import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const StyledRange = styled.input.attrs({ type: 'range' })`
  position: relative;
  cursor: pointer;
  padding: 0;
  margin: 0;
  outline: none;
  flex-grow: 1;
`

const RangeContainer = styled.div`
  display: flex;
  position: relative;
  flex-grow: 1;
`

const TickContainer = styled.div`
  position: absolute;
  left: 7px;
  right: 9px;
  top: calc(50% + 4px);
  height: 10px;
`

const Tick = styled.div`
  position: absolute;
  top: 0;
  min-width: 3px;
  height: 100%;
  background: black;
  cursor: pointer;
  &:hover {
    background: red;
  }
`

class RangeWithTicks extends React.Component {
  renderTicks () {
    return this.props.ticks.map(this.renderTick)
  }

  renderTick = (tick) => {
    const { maxIndex, onClickTick } = this.props
    const { start, end } = tick
    function toPercentWidth (v) {
      return v * 100 / maxIndex
    }

    const left = `${toPercentWidth(start)}%`
    const width = end != null
      ? `${toPercentWidth(end - start)}%`
      : '2px'
    return (
      <Tick
        key={`tick${start}${end}`}
        style={{ left, width }}
        onClick={() => onClickTick(tick)}
      />
    )
  }

  render () {
    const { currentIndex, maxIndex, onChangeIndex } = this.props
    return (
      <RangeContainer>
        <TickContainer>
          {this.renderTicks()}
        </TickContainer>
        <StyledRange
          value={currentIndex}
          step="1"
          min={0}
          max={maxIndex}
          onChange={({ target }) => onChangeIndex(parseInt(target.value))}
        />
      </RangeContainer>
    )
  }
}

RangeWithTicks.defaultProps = {
  ticks: [],
  onClickTick: ({ start, end }) => {},
}

RangeWithTicks.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  maxIndex: PropTypes.number.isRequired,
  ticks: PropTypes.arrayOf(PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number,
  })).isRequired,

  onClickTick: PropTypes.func.isRequired,
  onChangeIndex: PropTypes.func.isRequired,
}

export default RangeWithTicks
