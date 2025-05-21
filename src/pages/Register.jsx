// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, authError, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // If user is already authenticated, redirect them to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Clear any auth errors when component mounts
    clearError();
  }, [isAuthenticated, navigate, clearError]);
  
  // Update local error state when authError changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  const validateForm = () => {
    // Display name validation
    if (!displayName.trim()) {
      setError('Display name is required');
      return false;
    }
    
    // Email validation
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password validation
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Terms acceptance validation
    if (!acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await register(email, password, displayName);
      
      // Registration successful, redirect to home page
      navigate('/');
    } catch (err) {
      // Error is already set via authError in the context
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Sign Up</h1>
          <p>Create your Critique account</p>
        </div>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              required
              autoComplete="name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <small className="password-hint">
              Password must be at least 6 characters
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />
          </div>
          
          <div className="form-terms">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              required
            />
            <label htmlFor="acceptTerms">
              I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;