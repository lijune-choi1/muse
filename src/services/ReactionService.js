// src/services/ReactionService.js
// Simple service to track user reactions on posts without requiring backend

// In-memory storage for reactions
const postReactions = new Map();  // Store post reaction counts
const userReactions = new Map();  // Store user reactions to posts

class ReactionService {
  constructor() {
    // Try to load reactions from localStorage if available
    this._loadFromStorage();
    
    // Make the service available globally
    window.reactionService = this;
  }
  
  // Initialize a post with default reaction counts
  initializePost(postId, initialLikes = 0, initialHearts = 0) {
    if (!postReactions.has(postId)) {
      postReactions.set(postId, {
        likes: initialLikes,
        hearts: initialHearts
      });
      
      // Save to storage
      this._saveToStorage();
    }
  }
  
  // Get reaction counts for a post
  getReactionCounts(postId) {
    if (!postReactions.has(postId)) {
      this.initializePost(postId);
    }
    
    return postReactions.get(postId);
  }
  
  // Get user's reactions to a post
  getUserReactions(userId, postId) {
    if (!userReactions.has(userId)) {
      userReactions.set(userId, new Map());
    }
    
    const userPostReactions = userReactions.get(userId).get(postId) || { liked: false, hearted: false };
    
    return {
      hasLiked: userPostReactions.liked || false,
      hasHearted: userPostReactions.hearted || false
    };
  }
  
  // Toggle like for a post
  toggleLike(userId, postId) {
    // Initialize post reactions if needed
    if (!postReactions.has(postId)) {
      this.initializePost(postId);
    }
    
    // Initialize user reactions if needed
    if (!userReactions.has(userId)) {
      userReactions.set(userId, new Map());
    }
    
    // Get current user reaction for this post
    if (!userReactions.get(userId).has(postId)) {
      userReactions.get(userId).set(postId, { liked: false, hearted: false });
    }
    
    const currentReaction = userReactions.get(userId).get(postId);
    const hasLiked = !currentReaction.liked;
    
    // Update user reaction
    currentReaction.liked = hasLiked;
    userReactions.get(userId).set(postId, currentReaction);
    
    // Update post reaction count
    const postReaction = postReactions.get(postId);
    postReaction.likes = hasLiked 
      ? postReaction.likes + 1 
      : Math.max(0, postReaction.likes - 1);
    
    postReactions.set(postId, postReaction);
    
    // Save to storage
    this._saveToStorage();
    
    // Return updated state
    return {
      hasLiked,
      likesCount: postReaction.likes
    };
  }
  
  // Toggle heart for a post
  toggleHeart(userId, postId) {
    // Initialize post reactions if needed
    if (!postReactions.has(postId)) {
      this.initializePost(postId);
    }
    
    // Initialize user reactions if needed
    if (!userReactions.has(userId)) {
      userReactions.set(userId, new Map());
    }
    
    // Get current user reaction for this post
    if (!userReactions.get(userId).has(postId)) {
      userReactions.get(userId).set(postId, { liked: false, hearted: false });
    }
    
    const currentReaction = userReactions.get(userId).get(postId);
    const hasHearted = !currentReaction.hearted;
    
    // Update user reaction
    currentReaction.hearted = hasHearted;
    userReactions.get(userId).set(postId, currentReaction);
    
    // Update post reaction count
    const postReaction = postReactions.get(postId);
    postReaction.hearts = hasHearted 
      ? postReaction.hearts + 1 
      : Math.max(0, postReaction.hearts - 1);
    
    postReactions.set(postId, postReaction);
    
    // Save to storage
    this._saveToStorage();
    
    // Return updated state
    return {
      hasHearted,
      heartsCount: postReaction.hearts
    };
  }
  
  // Load reactions from localStorage if available
  _loadFromStorage() {
    try {
      // Load post reactions
      const storedPostReactions = localStorage.getItem('postReactions');
      if (storedPostReactions) {
        const parsedPostReactions = JSON.parse(storedPostReactions);
        
        // Convert the object back to a Map
        Object.entries(parsedPostReactions).forEach(([postId, reactions]) => {
          postReactions.set(postId, reactions);
        });
      }
      
      // Load user reactions
      const storedUserReactions = localStorage.getItem('userReactions');
      if (storedUserReactions) {
        const parsedUserReactions = JSON.parse(storedUserReactions);
        
        // Convert the nested object back to a nested Map
        Object.entries(parsedUserReactions).forEach(([userId, userPostReactions]) => {
          const userMap = new Map();
          
          Object.entries(userPostReactions).forEach(([postId, reactions]) => {
            userMap.set(postId, reactions);
          });
          
          userReactions.set(userId, userMap);
        });
      }
    } catch (error) {
      console.error('Error loading reactions from storage:', error);
    }
  }
  
  // Save reactions to localStorage if available
  _saveToStorage() {
    try {
      // Convert post reactions Map to object for storage
      const postReactionsObj = {};
      postReactions.forEach((reactions, postId) => {
        postReactionsObj[postId] = reactions;
      });
      
      // Convert user reactions nested Map to nested object for storage
      const userReactionsObj = {};
      userReactions.forEach((userPostReactions, userId) => {
        userReactionsObj[userId] = {};
        
        userPostReactions.forEach((reactions, postId) => {
          userReactionsObj[userId][postId] = reactions;
        });
      });
      
      // Save to localStorage
      localStorage.setItem('postReactions', JSON.stringify(postReactionsObj));
      localStorage.setItem('userReactions', JSON.stringify(userReactionsObj));
    } catch (error) {
      console.error('Error saving reactions to storage:', error);
    }
  }
}

// Create and export a singleton instance
const reactionService = new ReactionService();
export default reactionService;