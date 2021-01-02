import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import theme from 'style/theme'

import IconPlay from 'components/icons/IconPlay'
import IconPause from 'components/icons/IconPause'
import IconStop from 'components/icons/IconStop'

const CONTENT_PADDING = 10
const COLOR_ENABLED = theme.colors.blacks[100]
const COLOR_DISABLED = theme.colors.blacks[30]

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;

  > * {
    display: block;
    margin-right: ${CONTENT_PADDING}px;

    &:last-child {
      margin-right: 0;
    }
  }

  > svg {
    cursor: pointer
  }
`

class PlaybackBar extends React.Component {
  render () {
    const {
      isEnabled, isPlaying, replaySpeedFactor, currentIndex, maxIndex,
      onPlay, onPause, onStop, onChangeIndex, onChangeReplaySpeedFactor,
    } = this.props
    return (
      <Container>
        {isPlaying
          ? (<IconPause fill={COLOR_ENABLED} onClick={onPause} />)
          : (<IconPlay fill={COLOR_ENABLED} onClick={onPlay} />)}

        <IconStop
          fill={isEnabled ? COLOR_ENABLED : COLOR_DISABLED}
          onClick={onStop}
        />

        <input
          style={{ flexGrow: 1 }}
          type="range"
          value={currentIndex}
          step="1"
          min={0}
          max={maxIndex}
          onChange={({ target }) => onChangeIndex(parseInt(target.value))}
        />

        <select
          onChange={({ target }) => onChangeReplaySpeedFactor(parseFloat(target.value))}
        >
          <option value="2" selected={replaySpeedFactor === 2}>2x</option>
          <option value="1" selected={replaySpeedFactor === 1}>1x</option>
          <option value="0.5" selected={replaySpeedFactor === 0.5}>1/2x</option>
          <option value="0.25" selected={replaySpeedFactor === 0.25}>1/4x</option>
          <option value="0.1" selected={replaySpeedFactor === 0.1}>1/10x</option>
          <option value="0.01" selected={replaySpeedFactor === 0.01}>1/100x</option>
        </select>

        <div style={{ width: 75 }}>
          {currentIndex}
        </div>
      </Container>
    )
  }
}

PlaybackBar.defaultProps = {
  isEnabled: false,
  isPlaying: false,
  replaySpeedFactor: 1,
  currentIndex: 0,
}

PlaybackBar.propTypes = {
  isEnabled: PropTypes.bool.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  currentIndex: PropTypes.number.isRequired,
  maxIndex: PropTypes.number.isRequired,
  lengthMS: PropTypes.number.isRequired,
  replaySpeedFactor: PropTypes.number.isRequired,

  onPlay: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  onChangeIndex: PropTypes.func.isRequired,
  onChangeReplaySpeedFactor: PropTypes.func.isRequired,
}

export default PlaybackBar
