// src/pages/Settings.jsx
import React from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import './Settings.css';

const Settings = () => {
  // Sample user data
  const userData = {
    email: 'user@gmail.com',
    gender: 'Female',
    googleAccount: 'user@gmail.com'
  };

  return (
    <div className="layout">
      <Navbar />
      <div className="content-wrapper">
        <div className="sidebar-container">
          <Sidebar />
        </div>
        <div className="main-content">
          <div className="settings-container">
            <h1 className="settings-title">Settings</h1>
            
            <div className="settings-section">
              <h2 className="section-title">General</h2>
              
              <div className="settings-row">
                <div className="setting-label">Email Address</div>
                <div className="setting-value">{userData.email}</div>
              </div>
              
              <div className="settings-row">
                <div className="setting-label">Gender</div>
                <div className="setting-value">{userData.gender}</div>
              </div>
            </div>
            
            <div className="settings-section">
              <h2 className="section-title">Account Authorization</h2>
              
              <div className="settings-row">
                <div className="setting-label">Google</div>
                <div className="setting-value">{userData.googleAccount}</div>
              </div>
            </div>
            
            {/* Additional settings sections can be added here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;