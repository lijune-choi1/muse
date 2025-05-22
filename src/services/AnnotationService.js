// src/services/AnnotationService.js
import firebase from './firebase';
import { getDatabase, ref, set, onValue, update, get, push } from 'firebase/database';

// Get a reference to the database
const db = getDatabase(firebase.app);

/**
 * Service for handling annotation data in Firebase
 * Enhanced to properly handle stroke persistence and user colors
 */
const annotationService = {
  /**
   * Generate a consistent color for a user based on their ID
   * @param {string} userId - The user's ID
   * @returns {string} - Hex color code
   */
  getUserColor: (userId) => {
    const colors = [
      '#ff4136', // Red
      '#0074D9', // Blue
      '#2ECC40', // Green
      '#ff851b', // Orange
      '#b10dc9', // Purple
      '#ffdc00', // Yellow
      '#001f3f', // Navy
      '#39cccc', // Teal
    ];
    
    // Generate a consistent index based on userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  },

  /**
   * Add a single annotation stroke to Firebase
   * @param {string} designId - The ID of the whiteboard/design
   * @param {Object} annotation - The annotation stroke to add
   * @param {Object} userProfile - The user who created the annotation
   * @returns {Promise<Object>} - Promise that resolves with the saved annotation
   */
  addAnnotation: async (designId, annotation, userProfile) => {
    try {
      // Create annotation with user info and consistent color
      const annotationWithUserInfo = {
        ...annotation,
        userId: userProfile.id,
        userName: userProfile.name,
        userAvatar: userProfile.avatar,
        userColor: annotationService.getUserColor(userProfile.id),
        timestamp: new Date().toISOString(),
        // Override the color with user-specific color for consistency
        color: annotation.color // Keep the chosen color, but store user color separately
      };
      
      // Use push to generate a unique key for each annotation
      const annotationsRef = ref(db, `whiteboards/${designId}/annotations`);
      const newAnnotationRef = push(annotationsRef);
      
      // Set the annotation with the generated key as its ID
      annotationWithUserInfo.id = newAnnotationRef.key;
      await set(newAnnotationRef, annotationWithUserInfo);
      
      console.log('Annotation saved with ID:', newAnnotationRef.key);
      return annotationWithUserInfo;
    } catch (error) {
      console.error('Error adding annotation to Firebase:', error);
      throw error;
    }
  },

  /**
   * Get all annotations for a design
   * @param {string} designId - The ID of the whiteboard/design
   * @returns {Promise<Array>} - Promise that resolves with array of annotations
   */
  getAnnotations: async (designId) => {
    try {
      console.log('Getting annotations for design:', designId);
      const annotationsRef = ref(db, `whiteboards/${designId}/annotations`);
      const snapshot = await get(annotationsRef);
      
      if (snapshot.exists()) {
        const annotationsObject = snapshot.val();
        console.log('Raw annotations from Firebase:', annotationsObject);
        
        // Convert object to array
        const annotationsArray = Object.keys(annotationsObject).map(key => ({
          ...annotationsObject[key],
          id: key
        }));
        
        console.log(`Loaded ${annotationsArray.length} annotations from Firebase:`, annotationsArray);
        return annotationsArray;
      }
      
      console.log('No annotations found in Firebase for design:', designId);
      return [];
    } catch (error) {
      console.error('Error getting annotations from Firebase:', error);
      return [];
    }
  },

  /**
   * Listen for real-time annotation updates
   * @param {string} designId - The ID of the whiteboard/design
   * @param {Function} callback - Function to call when annotations change
   * @returns {Function} - Unsubscribe function
   */
  listenForAnnotationChanges: (designId, callback) => {
    const annotationsRef = ref(db, `whiteboards/${designId}/annotations`);
    
    const unsubscribe = onValue(annotationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const annotationsObject = snapshot.val();
        // Convert object to array
        const annotationsArray = Object.keys(annotationsObject).map(key => ({
          ...annotationsObject[key],
          id: key
        }));
        
        console.log(`Real-time update: ${annotationsArray.length} annotations`);
        callback(annotationsArray);
      } else {
        console.log('Real-time update: No annotations');
        callback([]);
      }
    });
    
    return unsubscribe;
  },

  /**
   * Delete a specific annotation
   * @param {string} designId - The ID of the whiteboard/design
   * @param {string} annotationId - The ID of the annotation to delete
   * @returns {Promise<boolean>} - Promise that resolves when annotation is deleted
   */
  deleteAnnotation: async (designId, annotationId) => {
    try {
      const annotationRef = ref(db, `whiteboards/${designId}/annotations/${annotationId}`);
      await set(annotationRef, null);
      
      console.log('Annotation deleted:', annotationId);
      return true;
    } catch (error) {
      console.error('Error deleting annotation:', error);
      return false;
    }
  },

  /**
   * Clear all annotations for a specific user
   * @param {string} designId - The ID of the whiteboard/design
   * @param {string} userId - The ID of the user whose annotations to clear
   * @returns {Promise<boolean>} - Promise that resolves when user's annotations are cleared
   */
  clearUserAnnotations: async (designId, userId) => {
    try {
      const annotationsRef = ref(db, `whiteboards/${designId}/annotations`);
      const snapshot = await get(annotationsRef);
      
      if (snapshot.exists()) {
        const annotationsObject = snapshot.val();
        const updates = {};
        
        // Mark user's annotations for deletion
        Object.keys(annotationsObject).forEach(key => {
          if (annotationsObject[key].userId === userId) {
            updates[key] = null; // This will delete the annotation
          }
        });
        
        // Apply all updates at once
        if (Object.keys(updates).length > 0) {
          await update(annotationsRef, updates);
          console.log(`Cleared ${Object.keys(updates).length} annotations for user ${userId}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing user annotations:', error);
      return false;
    }
  },

  /**
   * Clear all annotations for a design
   * @param {string} designId - The ID of the whiteboard/design
   * @returns {Promise<boolean>} - Promise that resolves when all annotations are cleared
   */
  clearAllAnnotations: async (designId) => {
    try {
      const annotationsRef = ref(db, `whiteboards/${designId}/annotations`);
      await set(annotationsRef, null);
      
      console.log('All annotations cleared for design:', designId);
      return true;
    } catch (error) {
      console.error('Error clearing all annotations:', error);
      return false;
    }
  },

  /**
   * Get annotations by user
   * @param {string} designId - The ID of the whiteboard/design
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} - Promise that resolves with user's annotations
   */
  getUserAnnotations: async (designId, userId) => {
    try {
      const allAnnotations = await annotationService.getAnnotations(designId);
      const userAnnotations = allAnnotations.filter(anno => anno.userId === userId);
      
      console.log(`Found ${userAnnotations.length} annotations for user ${userId}`);
      return userAnnotations;
    } catch (error) {
      console.error('Error getting user annotations:', error);
      return [];
    }
  },

  /**
   * Save multiple annotations at once (for bulk operations)
   * @param {string} designId - The ID of the whiteboard/design
   * @param {Array} annotations - Array of annotation objects
   * @param {Object} userProfile - The user profile
   * @returns {Promise<Array>} - Promise that resolves with saved annotations
   */
  saveAnnotations: async (designId, annotations, userProfile) => {
    try {
      if (!annotations || annotations.length === 0) {
        // If no annotations, clear the entire node
        const annotationsRef = ref(db, `whiteboards/${designId}/annotations`);
        await set(annotationsRef, null);
        return [];
      }

      // Convert array to object with generated keys
      const annotationsObject = {};
      annotations.forEach(annotation => {
        const key = annotation.id || push(ref(db, `whiteboards/${designId}/annotations`)).key;
        annotationsObject[key] = {
          ...annotation,
          id: key,
          userId: annotation.userId || userProfile.id,
          userName: annotation.userName || userProfile.name,
          userColor: annotation.userColor || annotationService.getUserColor(annotation.userId || userProfile.id),
          timestamp: annotation.timestamp || new Date().toISOString()
        };
      });
      
      const annotationsRef = ref(db, `whiteboards/${designId}/annotations`);
      await set(annotationsRef, annotationsObject);
      
      console.log(`Saved ${annotations.length} annotations to Firebase`);
      return Object.values(annotationsObject);
    } catch (error) {
      console.error('Error saving annotations to Firebase:', error);
      throw error;
    }
  }
};

export default annotationService;