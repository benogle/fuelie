import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import LogFileChart from './LogFileChart'
import ZoomSlider from './ZoomSlider'

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
  gap: 25px;

  > * {
    height: 50%;
  }
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
    ))
  }

  getMaxPointsInView () {
    return this.props.zoomConfig?.maxPointsInView || MAX_POINTS_IN_VIEW
  }

  getZoomRangeValue () {
    return this.getMaxPointsInView() - this.getPointsInView()
  }

  renderChart (chartProps) {
    const { logFile, zoomConfig, replayIndex, onChangeReplayIndex } = this.props
    return (
      <LogFileChart
        logFile={logFile}
        replayIndex={replayIndex}
        zoomConfig={zoomConfig}
        onChangeReplayIndex={onChangeReplayIndex}
        {...chartProps}
      />
    )
  }

  renderChartConfig ({ chartConfig, showTimeSeries, key }) {
    const { scalesConfig, selectedColumnName } = this.props
    const columnNames = []
    const renderChartConfig = {
      series: [],
      axes: [],
      scales: scalesConfig,
    }
    let selectedLineIndex = 0
    for (let i = 0; i < chartConfig.lines.length; i++) {
      const line = chartConfig.lines[i]
      columnNames.push(line.column)

      if (line.column === selectedColumnName) {
        selectedLineIndex = i
      }

      renderChartConfig.axes.push({
        show: false,
        scale: line.scale,
        labelGap: 0,
      })
      renderChartConfig.series.push({
        show: line.show != null ? !!line.show : true,
        width: 1,
        stroke: line.color,
        scale: line.scale,
      })
    }
    renderChartConfig.axes[selectedLineIndex].show = true
    return this.renderChart({
      columnNames,
      config: renderChartConfig,
      showTimeSeries,
      key,
      height: chartConfig.height,
      selectedLineIndex,
    })
  }

  renderCharts () {
    const { pageConfig } = this.props
    const charts = pageConfig.charts || []
    return charts.map((chartConfig, index) => this.renderChartConfig({
      chartConfig,
      showTimeSeries: index === charts.length - 1,
      key: `chart${index}`,
    }))
  }

  renderZoom () {
    const { logFile } = this.props
    const zoomValue = this.getZoomRangeValue()
    const max = this.getMaxPointsInView()
    const msShown = logFile.getTimeMS(max - zoomValue - 1)
    return (
      <ZoomSlider
        value={zoomValue}
        max={this.getMaxPointsInView()}
        msShown={msShown}
        onChange={this.handleChangeRangeZoom}
      />
    )
  }

  render () {
    return (
      <InnerContaier>
        <ChartContainer>
          {this.renderCharts()}
        </ChartContainer>
        {this.renderZoom()}
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
  scalesConfig: PropTypes.object,
  pageConfig: PropTypes.shape({
    name: PropTypes.string,
    charts: PropTypes.arrayOf(PropTypes.shape({
      lines: PropTypes.array,
    })),
  }),
  zoomConfig: PropTypes.shape({
    pointsInView: PropTypes.number,
    maxPointsInView: PropTypes.number,
  }),

  onChangeZoom: PropTypes.func.isRequired,
  onChangeReplayIndex: PropTypes.func.isRequired,

  selectedColumnName: PropTypes.string,
}

export default LogFileCharts
