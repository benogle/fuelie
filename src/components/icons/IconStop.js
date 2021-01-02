import React from 'react'
import PropTypes from 'prop-types'

const Icon = ({ fill, ...others }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" {...others}>
    <rect fill={fill} width="16" height="16" />
  </svg>
)

Icon.defaultProps = {
  fill: 'black',
}

Icon.propTypes = {
  fill: PropTypes.string,
}

export default Icon
