import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const CellContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  position: absolute;
  background: rgba(0,0,0,.1);
  border: 1px solid rgba(0,0,0,.5);

  text-align: center;
`

class FloatingCell extends React.Component {
  render () {
    const { x, y, xPctToNext, yPctToNext, numRows, numColumns, children } = this.props
    const widthPct = 100 / numColumns
    const left = (widthPct * x) + (widthPct * xPctToNext)
    const heightPct = 100 / numRows
    const top = (heightPct * y) + (heightPct * yPctToNext)
    return (
      <CellContainer
        style={{
          left: `${left}%`,
          top: `${top}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
        }}
      >
        <div>{children}</div>
      </CellContainer>
    )
  }
}

FloatingCell.defaultProps = {
}

FloatingCell.propTypes = {
  x: PropTypes.number, // actual column
  y: PropTypes.number, // actual row
  xPctToNext: PropTypes.number, // range: 0 - 1
  yPctToNext: PropTypes.number, // range: 0 - 1
  numColumns: PropTypes.number,
  numRows: PropTypes.number,
  children: PropTypes.node,
}

export default FloatingCell
