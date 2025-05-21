// src/services/CritiqueService.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';

class CritiqueService {
  constructor() {
    // Remove the flags for initializing default data
  }
  
  // Modify checkData method to just check if data exists
  async checkData() {
    try {
      const communitiesSnapshot = await getDocs(collection(db, 'communities'));
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      
      return {
        communitiesExist: !communitiesSnapshot.empty,
        postsExist: !postsSnapshot.empty,
        error: null
      };
    } catch (error) {
      console.error('Error checking data:', error);
      return {
        communitiesExist: false,
        postsExist: false,
        error: error.message
      };
    }
  }
  
  // Remove the seedDummyData method or make it do nothing
  async seedDummyData() {
    return {
      success: false,
      message: 'Sample data functionality has been removed'
    };
  }

  // Remove the _initializeDefaultData method or make it return immediately
  async _initializeDefaultData() {
    return true; // Just return true without adding any data
  }

  // The rest of the class methods remain unchanged...
  // Create a new post
  async createPost(postData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      let imageUrl = postData.imageUrl || '';
      
      // Upload image if it's a file
      if (postData.imageFile) {
        const storageRef = ref(storage, `post-images/${Date.now()}_${postData.imageFile.name}`);
        await uploadBytes(storageRef, postData.imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Create the post
      const newPost = {
        title: postData.title,
        description: postData.description || '',
        imageUrl: imageUrl,
        community: postData.community, // This should be the community ID
        communityName: postData.communityName,
        author: user.uid,
        authorName: user.displayName || postData.author,
        status: postData.status || 'just-started',
        editNumber: 0,
        comments: [],
        createdAt: serverTimestamp()
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'posts'), newPost);
      
      return {
        id: docRef.id,
        ...newPost,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // Get all posts - remove the call to _initializeDefaultData
  async getAllPosts(communityName) {
    try {      
      let q;
      if (communityName) {
        q = query(
          collection(db, 'posts'),
          where('communityName', '==', communityName)
        );
      } else {
        q = collection(db, 'posts');
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()?.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) || 'Unknown date'
      }));
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  }

  // Get user's posts
  async getUserPosts(username) {
    try {
      const q = query(
        collection(db, 'posts'),
        where('authorName', '==', username)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()?.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) || 'Unknown date'
      }));
    } catch (error) {
      console.error('Error getting user posts:', error);
      throw error;
    }
  }

  // Get all communities - remove the call to _initializeDefaultData
  async getAllCommunities() {
    try {      
      const querySnapshot = await getDocs(collection(db, 'communities'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting communities:', error);
      throw error;
    }
  }

  // Create a new community
  async createCommunity(communityData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      // Format community name if needed
      const formattedName = communityData.name.startsWith('r/') 
        ? communityData.name 
        : `r/${communityData.name}`;
      
      // Create the community
      const newCommunity = {
        name: formattedName,
        description: communityData.description || '',
        guidelines: communityData.guidelines || [],
        rules: communityData.rules || [],
        visibility: communityData.visibility || 'Public',
        createdBy: user.uid,
        creatorUsername: user.displayName || communityData.createdBy,
        moderators: [user.uid],
        members: [user.uid],
        stats: { members: 1, online: 1 },
        createdAt: serverTimestamp()
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'communities'), newCommunity);
      
      // Also update the user's profile to show they're a member
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          joinedCommunities: arrayUnion(docRef.id)
        });
      } else {
        // Create user profile if it doesn't exist
        await setDoc(userRef, {
          uid: user.uid,
          username: user.displayName,
          email: user.email,
          joinedCommunities: [docRef.id],
          createdAt: serverTimestamp()
        });
      }
      
      return {
        id: docRef.id,
        ...newCommunity,
        createdDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      };
    } catch (error) {
      console.error('Error creating community:', error);
      throw error;
    }
  }

  // Get a community by name - remove the call to _initializeDefaultData
  async getCommunityByName(name) {
    try {      
      const formattedName = name.startsWith('r/') ? name : `r/${name}`;
      
      const q = query(
        collection(db, 'communities'),
        where('name', '==', formattedName)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error getting community by name:', error);
      throw error;
    }
  }

  // Get communities created by a user
  async getUserCreatedCommunities(username) {
    try {
      const q = query(
        collection(db, 'communities'),
        where('creatorUsername', '==', username)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user created communities:', error);
      throw error;
    }
  }

  // Get communities a user follows
  async getUserFollowedCommunities(username) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      // Get user document
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists() || !userDoc.data().joinedCommunities) {
        return [];
      }
      
      const joinedCommunityIds = userDoc.data().joinedCommunities;
      
      // Get each community
      const communities = [];
      for (const communityId of joinedCommunityIds) {
        const communityDoc = await getDoc(doc(db, 'communities', communityId));
        if (communityDoc.exists()) {
          communities.push({
            id: communityDoc.id,
            ...communityDoc.data()
          });
        }
      }
      
      return communities;
    } catch (error) {
      console.error('Error getting followed communities:', error);
      throw error;
    }
  }

  // Follow a community
  async followCommunity(username, communityId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      // Update user document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        joinedCommunities: arrayUnion(communityId)
      });
      
      // Update community members
      const communityRef = doc(db, 'communities', communityId);
      await updateDoc(communityRef, {
        members: arrayUnion(user.uid)
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error following community:', error);
      throw error;
    }
  }

  // Unfollow a community
  async unfollowCommunity(username, communityId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      // Update user document - need to get current list first
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().joinedCommunities) {
        const communities = userDoc.data().joinedCommunities.filter(
          id => id !== communityId
        );
        
        await updateDoc(userRef, {
          joinedCommunities: communities
        });
      }
      
      // Update community members - need to get current list first
      const communityRef = doc(db, 'communities', communityId);
      const communityDoc = await getDoc(communityRef);
      
      if (communityDoc.exists() && communityDoc.data().members) {
        const members = communityDoc.data().members.filter(
          id => id !== user.uid
        );
        
        await updateDoc(communityRef, {
          members: members
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error unfollowing community:', error);
      throw error;
    }
  }

  // Check if a user is following a community
  async isUserFollowingCommunity(username, communityId) {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists() || !userDoc.data().joinedCommunities) {
        return false;
      }
      
      return userDoc.data().joinedCommunities.includes(communityId);
    } catch (error) {
      console.error('Error checking if user follows community:', error);
      return false;
    }
  }

  // Get post by ID
  async getPostById(postId) {
    try {
      const docRef = doc(db, 'posts', postId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Post with ID ${postId} not found`);
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
        date: docSnap.data().createdAt?.toDate()?.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) || 'Unknown date'
      };
    } catch (error) {
      console.error('Error getting post by ID:', error);
      throw error;
    }
  }

  // Update an existing post
  async updatePost(postData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      // Get the existing post
      const postDoc = await getDoc(doc(db, 'posts', postData.id));
      
      if (!postDoc.exists()) {
        throw new Error(`Post with ID ${postData.id} not found`);
      }
      
      const existingPost = postDoc.data();
      
      // Check if current user is the author
      if (existingPost.author !== user.uid && existingPost.authorName !== user.displayName) {
        throw new Error('You do not have permission to edit this post');
      }
      
      let imageUrl = existingPost.imageUrl || '';
      
      // Upload new image if provided
      if (postData.imageFile) {
        const storageRef = ref(storage, `post-images/${Date.now()}_${postData.imageFile.name}`);
        await uploadBytes(storageRef, postData.imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Update post in Firestore
      const updateData = {
        title: postData.title,
        description: postData.description || existingPost.description,
        status: postData.status || existingPost.status,
        editNumber: postData.editNumber || (existingPost.editNumber + 1),
        updatedAt: serverTimestamp()
      };
      
      // Only update imageUrl if a new image was uploaded
      if (postData.imageFile) {
        updateData.imageUrl = imageUrl;
      }
      
      await updateDoc(doc(db, 'posts', postData.id), updateData);
      
      return {
        id: postData.id,
        ...existingPost,
        ...updateData,
        imageUrl,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      };
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  // Update an existing community
  async updateCommunity(communityData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      // Get the existing community
      const communityDoc = await getDoc(doc(db, 'communities', communityData.id));
      
      if (!communityDoc.exists()) {
        throw new Error(`Community with ID ${communityData.id} not found`);
      }
      
      const existingCommunity = communityDoc.data();
      
      // Check if current user is the creator
      if (existingCommunity.createdBy !== user.uid && existingCommunity.creatorUsername !== user.displayName) {
        throw new Error('You do not have permission to edit this community');
      }
      
      // Update community in Firestore
      const updateData = {
        description: communityData.description || existingCommunity.description,
        guidelines: communityData.guidelines || existingCommunity.guidelines,
        rules: communityData.rules || existingCommunity.rules,
        visibility: communityData.visibility || existingCommunity.visibility,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'communities', communityData.id), updateData);
      
      return {
        id: communityData.id,
        ...existingCommunity,
        ...updateData
      };
    } catch (error) {
      console.error('Error updating community:', error);
      throw error;
    }
  }
  
  // Whiteboard data methods
  async getWhiteboardData(postId) {
    try {
      const whiteboardRef = doc(db, 'whiteboards', postId);
      const whiteboardDoc = await getDoc(whiteboardRef);
      
      if (!whiteboardDoc.exists()) {
        return { comments: [], stamps: [] };
      }
      
      return whiteboardDoc.data();
    } catch (error) {
      console.error('Error getting whiteboard data:', error);
      throw error;
    }
  }

  async saveWhiteboardData(postId, data) {
    try {
      const whiteboardRef = doc(db, 'whiteboards', postId);
      await updateDoc(whiteboardRef, data);
      return { success: true };
    } catch (error) {
      // Document might not exist yet
      try {
        const whiteboardRef = doc(db, 'whiteboards', postId);
        await setDoc(whiteboardRef, data);
        return { success: true };
      } catch (setError) {
        console.error('Error saving whiteboard data:', setError);
        throw setError;
      }
    }
  }

  async addWhiteboardComment(postId, comment) {
    try {
      const whiteboardRef = doc(db, 'whiteboards', postId);
      const whiteboardDoc = await getDoc(whiteboardRef);
      
      if (!whiteboardDoc.exists()) {
        await setDoc(whiteboardRef, {
          comments: [comment],
          stamps: []
        });
      } else {
        await updateDoc(whiteboardRef, {
          comments: arrayUnion(comment)
        });
      }
      
      return comment;
    } catch (error) {
      console.error('Error adding whiteboard comment:', error);
      throw error;
    }
  }

  async addWhiteboardStamp(postId, stamp) {
    try {
      const whiteboardRef = doc(db, 'whiteboards', postId);
      const whiteboardDoc = await getDoc(whiteboardRef);
      
      if (!whiteboardDoc.exists()) {
        await setDoc(whiteboardRef, {
          comments: [],
          stamps: [stamp]
        });
      } else {
        await updateDoc(whiteboardRef, {
          stamps: arrayUnion(stamp)
        });
      }
      
      return stamp;
    } catch (error) {
      console.error('Error adding whiteboard stamp:', error);
      throw error;
    }
  }

  async getWhiteboardStats(postId) {
    try {
      const data = await this.getWhiteboardData(postId);
      const stats = { technical: 0, conceptual: 0, details: 0, total: 0 };
      
      if (data.comments?.length > 0) {
        data.comments.forEach(comment => {
          if (['technical', 'conceptual', 'details'].includes(comment.type?.toLowerCase())) {
            stats[comment.type.toLowerCase()]++;
            stats.total += comment.points || 0;
          }
        });
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting whiteboard stats:', error);
      throw error;
    }
  }

  // Alias methods for backward compatibility
  getFollowedCommunities(username) {
    return this.getUserFollowedCommunities(username);
  }

  getOwnedCommunities(username) {
    return this.getUserCreatedCommunities(username);
  }
}

// Export a singleton instance of the service
const critiqueService = new CritiqueService();
export default critiqueService;