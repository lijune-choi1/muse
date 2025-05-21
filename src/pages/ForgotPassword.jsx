// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!email.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter your email address'
      });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      
      await resetPassword(email);
      
      setMessage({
        type: 'success',
        text: 'Password reset email sent! Check your inbox for further instructions.'
      });
      
      // Clear the form
      setEmail('');
    } catch (error) {
      console.error('Error resetting password:', error);
      
      // Display appropriate error message based on the error
      if (error.code === 'auth/user-not-found') {
        setMessage({
          type: 'error',
          text: 'No account found with this email address.'
        });
      } else if (error.code === 'auth/invalid-email') {
        setMessage({
          type: 'error',
          text: 'Invalid email format. Please check and try again.'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to send password reset email. Please try again later.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>Reset Password</h1>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>
        
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="reset-button"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="forgot-password-actions">
          <Link to="/login" className="back-to-login">
            Back to Login
          </Link>
          <Link to="/settings" className="back-to-settings">
            Back to Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;