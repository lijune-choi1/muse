// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import global CSS
// Add to your src/index.js or App.js file
import './components/common/UserAvatar.css';

// This ensures the UserAvatar styles are loaded globally
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);