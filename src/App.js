import React from 'react'
import styled from 'styled-components'

import GlobalStyles from './style/global'
import Main from './Main'
import withConfig from './hoc/withConfig'

const MainWithConfig = withConfig()(Main)

const AppContainer = styled.div`
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
