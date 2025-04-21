// src/App.js
import React from 'react';
import { LogProvider } from './context/LogContext';
import LoggingDashboard from './components/LoggingDashboard';
import AddDummyLogButton from './components/AddDummyLogButton';
import './App.css';

function App() {
  return (
    <LogProvider>
      <LoggingDashboard />
      <AddDummyLogButton />
    </LogProvider>
  );
}

export default App;