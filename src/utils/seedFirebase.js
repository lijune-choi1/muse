// src/utils/seedFirebase.js
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // adjust path as needed
import { dummyPosts, dummyCommunities } from './seedData';

// Check if posts already exist
export const checkForExistingData = async () => {
  try {
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    const communitiesSnapshot = await getDocs(collection(db, 'communities'));
    
    return {
      postsExist: !postsSnapshot.empty,
      communitiesExist: !communitiesSnapshot.empty,
      postCount: postsSnapshot.size,
      communityCount: communitiesSnapshot.size
    };
  } catch (error) {
    console.error("Error checking for existing data:", error);
    return { error };
  }
};

// Seed communities first
export const seedCommunities = async () => {
  try {
    const results = [];
    
    for (const community of dummyCommunities) {
      // Check if community already exists
      const communityQuery = query(
        collection(db, 'communities'),
        where('name', '==', community.name)
      );
      
      const existingCommunities = await getDocs(communityQuery);
      
      if (existingCommunities.empty) {
        // Create a copy of the community data with serverTimestamp
        const communityData = {
          ...community,
          createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'communities'), communityData);
        results.push({ id: docRef.id, ...community });
      } else {
        console.log(`Community ${community.name} already exists.`);
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error seeding communities:", error);
    throw error;
  }
};

// Seed posts
export const seedPosts = async () => {
  try {
    const results = [];
    
    for (const post of dummyPosts) {
      // Check if post with same title already exists
      const postQuery = query(
        collection(db, 'posts'),
        where('title', '==', post.title)
      );
      
      const existingPosts = await getDocs(postQuery);
      
      if (existingPosts.empty) {
        // Create a copy of the post data with serverTimestamp
        const postData = {
          ...post,
          createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'posts'), postData);
        results.push({ id: docRef.id, ...post });
      } else {
        console.log(`Post "${post.title}" already exists.`);
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error seeding posts:", error);
    throw error;
  }
};

// Seed all data
export const seedAllData = async () => {
  try {
    const dataStatus = await checkForExistingData();
    
    if (dataStatus.error) {
      return { error: dataStatus.error, message: "Error checking for existing data" };
    }
    
    let communitiesResult = [];
    let postsResult = [];
    
    // Seed communities if needed
    if (!dataStatus.communitiesExist) {
      communitiesResult = await seedCommunities();
      console.log(`${communitiesResult.length} communities seeded successfully.`);
    } else {
      console.log(`Communities already exist (${dataStatus.communityCount} found). Skipping community seeding.`);
    }
    
    // Seed posts if needed
    if (!dataStatus.postsExist) {
      postsResult = await seedPosts();
      console.log(`${postsResult.length} posts seeded successfully.`);
    } else {
      console.log(`Posts already exist (${dataStatus.postCount} found). Skipping post seeding.`);
    }
    
    return {
      communities: communitiesResult,
      posts: postsResult,
      dataStatus
    };
  } catch (error) {
    console.error("Error seeding data:", error);
    return { error, message: "Error seeding data" };
  }
};