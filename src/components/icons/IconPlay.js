import React from 'react'
import PropTypes from 'prop-types'

// Icon from ionicons

const Icon = ({ fill, ...others }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" {...others}>
    <path fill={fill} d="M2,1.36237285 L2,14.6357373 C2,14.9157291 2.28436674,15.090724 2.51186013,14.9507281 L13.0334295,8.31404591 C13.256548,8.17404997 13.256548,7.82843501 13.0334295,7.68843908 L2.51186013,1.05175687 C2.28436674,0.907386066 2,1.08238098 2,1.36237285 Z" fillRule="nonzero" />
  </svg>
)

Icon.defaultProps = {
  fill: 'black',
}

Icon.propTypes = {
  fill: PropTypes.string,
}

export default Icon
