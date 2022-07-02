import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import fromPairs from 'lodash/fromPairs'
import UplotReact from 'uplot-react'

import Resizable from 'components/Resizable'

const DEFAULT_WIDTH = 10
const DEFAULT_HEIGHT = 10

const InnerContaier = styled.div`
  height: 100%;
  position: relative;

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
  render () {
    const { logFile } = this.props
    console.log('render chart')
    const columnNames = ['O2 #1', 'O2 #2']
    const logFileData = logFile.getData()
    const dataObj = {
      timeMS: [],
      ...fromPairs(columnNames.map((columnName) => [columnName, []])),
    }
    for (let i = 0; i < logFileData.length; i++) {
      const lineData = logFileData[i]
      dataObj.timeMS.push(logFile.getTimeMSAtIndex(i))
      columnNames.forEach((columnName) => {
        dataObj[columnName].push(lineData[columnName])
      })
    }
    const data = [
      dataObj.timeMS,
      ...columnNames.map((columnName) => dataObj[columnName]),
    ]

    const options = {
      legend: false,
      series: [
        {},
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
      scales: {
        x: {
          time: false,
        },
      },
    }
    return (
      <InnerContaier>
        <Resizable
          style={{ height: '100%' }}
        >
          {({ width, height }) => (
            <UplotReact
              options={{
                ...options,
                width: width || DEFAULT_WIDTH,
                height: height || DEFAULT_HEIGHT,
              }}
              data={data}
            />
          )}
        </Resizable>
      </InnerContaier>
    )
  }
}

LogFileChart.defaultProps = {
}

LogFileChart.propTypes = {
  logFile: PropTypes.object.isRequired,
}

export default LogFileChart
