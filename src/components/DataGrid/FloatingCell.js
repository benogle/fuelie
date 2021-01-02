import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const CellContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  position: absolute;
  background: rgba(255,255,255,.7);
  border: 1px solid rgba(0,0,0,.5);

  text-align: center;
`

class FloatingCell extends React.Component {
  render () {
    const { x, y, xWeight, yWeight, numRows, numColumns, children } = this.props
    const widthPct = 100 / numColumns
    const left = (widthPct * x) + (widthPct * (1 - xWeight))
    const heightPct = 100 / numRows
    const top = (heightPct * y) + (heightPct * (1 - yWeight))
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
  xWeight: PropTypes.number, // range: 0 - 1
  yWeight: PropTypes.number, // range: 0 - 1
  numColumns: PropTypes.number,
  numRows: PropTypes.number,
  children: PropTypes.node,
}

export default FloatingCell
