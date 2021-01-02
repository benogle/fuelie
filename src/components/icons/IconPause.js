import React from 'react'
import PropTypes from 'prop-types'

// Icon from ionicons

const Icon = ({ fill, ...others }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" {...others}>
    <path d="M6.63636 16H3V0H6.63636V16ZM13.1818 16H9.54545V0H13.1818V16Z" fill={fill} />
  </svg>
)

Icon.defaultProps = {
  fill: 'black',
}

Icon.propTypes = {
  fill: PropTypes.string,
}

export default Icon
