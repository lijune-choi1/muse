// src/components/auth/LogoutButton.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LogoutButton.css';

const LogoutButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the logout function from AuthContext
      await logout();
      
      // Clear any user-related data from localStorage
      localStorage.removeItem('currentUserName');
      localStorage.removeItem('userId');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Failed to log out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="logout-container">
      <button 
        className="logout-button"
        onClick={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? 'Logging out...' : 'Log Out'}
      </button>
      
      {error && <div className="logout-error">{error}</div>}
    </div>
  );
};

export default LogoutButton;