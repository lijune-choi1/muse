// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LogoutButton from '../auth/LogoutButton';
import './Navbar.css';

const Navbar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Toggle user dropdown menu
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.displayName) return 'U';
    
    const nameParts = currentUser.displayName.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    
    return nameParts[0][0].toUpperCase();
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">+Critique.lite</Link>
      </div>
      
      <div className="navbar-center">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search communities or posts..."
            className="search-input"
          />
          <button className="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <Link to="/create-critique-post" className="create-post-btn">
              Create Post
            </Link>
            
            <div className="user-menu-container">
              <button
                className="user-avatar"
                onClick={toggleUserMenu}
                aria-label="User menu"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="user-avatar-img"
                  />
                ) : (
                  <div className="user-avatar-initials">
                    {getUserInitials()}
                  </div>
                )}
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <span className="user-dropdown-name">
                      {currentUser.displayName || 'User'}
                    </span>
                    <span className="user-dropdown-email">
                      {currentUser.email || ''}
                    </span>
                  </div>
                  
                  <ul className="user-dropdown-menu">
                    <li>
                      <Link to="/profile" className="user-dropdown-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" className="user-dropdown-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                    </li>
                    <li className="divider"></li>
                    <li>
                      <div className="user-dropdown-item logout-wrapper">
                        <LogoutButton />
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-btn">
              Log In
            </Link>
            <Link to="/register" className="signup-btn">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;