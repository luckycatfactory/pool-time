import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    color: #353535;
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
    font-family: "Courier New", Courier, monospace;
    font-weight: 700;
  }

  a.active {
    box-shadow:inset 0px -4px 0px 0px #5d85e0;
  }
`;

export default GlobalStyle;
