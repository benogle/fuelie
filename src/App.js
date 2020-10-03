import React from 'react'
import styled from 'styled-components'

import GlobalStyles from './style/global'

const AppContainer = styled.div`
  background: #b0b0b0;
`

function App () {
  return (
    <AppContainer>
      <GlobalStyles />
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </AppContainer>
  )
}

export default App
