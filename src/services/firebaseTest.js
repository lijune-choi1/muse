// src/services/firebaseTest.js
import { auth, db, storage } from './firebase';

console.log("Testing Firebase imports");
console.log("Auth:", auth);
console.log("DB:", db);
console.log("Storage:", storage);

// Try to access Firestore
const testFirestore = async () => {
  try {
    console.log("Testing Firestore connection...");
    const testCollection = db.collection('test');
    console.log("Firestore collection reference created:", testCollection);
    return "Firestore connection successful";
  } catch (error) {
    console.error("Firestore connection failed:", error);
    return "Firestore connection failed: " + error.message;
  }
};

export { testFirestore };