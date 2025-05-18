// src/services/postService.js
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    arrayUnion,
    serverTimestamp
  } from 'firebase/firestore';
  import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
  } from 'firebase/storage';
  import { auth, db, storage } from './firebase';
  
  // Create a new post
  export const createPost = async (postData, imageFile = null) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      let imageUrl = '';
      
      // Upload image if provided
      if (imageFile) {
        const storageRef = ref(storage, `post-images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Create the post
      const newPost = {
        title: postData.title,
        description: postData.description || '',
        imageUrl,
        community: postData.community, // This should be the community ID
        communityName: postData.communityName, // Store the name for easy querying
        author: user.uid,
        authorName: user.displayName,
        status: 'Open',
        editNumber: 0,
        comments: [],
        createdAt: serverTimestamp()
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'posts'), newPost);
      
      return {
        id: docRef.id,
        ...newPost
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };
  
  // Get all posts
  export const getAllPosts = async () => {
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate() // Convert Firestore timestamp to Date
      }));
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  };
  
  // Get posts for a specific community
  export const getPostsByCommunity = async (communityName) => {
    try {
      const q = query(
        collection(db, 'posts'),
        where('communityName', '==', communityName),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate() // Convert Firestore timestamp to Date
      }));
    } catch (error) {
      console.error('Error getting community posts:', error);
      throw error;
    }
  };
  
  // Update post status
  export const updatePostStatus = async (postId, newStatus) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        status: newStatus
      });
      return true;
    } catch (error) {
      console.error('Error updating post status:', error);
      throw error;
    }
  };
  
  // Add comment to post
  export const addComment = async (postId, text) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const newComment = {
        userId: user.uid,
        username: user.displayName,
        text,
        createdAt: serverTimestamp()
      };
      
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });
      
      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };