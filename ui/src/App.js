// src/App.js
import React from 'react';
import { LogProvider } from './context/LogContext';
import LoggingDashboard from './components/LoggingDashboard';
import './App.css';

function App() {
  return (
    <LogProvider>
      <LoggingDashboard />
    </LogProvider>
  );
}

export default App;