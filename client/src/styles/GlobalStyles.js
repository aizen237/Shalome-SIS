// client/src/styles/GlobalStyles.js
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    /* Define your primary color palette */
    --color-primary: #007bff;
    --color-secondary: #6c757d;
    --color-success: #28a745;
    --color-error: #dc3545;
    --color-background: #f8f9fa;
    --color-text: #343a40;
  }
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Arial', sans-serif;
    background-color: var(--color-background);
    color: var(--color-text);
    line-height: 1.6;
  }
  
  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;