// src/services/authService.js
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
  } from 'firebase/auth';
  import { doc, setDoc } from 'firebase/firestore';
  import { auth, db } from './firebase';
  
  // Check if auth is available
  if (!auth) {
    console.error("Auth is undefined in authService");
  }
  
  // Register a new user
  export const registerUser = async (email, password, username) => {
    if (!auth) throw new Error("Authentication service not available");
    
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with username
      await updateProfile(user, {
        displayName: username
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username,
        email,
        createdAt: new Date(),
        bio: '',
        joinedCommunities: []
      });
      
      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };
  
  // Login existing user
  export const loginUser = async (email, password) => {
    if (!auth) throw new Error("Authentication service not available");
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };
  
  // Logout user
  export const logoutUser = async () => {
    if (!auth) throw new Error("Authentication service not available");
    
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };
  
  // Get current user
  export const getCurrentUser = () => {
    if (!auth) return null;
    return auth.currentUser;
  };
  
  // Check if user is logged in
  export const isAuthenticated = () => {
    if (!auth) return false;
    return !!auth.currentUser;
  };