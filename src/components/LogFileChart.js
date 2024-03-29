import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import UplotReact from 'uplot-react'
import isEqual from 'lodash/isEqual'
import clamp from 'lodash/clamp'

import Resizable from 'components/Resizable'
import { millisecondsToTimeCode, debounceRequestAnimationFrame } from 'common/helpers'

const DEFAULT_WIDTH = 10
const DEFAULT_HEIGHT = 10
// const MIN_POINTS_IN_VIEW = 10
const MAX_POINTS_IN_VIEW = 6000

const StyledResizable = styled(Resizable)`
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

class LogFileChart extends React.Component {
  state = {}
  constructor (props) {
    super(props)
    this.cacheData(props)
    this.cacheOptions(props)
  }

  shouldComponentUpdate (nextProps, nextState) {
    return nextProps.replayIndex !== this.props.replayIndex ||
      nextProps.selectedLineIndex !== this.props.selectedLineIndex ||
      !isEqual(nextProps.zoomConfig, this.props.zoomConfig) ||
      !isEqual(nextProps.config.series, this.props.config.series)
  }

  componentDidUpdate (prevProps) {
    const prevSeriesLength = prevProps.config?.series?.length
    if (prevSeriesLength != null && prevSeriesLength === this.props.config?.series?.length) {
      const prevSeries = prevProps.config?.series
      const newSeries = this.props.config?.series
      for (let i = 0; i < newSeries.length; i++) {
        if (newSeries[i].show !== prevSeries[i].show) {
          // series i + 1 because the x axis is at index 0, shifting all up 1
          this.uPlot.setSeries(i + 1, {
            show: !!newSeries[i].show, // always a boolean, never null/undefined
          }, false)
        }
      }
    }

    if (prevProps.selectedLineIndex !== this.props.selectedLineIndex) {
      this.uPlot.setSeries(prevProps.selectedLineIndex + 1, {
        focus: false,
      }, false)

      this.uPlot.setSeries(this.props.selectedLineIndex + 1, {
        focus: true,
      }, false)
    }

    this.redrawChart()
  }

  handleScrollWheel = (event) => {
    const { replayIndex, reverseScroll, onChangeReplayIndex } = this.props
    const indicesToShift = Math.round(this.getPointsPerPixel() * event.deltaX)
    const direction = reverseScroll ? -1 : 1
    onChangeReplayIndex(clamp(replayIndex + direction * indicesToShift, 0, this.dataLength - 1))
  }

  handleChartCreate = (uPlot) => {
    // console.log('create')
    this.uPlot = uPlot
    setTimeout(() => this.redrawChart(), 0)
  }

  handleClick (mouseStartPosition) {
    const { onChangeReplayIndex } = this.props
    onChangeReplayIndex(mouseStartPosition.index)
  }

  handleDrag (mouseStartPosition, event) {
    // TODO: make this cool?
  }

  handleMouseDown = (event) => {
    const index = this.uPlot.posToIdx(event.offsetX)
    this.mouseStartPosition = {
      index,
      x: event.offsetX,
      y: event.offsetY,
    }
    if (this.props.clickOnMouseDown) {
      this.handleClick(this.mouseStartPosition)
    }
  }

  handleMouseMove = (event) => {
    if (this.mouseStartPosition) {
      if (!this.dragging && Math.abs(this.mouseStartPosition.x - event.offsetX) >= 3) {
        this.dragging = true
      }

      if (this.dragging) {
        this.handleDrag(this.mouseStartPosition, event)
      }
    }
  }

  handleMouseUp = (event) => {
    if (this.mouseStartPosition && !this.dragging && !this.props.clickOnMouseDown) {
      this.handleClick(this.mouseStartPosition)
    }

    this.mouseStartPosition = null
    this.dragging = false
  }

  handleMouseNop = function (uPlot, target, handler) {
    return (event) => {
      // handler(event)
      // console.log('mousedown', event)
    }
  }

  handleChangeSize = (newSize) => {
    this.size = newSize
    this.cacheOptions(this.props, newSize)
  }

  getPointsPerPixel () {
    // TODO: make gutter (50) size removal auto
    return this.getPointsInView() / (this.size.width - 50)
  }

  getPointsInView () {
    return Math.round(Math.min(
      this.props.zoomConfig?.pointsInView ||
      this.props.zoomConfig?.maxPointsInView ||
      MAX_POINTS_IN_VIEW,
      this.dataLength,
    ))
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

  redrawChart = debounceRequestAnimationFrame(() => { // eslint-disable-line react/sort-comp
    const [min, max] = this.getZoomRange()
    this.uPlot.setScale('x', { min, max })
    this.redrawCursor()
  })

  // Redrawing the cursor in the next animation frame keeps the cursor in the center of the chart
  redrawCursor = debounceRequestAnimationFrame(() => {
    this.uPlot.setCursor({ top: 10, left: this.getCursorPosition() })
  })

  UNSAFE_componentWillReceiveProps (nextProps) { // eslint-disable-line react/sort-comp
    if (this.props.selectedLineIndex !== nextProps.selectedLineIndex) {
      // Cache them now and it will use them on the next render
      this.cacheOptions(nextProps, this.size)
    }
  }

  cacheData (props) {
    const { logFile, columnNames } = props
    const dataObj = logFile.getDataByColumnNames(columnNames)

    this.dataLength = dataObj.timeMS.length
    this.cachedData = [
      dataObj.timeMS,
      ...columnNames.map((columnName) => dataObj[columnName]),
    ]
  }

  cacheOptions (props, { width, height } = {}) {
    const { config, showTimeSeries } = props
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
          dblclick: this.handleMouseNop,
          mouseleave: this.handleMouseNop,
          mouseenter: this.handleMouseNop,

          // Dont really work?
          click: this.handleMouseNop,
          mouseup: this.handleMouseNop,

          mousemove: () => this.handleMouseMove,
          mousedown: () => this.handleMouseDown,
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
        ...config.series,
      ],
      axes: [
        {
          values: showTimeSeries
            ? (self, ticks) => ticks.map((rawValue) => millisecondsToTimeCode(rawValue))
            : (self, ticks) => ticks.map((rawValue) => ''),
          ticks: { show: showTimeSeries },
          // : (self, ticks) => ticks.map((rawValue) => 'a'),
          // stroke: showTimeSeries ? 'black' : 'transparent',
          // show: showTimeSeries,
        },
        ...config.axes,
      ],
      scales: {
        x: {
          time: false,
        },
        ...config.scales,
      },
    }
  }

  render () {
    // function cursorMove (uPlot, left, top) {
    //   console.log('MOVE', left, top, uPlot)
    //   return [left, top]
    // }
    const { paddingLeft, showTimeSeries, height } = this.props
    const style = {
      marginLeft: paddingLeft,
      marginBottom: showTimeSeries ? 0 : -50,
    }

    if (height) {
      style.height = height
    } else {
      style.flex = 1
    }

    return (
      <StyledResizable
        style={style}
        onChangeSize={this.handleChangeSize}
        onMouseUp={this.handleMouseUp}
        onWheel={this.handleScrollWheel}
      >
        {({ width, height }) => (
          <UplotReact
            options={this.cachedOptions}
            data={this.cachedData}
            onCreate={this.handleChartCreate}
            // onDelete={() => console.log('delete')}
          />
        )}
      </StyledResizable>
    )
  }
}

LogFileChart.defaultProps = {
  replayIndex: 0,
  selectedLineIndex: 0,
  paddingLeft: 0,
  showTimeSeries: true,
  clickOnMouseDown: true,
  reverseScroll: false,
  onChangeReplayIndex: () => {},
}

LogFileChart.propTypes = {
  logFile: PropTypes.object.isRequired,
  replayIndex: PropTypes.number.isRequired,
  selectedLineIndex: PropTypes.number.isRequired,
  columnNames: PropTypes.array,
  config: PropTypes.object,
  zoomConfig: PropTypes.shape({
    pointsInView: PropTypes.number,
    maxPointsInView: PropTypes.number,
  }),

  height: PropTypes.string,
  paddingLeft: PropTypes.number.isRequired,
  showTimeSeries: PropTypes.bool,
  clickOnMouseDown: PropTypes.bool,
  reverseScroll: PropTypes.bool,

  onChangeReplayIndex: PropTypes.func.isRequired,
}

export default LogFileChart
