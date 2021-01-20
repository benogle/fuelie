import React from 'react'
import PropTypes from 'prop-types'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-github'

export default class JSONEditor extends React.Component {
  handleChange = (value) => {
    const { onChange } = this.props
    onChange(value)
  }

  setCursorPosition (line, column) {
    this.editor.editor.moveCursorTo(line, column)
  }

  focus () {
    // Get to the actual ace editor
    this.editor.editor.focus()
  }

  render () {
    const { value, height, ...others } = this.props
    return (
      <AceEditor
        {...others}
        ref={(e) => { this.editor = e }}
        tabSize={2}
        cursorStart={1}
        value={value}
        focus
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
