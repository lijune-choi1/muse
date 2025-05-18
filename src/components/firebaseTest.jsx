// src/components/FirebaseTest.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

const FirebaseTest = () => {
  const [status, setStatus] = useState('Testing Firebase connection...');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if Firebase is initialized
    console.log("Firebase auth in component:", auth);
    console.log("Firebase db in component:", db);

    // Test authentication
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log("Auth state changed:", user);
      setUser(user);
    });

    // Test Firestore
    const testFirestore = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'test'));
        console.log("Firestore query snapshot:", querySnapshot);
        setStatus('Firebase connection successful!');
      } catch (error) {
        console.error("Firestore error:", error);
        setStatus('Firebase connection error: ' + error.message);
      }
    };

    testFirestore();

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Firebase Connection Test</h2>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>User:</strong> {user ? user.email : 'No user logged in'}</p>
    </div>
  );
};

export default FirebaseTest;