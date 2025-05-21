// src/pages/Settings.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import LogoutButton from '../components/auth/LogoutButton';
import './Settings.css';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setMessage({
        type: 'error',
        text: 'Failed to log out. Please try again.'
      });
    } finally {
      setLoading(false);
      setShowConfirmLogout(false);
    }
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
            <h1 className="settings-title">Account Settings</h1>
            
            {message && (
              <div className={`settings-message ${message.type}`}>
                {message.text}
              </div>
            )}
            
            <div className="settings-section">
              <h2 className="section-title">Profile Information</h2>
              
              <div className="settings-row">
                <div className="setting-label">Display Name</div>
                <div className="setting-value">
                  {currentUser?.displayName || 'Not set'}
                  <button className="edit-button">Edit</button>
                </div>
              </div>
              
              <div className="settings-row">
                <div className="setting-label">Email Address</div>
                <div className="setting-value">
                  {currentUser?.email || 'Not available'}
                </div>
              </div>
              
              <div className="settings-row">
                <div className="setting-label">Account Created</div>
                <div className="setting-value">
                  {currentUser?.metadata?.creationTime ? 
                    new Date(currentUser.metadata.creationTime).toLocaleDateString() :
                    'Not available'}
                </div>
              </div>
            </div>
            
            <div className="settings-section">
              <h2 className="section-title">Security</h2>
              
              <div className="settings-row">
                <div className="setting-label">Password</div>
                <div className="setting-value">
                  ••••••••
                  <button className="edit-button" onClick={() => navigate('/forgot-password')}>
                    Reset
                  </button>
                </div>
              </div>
              
              <div className="settings-row">
                <div className="setting-label">Two-Factor Authentication</div>
                <div className="setting-value">
                  Not enabled
                  <button className="edit-button" disabled>
                    Enable
                  </button>
                </div>
              </div>
            </div>
            
            <div className="settings-section">
              <h2 className="section-title">Notifications</h2>
              
              <div className="settings-row">
                <div className="setting-label">Email Notifications</div>
                <div className="setting-value">
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
              
              <div className="settings-row">
                <div className="setting-label">New Comment Notifications</div>
                <div className="setting-value">
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="settings-section">
              <h2 className="section-title">Account</h2>
              
              <div className="settings-row logout-row">
                <div className="setting-label">Log Out</div>
                <div className="setting-value">
                  {showConfirmLogout ? (
                    <div className="confirm-logout">
                      <span>Are you sure?</span>
                      <button 
                        className="confirm-yes" 
                        onClick={handleLogout}
                        disabled={loading}
                      >
                        {loading ? 'Logging out...' : 'Yes'}
                      </button>
                      <button 
                        className="confirm-no"
                        onClick={() => setShowConfirmLogout(false)}
                        disabled={loading}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="logout-button"
                      onClick={() => setShowConfirmLogout(true)}
                    >
                      Log Out
                    </button>
                  )}
                </div>
              </div>
              
              <div className="settings-row danger-row">
                <div className="setting-label">Delete Account</div>
                <div className="setting-value">
                  <button className="delete-account-button">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;