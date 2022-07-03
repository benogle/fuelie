import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import UplotReact from 'uplot-react'
import isEqual from 'lodash/isEqual'

import Resizable from 'components/Resizable'
import { millisecondsToTimeCode } from 'common/helpers'

const DEFAULT_WIDTH = 10
const DEFAULT_HEIGHT = 10
const MIN_POINTS_IN_VIEW = 10
const MAX_POINTS_IN_VIEW = 6000

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
  width: 20px;
  -webkit-appearance: slider-vertical;
`

class LogFileChart extends React.Component {
  constructor (props) {
    super(props)
    this.cacheData(props)
    this.cacheOptions()
  }

  shouldComponentUpdate (nextProps, nextState) {
    return nextProps.replayIndex !== this.props.replayIndex ||
      !isEqual(nextProps.zoomConfig, this.props.zoomConfig)
  }

  componentDidUpdate () {
    this.redrawChart()
  }

  handleChartCreate = (uPlot) => {
    this.uPlot = uPlot
    setTimeout(() => this.redrawChart(), 0)
  }

  handleChangeRangeZoom = ({ target }) => {
    const { onChangeZoom } = this.props
    const pointsInView = Math.max(this.getMaxPointsInView() - parseInt(target.value), MIN_POINTS_IN_VIEW)
    onChangeZoom({ pointsInView })
  }

  handleMouseNop = function (uPlot, target, handler) {
    return (event) => {
      // handler(event)
      // console.log('mousedown', event)
    }
  }

  handleChangeSize = (newSize) => {
    this.cacheOptions(newSize)
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

  getZoomRange () {
    const { replayIndex } = this.props
    const pointsInView = this.getPointsInView()

    const halfPoints = Math.round(pointsInView / 2)
    const lastDataIndex = this.dataLength - 1

    // TODO: there is probably a oneliner here, but this works...
    let min = replayIndex - halfPoints
    let max = replayIndex + halfPoints
    if (min < 0) {
      min = 0
      max = Math.min(pointsInView, lastDataIndex)
    } else if (max > lastDataIndex) {
      min = Math.max(lastDataIndex - pointsInView, 0)
      max = lastDataIndex
    }

    return [this.cachedData[0][min], this.cachedData[0][max]]
  }

  getCursorPosition () {
    const { replayIndex } = this.props
    const xValue = this.cachedData[0][replayIndex]
    // console.log({
    //   replayIndex,
    //   xValue,
    //   getCursorPosition: this.uPlot?.valToPos?.(xValue, 'x', false),
    // })
    return this.uPlot?.valToPos?.(xValue, 'x', false) || 0
  }

  redrawChart () {
    const [min, max] = this.getZoomRange()
    this.uPlot.setScale('x', { min, max })
    requestAnimationFrame(() => {
      this.uPlot.setCursor({ top: 10, left: this.getCursorPosition() })
    })
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

  cacheOptions ({ width, height } = {}) {
    this.cachedOptions = {
      width: width || DEFAULT_WIDTH,
      height: height || DEFAULT_HEIGHT,
      legend: false,
      cursor: {
        y: false,
        lock: true,
        top: 10,
        left: this.getCursorPosition() || 0,
        // move: cursorMove,
        bind: {
          mousedown: this.handleMouseNop,
          mouseup: this.handleMouseNop,
          click: this.handleMouseNop,
          dblclick: this.handleMouseNop,

          mousemove: this.handleMouseNop,
          mouseleave: this.handleMouseNop,
          mouseenter: this.handleMouseNop,
        },
      },
      hooks: {
        // setScale: [
        //   (uPlot, scaleKey) => {
        //     // console.log('CHANGED SCALE', scaleKey, uPlot.scales)
        //   },
        // ],
      },
      series: [
        {
          value: (self, rawValue) => millisecondsToTimeCode(rawValue),
        },
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
      ],
      axes: [
        {
          values: (self, ticks) => ticks.map((rawValue) => millisecondsToTimeCode(rawValue)),
        },
        {
          scale: 'afr',
        },
      ],
      scales: {
        x: {
          time: false,
        },
        afr: {
          range: [8, 20],
        },
      },
    }
  }

  render () {
    // function cursorMove (uPlot, left, top) {
    //   console.log('MOVE', left, top, uPlot)
    //   return [left, top]
    // }
    console.log('render')

    return (
      <InnerContaier>
        <Resizable
          style={{ height: '100%', flex: 1 }}
          onChangeSize={this.handleChangeSize}
        >
          {({ width, height }) => (
            <UplotReact
              options={this.cachedOptions}
              data={this.cachedData}
              onCreate={this.handleChartCreate}
              onDelete={() => console.log('delete')}
            />
          )}
        </Resizable>
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

LogFileChart.defaultProps = {
  replayIndex: 0,
}

LogFileChart.propTypes = {
  logFile: PropTypes.object.isRequired,
  replayIndex: PropTypes.number.isRequired,
  onChangeZoom: PropTypes.func.isRequired,
  zoomConfig: PropTypes.shape({
    pointsInView: PropTypes.number,
    maxPointsInView: PropTypes.number,
  }),
}

export default LogFileChart
