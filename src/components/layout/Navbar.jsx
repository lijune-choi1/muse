// src/components/layout/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import './Navbar.css'; // Make sure to import the CSS

const Navbar = () => {
  return (
    <nav>
        <div className="navbar">
        <div className="navbar-brand">
            <h1 className="navbar-title">Muse</h1>
            <span className="navbar-subtitle">making design critique + funding available for everyone :)</span>
        </div>
        <div className="navbar-actions">
            <Button variant="primary">Create Critique</Button>
            <div className="navbar-icon">
            {/* Notification icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            </div>
            <div className="profile-image"></div>
        </div>
        </div>
    </nav>
  );
};

export default Navbar;