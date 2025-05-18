// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
// src/services/firebase.js
import { initializeApp } from 'firebase/app';
// Import these explicitly
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsZbil4OCrw6QMBeskudQRbMpo7P_w3kc",
  authDomain: "critiquemuse.firebaseapp.com",
  projectId: "critiquemuse",
  storageBucket: "critiquemuse.firebasestorage.app",
  messagingSenderId: "13208903047",
  appId: "1:13208903047:web:5046d6d3e3598ec716c722",
  measurementId: "G-0E0YDWXVQP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize services and export them
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

console.log("Firebase initialized:", { app, auth, db, storage });

export { auth, db, storage };
export default app;