import React from 'react'
import PropTypes from 'prop-types'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-github'

export default class JSONEditor extends React.Component {
  handleChange = (value) => {
    const { onChange } = this.props
    onChange(value)
    // if (this.hasFocus && this.value) this.value = value
    // const obj = JSON.parse(value)
    // if (obj !== false) onChange(value)
  }

  render () {
    const { value, height } = this.props
    return (
      <AceEditor
        value={value}
        mode="json"
        theme="github"
        width="100%"
        height={height}
        onChange={this.handleChange}
        name="jsontho"
        editorProps={{ $blockScrolling: Infinity }}
      />
    )
  }
}

JSONEditor.defaultProps = {
  height: '100%',
}

JSONEditor.propTypes = {
  value: PropTypes.string.isRequired,
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
}
