import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import UplotReact from 'uplot-react'

import Resizable from 'components/Resizable'
import { millisecondsToTimeCode } from 'common/helpers'

const DEFAULT_WIDTH = 10
const DEFAULT_HEIGHT = 10
const MIN_POINTS_IN_VIEW = 10

const InnerContaier = styled.div`
  height: 100%;
  position: relative;
  display: flex;

  .uplot,
  .uplot *,
  .uplot *::before,
  .uplot *::after {
    box-sizing: border-box;
  }

  .uplot {
    width: min-content;
  }

  .u-wrap {
    position: relative;
    user-select: none;
  }

  .u-over,
  .u-under {
    position: absolute;
  }

  .u-under {
    overflow: hidden;
  }

  .uplot canvas {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
  }

  .u-axis {
    position: absolute;
  }

  .u-legend {
    display: none;
  }

  .u-select {
    background: rgba(0,0,0,0.07);
    position: absolute;
    pointer-events: none;
  }

  .u-series > * {
    padding: 4px;
  }

  .u-series th {
    cursor: pointer;
  }

  .u-cursor-x,
  .u-cursor-y {
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
    will-change: transform;
    z-index: 100;
  }

  .u-hz .u-cursor-x,
  .u-vt .u-cursor-y {
    height: 100%;
    border-right: 1px dashed #607D8B;
  }

  .u-hz .u-cursor-y,
  .u-vt .u-cursor-x {
    width: 100%;
    border-bottom: 1px dashed #607D8B;
  }

  .u-cursor-pt {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    border: 0 solid;
    pointer-events: none;
    will-change: transform;
    z-index: 100;
    /* this has to be !important since we set inline "background" shorthand */
    background-clip: padding-box !important;
  }

  .u-axis.u-off,
  .u-select.u-off,
  .u-cursor-x.u-off,
  .u-cursor-y.u-off,
  .u-cursor-pt.u-off {
    display: none;
}
`

const StyledRange = styled.input.attrs({ type: 'range' })`
  position: relative;
  cursor: pointer;
  padding: 0;
  margin: 0;
  outline: none;
  height: 100%;
  width: auto;
`

class LogFileChart extends React.Component {
  constructor (props) {
    super(props)
    this.cacheData(props)

    this.state = {
      // TODO: make this come in from the app state
      zoomPointsInView: this.dataLength,
    }
  }

  handleChartCreate = (uPlot) => {
    this.uPlot = uPlot
  }

  handleChangeRangeZoom = ({ target }) => {
    const zoomPercent = 100 - target.value
    const zoomPointsInView = Math.round(Math.max(this.dataLength * zoomPercent / 100, MIN_POINTS_IN_VIEW))
    this.setState({ zoomPointsInView })
  }

  getZoomPercent () {
    const { zoomPointsInView } = this.state
    return (1 - Math.min(zoomPointsInView, this.dataLength) / this.dataLength) * 100
  }

  getZoomRange () {
    const { replayIndex } = this.props
    const { zoomPointsInView } = this.state

    const halfPoints = Math.round(zoomPointsInView / 2)
    const lastDataIndex = this.dataLength - 1

    // TODO: there is probably a oneliner here, but this works...
    let min = replayIndex - halfPoints
    let max = replayIndex + halfPoints
    if (min < 0) {
      min = 0
      max = Math.min(zoomPointsInView, lastDataIndex)
    } else if (max > lastDataIndex) {
      min = Math.max(lastDataIndex - zoomPointsInView, 0)
      max = lastDataIndex
    }

    return [this.cachedData[0][min], this.cachedData[0][max]]
  }

  cacheData (props) {
    const { logFile } = props
    const columnNames = ['O2 #1', 'O2 #2']
    const dataObj = logFile.getDataByColumnNames(columnNames)

    this.dataLength = dataObj.timeMS.length
    this.cachedData = [
      dataObj.timeMS,
      ...columnNames.map((columnName) => dataObj[columnName]),
    ]
  }

  render () {
    // function cursorMove (uPlot, left, top) {
    //   console.log('MOVE', left, top, uPlot)
    //   return [left, top]
    // }

    const options = {
      legend: false,
      cursor: {
        y: false,
        // move: cursorMove,
        bind: {
          mousedown: function (uPlot, target, handler) {
            return (event) => {
              handler(event)
              console.log('mousedown', event)
            }
          },
        },
      },
      hooks: {
        setScale: [
          (uPlot, scaleKey) => {
            // console.log('CHANGED SCALE', scaleKey, uPlot.scales)
          },
        ],
      },
      series: [
        {
          value: (self, rawValue) => millisecondsToTimeCode(rawValue),
        },
        {
          show: true,
          stroke: 'red',
          width: 1,
        },
        {
          show: true,
          stroke: 'blue',
          width: 1,
        },
      ],
      axes: [
        {
          values: (self, ticks) => ticks.map((rawValue) => millisecondsToTimeCode(rawValue)),
        },
      ],
      scales: {
        x: {
          time: false,
          range: this.getZoomRange(),
        },
      },
    }
    return (
      <InnerContaier>
        <Resizable
          style={{ height: '100%', flex: 1 }}
        >
          {({ width, height }) => (
            <UplotReact
              options={{
                ...options,
                width: width || DEFAULT_WIDTH,
                height: height || DEFAULT_HEIGHT,
              }}
              data={this.cachedData}
              onCreate={this.handleChartCreate}
            />
          )}
        </Resizable>
        <StyledRange
          value={this.getZoomPercent()}
          step="0.1"
          min={0}
          max={100}
          onChange={this.handleChangeRangeZoom}
        />
      </InnerContaier>
    )
  }
}

LogFileChart.defaultProps = {
  replayIndex: 0,
}

LogFileChart.propTypes = {
  logFile: PropTypes.object.isRequired,
  replayIndex: PropTypes.number.isRequired,
}

export default LogFileChart
