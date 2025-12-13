// client/src/App.js

import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import './App.css'; 

function App() {
  return (
    // AuthProvider wraps the entire application to provide login/logout state
    <AuthProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;