import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import LogFileChart from './LogFileChart'

// const DEFAULT_WIDTH = 10
// const DEFAULT_HEIGHT = 10
const MIN_POINTS_IN_VIEW = 10
const MAX_POINTS_IN_VIEW = 6000

const InnerContaier = styled.div`
  height: 100%;
  position: relative;
  display: flex;
}
`

const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  > * {
    height: 50%;
  }
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

class LogFileCharts extends React.Component {
  handleChangeRangeZoom = ({ target }) => {
    const { onChangeZoom } = this.props
    const pointsInView = Math.max(this.getMaxPointsInView() - parseInt(target.value), MIN_POINTS_IN_VIEW)
    onChangeZoom({ pointsInView })
  }

  getPointsInView () {
    return Math.round(Math.min(
      this.props.zoomConfig?.pointsInView ||
      this.props.zoomConfig?.maxPointsInView ||
      MAX_POINTS_IN_VIEW,
      this.dataLength,
    ))
  }

  getMaxPointsInView () {
    return this.props.zoomConfig?.maxPointsInView || MAX_POINTS_IN_VIEW
  }

  getZoomRangeValue () {
    return this.getMaxPointsInView() - this.getPointsInView()
  }

  renderChart (chartProps) {
    const { logFile, zoomConfig, replayIndex } = this.props
    return (
      <LogFileChart
        logFile={logFile}
        replayIndex={replayIndex}
        zoomConfig={zoomConfig}
        {...chartProps}
      />
    )
  }

  renderChart1 (props) {
    const columnNames = ['O2 #1', 'O2 #2', 'Engine Load', 'Throttle', 'Engine Speed', 'Oil Press (psi)']
    const config = {
      series: [
        {
          show: true,
          stroke: 'red',
          width: 1,
          scale: 'afr',
        },
        {
          show: true,
          stroke: 'blue',
          width: 1,
          scale: 'afr',
        },
        {
          show: true,
          stroke: 'green',
          width: 1,
          scale: 'mapPsi',
        },
        {
          show: true,
          stroke: 'magenta',
          width: 1,
          scale: '%',
        },
        {
          show: true,
          stroke: '#888',
          width: 1,
          scale: 'rpm',
        },
        {
          show: true,
          stroke: 'brown',
          width: 1,
          scale: 'oilPsi',
        },
      ],
      axes: [
        {
          scale: 'afr',
          labelGap: 0,
        },
        {
          scale: 'mapPsi',
          labelGap: 0,
          ticks: { show: false },
          grid: { show: false },
          stroke: 'green',
        },
        {
          show: false,
          scale: '%',
          labelGap: 0,
        },
        {
          show: false,
          scale: 'rpm',
          labelGap: 0,
        },
        {
          show: false,
          scale: 'oilPsi',
          labelGap: 0,
        },
      ],
      scales: {
        afr: {
          range: [8, 20],
        },
        mapPsi: {
          range: [-14, 11],
        },
        '%': {
          range: [0, 100],
        },
        rpm: {
          range: [0, 8000],
        },
        oilPsi: {
          range: [0, 100],
        },
      },
    }
    return this.renderChart({ columnNames, config, showTimeSeries: false })
  }

  renderChart2 (props) {
    const columnNames = ['Air Temp', 'Coolant Temp', 'Oil Temp (F)']
    const config = {
      hooks: {
        // setScale: [
        //   (uPlot, scaleKey) => {
        //     // console.log('CHANGED SCALE', scaleKey, uPlot.scales)
        //   },
        // ],
      },
      series: [
        {
          show: true,
          stroke: 'red',
          width: 1,
          scale: 'F',
        },
        {
          show: true,
          stroke: 'blue',
          width: 1,
          scale: 'F',
        },
        {
          show: true,
          stroke: 'green',
          width: 1,
          scale: 'F',
        },
      ],
      axes: [
        {
          scale: 'F',
          labelGap: 0,
        },
      ],
      scales: {
        F: {
          range: [100, 250],
        },
      },
    }
    return this.renderChart({ columnNames, config, paddingLeft: 50 })
  }

  render () {
    return (
      <InnerContaier>
        <ChartContainer>
          {this.renderChart1()}
          {this.renderChart2()}
        </ChartContainer>
        <StyledRange
          value={this.getZoomRangeValue()}
          step="1"
          min={0}
          max={this.getMaxPointsInView()}
          onChange={this.handleChangeRangeZoom}
        />
      </InnerContaier>
    )
  }
}

LogFileCharts.defaultProps = {
  replayIndex: 0,
}

LogFileCharts.propTypes = {
  logFile: PropTypes.object.isRequired,
  replayIndex: PropTypes.number.isRequired,
  onChangeZoom: PropTypes.func.isRequired,
  zoomConfig: PropTypes.shape({
    pointsInView: PropTypes.number,
    maxPointsInView: PropTypes.number,
  }),
}

export default LogFileCharts
