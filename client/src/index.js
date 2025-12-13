// client/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // This is the ONE AND ONLY Router
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Router wraps the whole App here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);