import styled from 'styled-components'
import chroma from 'chroma-js'
import theme from 'style/theme'

const Button = styled.button`
  background: ${theme.colors.blue};
  border: 0;
  font-weight: bold;
  padding: 10px 20px;
  transition: background .2s ease;
  cursor: pointer;

  &:hover,
  &:active,
  &:focus {
    background: ${chroma(theme.colors.blue).saturate(0.5).hex()};
    outline: none;
  }
`

export default Button
