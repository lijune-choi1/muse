// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps your app and makes auth object available to any
// child component that calls useAuth().
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Clear any auth errors
  const clearError = () => {
    setAuthError(null);
  };

  // Register a new user
  const register = async (email, password, displayName) => {
    try {
      clearError();
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set the display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      console.log('User registered successfully:', userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error.code, error.message);
      
      // Set friendly error message
      let errorMessage = 'Failed to register. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use by another account.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use a stronger password.';
          break;
        default:
          errorMessage = error.message;
          break;
      }
      
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Login existing user
  const login = async (email, password) => {
    try {
      clearError();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully:', userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      
      // Set friendly error message
      let errorMessage = 'Failed to log in. Please check your credentials.';
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message;
          break;
      }
      
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Logout the current user
  const logout = async () => {
    try {
      clearError();
      await signOut(auth);
      
      // Clear any user-related data from localStorage
      localStorage.removeItem('currentUserName');
      localStorage.removeItem('userId');
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error.code, error.message);
      setAuthError('Failed to log out. Please try again.');
      throw error;
    }
  };
  
  // Reset password
  const resetPassword = async (email) => {
    try {
      clearError();
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully');
      return true;
    } catch (error) {
      console.error('Password reset error:', error.code, error.message);
      
      // Set friendly error message
      let errorMessage = 'Failed to send password reset email.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        default:
          errorMessage = error.message;
          break;
      }
      
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        // User is signed in
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'User',
          photoURL: user.photoURL,
        };
        
        setCurrentUser(userData);
        
        // Store user info in localStorage for components that don't use context
        localStorage.setItem('currentUserName', userData.displayName);
        localStorage.setItem('userId', userData.uid);
        
        console.log('User authenticated:', userData.displayName);
      } else {
        // User is signed out
        setCurrentUser(null);
        
        // Clear localStorage
        localStorage.removeItem('currentUserName');
        localStorage.removeItem('userId');
        
        console.log('No user authenticated');
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // For development/testing - sets a default user if none is authenticated
  useEffect(() => {
    if (!loading && !currentUser && process.env.NODE_ENV === 'development') {
      // Only use this for development testing if needed
      const useDevUser = false; // Set to true only when testing
      
      if (useDevUser) {
        // In development, set default test user
        const defaultUser = {
          uid: 'test-user-id',
          displayName: 'lijune.choi20',
          email: 'test@example.com',
        };
        
        setCurrentUser(defaultUser);
        
        // Store test user in localStorage
        localStorage.setItem('currentUserName', defaultUser.displayName);
        localStorage.setItem('userId', defaultUser.uid);
        
        console.log('Development mode: Set default test user');
      }
    }
  }, [loading, currentUser]);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    authError,
    clearError,
    register,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;