import React from 'react'
import styled from 'styled-components'

import GlobalStyles from './style/global.js'
import Main from './Main.js'
import withConfig from './hoc/withConfig.js'

const MainWithConfig = withConfig()(Main)

const AppContainer = styled.div`
  height: 100%;
`

function App () {
  return (
    <AppContainer>
      <GlobalStyles />
      <MainWithConfig />
    </AppContainer>
  )
}

export default App
