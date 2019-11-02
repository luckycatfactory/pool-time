import { createGlobalStyle } from "styled-components"

const GlobalStyle = createGlobalStyle`
  body {
    color: #616161;
    font-family: Helvetica, Aria, sans-serif;
  }

  h1 {
    font-size: 36px;
    font-weight: 700;
  }

  h2 {
    font-size: 24px;
    font-weight: 700;
  }

  code {
    background-color: #eaeaea;
    color: #de697e;
    font-family: monospace;
  }

  a.active {
    box-shadow:inset 0px -4px 0px 0px #5d85e0;
  }
`

export default GlobalStyle
