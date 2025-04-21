import React, { useState } from 'react';

const AddDummyLogButton = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logLevel, setLogLevel] = useState('info');

  // Configuration for random log generation
  const CONFIG = {
    services: ['web-server', 'auth-service', 'payment-processor', 'user-service', 'inventory-api'],
    levels: ['info', 'warn', 'error', 'debug'],
  };

  const events = [
    'login', 'logout', 'page_view', 'button_click', 'form_submit',
    'api_call', 'database_query', 'payment_process', 'order_create',
    'user_signup', 'data_export', 'email_send', 'notification_send'
  ];

  const outcomes = [
    'succeeded', 'failed', 'timed out', 'partially completed',
    'rejected', 'accepted', 'queued', 'processed'
  ];

  // Random error messages
  const errors = [
    'Connection refused',
    'Timeout exceeded',
    'Invalid input',
    'Resource not found',
    'Permission denied',
    'Internal server error',
    'Service unavailable',
    'Database constraint violation',
    'Memory limit exceeded'
  ];

  const getRandomError = () => {
    return errors[Math.floor(Math.random() * errors.length)];
  };

  // Generate a random log entry
  const generateLogEntry = () => {
    const service = CONFIG.services[Math.floor(Math.random() * CONFIG.services.length)];
    const level = logLevel; // Use the selected log level
    
    const event = events[Math.floor(Math.random() * events.length)];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    const userId = Math.floor(Math.random() * 10000);
    const requestId = `req-${Math.random().toString(36).substring(2, 10)}`;
    
    let message = '';
    let metadata = {};
    
    switch (level) {
      case 'info':
        message = `${event} ${outcome} for user ${userId}`;
        metadata = { userId, requestId, duration: Math.random() * 500 };
        break;
      case 'warn':
        message = `Slow ${event} detected (${Math.floor(Math.random() * 1000)}ms)`;
        metadata = { userId, requestId, threshold: 200, performance: 'degraded' };
        break;
      case 'error':
        message = `Failed to process ${event}: ${getRandomError()}`;
        metadata = { userId, requestId, errorCode: Math.floor(Math.random() * 100) };
        break;
      case 'debug':
        message = `Detailed ${event} trace for request ${requestId}`;
        metadata = {
          userId,
          requestId,
          params: { id: userId, action: event },
          headers: { 'user-agent': 'Mozilla/5.0', 'content-type': 'application/json' }
        };
        break;
      default:
        message = `${event} ${outcome}`;
        metadata = { userId, requestId };
    }
    
    return {
      service,
      level,
      message,
      metadata
    };
  };

  // Send log to the producer
  const sendDummyLog = async () => {
    setIsLoading(true);
    
    try {
      const logEntry = generateLogEntry();
      
      const response = await fetch('/spunkless-producer-api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logEntry)
      });
      
      if (response.ok) {
        // Show notification
        setShowNotification(true);
        
        // Hide notification after 1 second
        setTimeout(() => {
          setShowNotification(false);
        }, 1000);
      } else {
        console.error('Failed to send log:', await response.text());
      }
    } catch (error) {
      console.error('Error sending log:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get button color based on log level
  const getButtonColor = () => {
    switch (logLevel) {
      case 'info': return 'bg-blue-600 hover:bg-blue-700';
      case 'warn': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'error': return 'bg-red-600 hover:bg-red-700';
      case 'debug': return 'bg-gray-600 hover:bg-gray-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  }

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-2">
      {/* Level selector */}
      <div className="bg-white shadow-md rounded-lg p-2 flex space-x-1">
        {CONFIG.levels.map(level => (
          <button
            key={level}
            onClick={() => setLogLevel(level)}
            className={`px-2 py-1 text-xs font-medium rounded ${
              logLevel === level 
                ? getLevelButtonActiveClass(level) 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {level.toUpperCase()}
          </button>
        ))}
      </div>
      
      {/* Floating button */}
      <button
        onClick={sendDummyLog}
        disabled={isLoading}
        className={`${getButtonColor()} text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center transition duration-300`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Dummy Log
          </>
        )}
      </button>
      
      {/* Notification */}
      {showNotification && (
        <div className="fixed bottom-24 right-6 bg-green-500 text-white py-2 px-4 rounded-md shadow-md transition-opacity duration-300 animate-pulse">
          Log sent successfully!
        </div>
      )}
    </div>
  );
};

// Helper function for level button styling
function getLevelButtonActiveClass(level) {
  switch (level) {
    case 'info': return 'bg-blue-500 text-white';
    case 'warn': return 'bg-yellow-500 text-white';
    case 'error': return 'bg-red-500 text-white';
    case 'debug': return 'bg-gray-500 text-white';
    default: return 'bg-blue-500 text-white';
  }
}

export default AddDummyLogButton;