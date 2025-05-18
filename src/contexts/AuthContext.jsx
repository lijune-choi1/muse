// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { loginUser, registerUser, logoutUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("AuthContext initialized with auth:", auth);

  useEffect(() => {
    let unsubscribe = () => {};

    const setupAuthListener = async () => {
      // Ensure auth is defined
      if (!auth) {
        console.error("Auth is undefined in AuthContext");
        setError("Firebase authentication not available");
        setLoading(false);
        return;
      }

      try {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log("Auth state changed:", user);
          setCurrentUser(user);
          
          if (user) {
            // Fetch additional user data from Firestore
            try {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                setUserProfile(userDoc.data());
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          } else {
            setUserProfile(null);
          }
          
          setLoading(false);
        });
      } catch (error) {
        console.error("Error setting up auth listener:", error);
        setError("Failed to set up authentication");
        setLoading(false);
      }
    };

    setupAuthListener();
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);
  
  // Authentication functions
  const login = async (email, password) => {
    try {
      return await loginUser(email, password);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };
  
  const register = async (email, password, username) => {
    try {
      return await registerUser(email, password, username);
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };
  
  const value = {
    currentUser,
    userProfile,
    login,
    register,
    logout,
    error,
    isAuthenticated: !!currentUser
  };
  
  if (error) {
    return (
      <AuthContext.Provider value={{ ...value, error }}>
        {!loading && children}
      </AuthContext.Provider>
    );
  }
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};