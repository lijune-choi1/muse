// src/services/ReactionService.js

class ReactionService {
    constructor() {
      this.reactions = {};
      this.userReactions = {};
      
      this._loadFromLocalStorage();
    }
    
    // Get reaction counts for a post
    getReactionCounts(postId) {
      if (!this.reactions[postId]) {
        return { likes: 0, hearts: 0 };
      }
      
      return { 
        likes: this.reactions[postId].likes || 0, 
        hearts: this.reactions[postId].hearts || 0 
      };
    }
    
    // Check if a user has reacted to a post
    getUserReactions(userId, postId) {
      const key = `${userId}_${postId}`;
      if (!this.userReactions[key]) {
        return { hasLiked: false, hasHearted: false };
      }
      
      return {
        hasLiked: this.userReactions[key].hasLiked || false,
        hasHearted: this.userReactions[key].hasHearted || false
      };
    }
    
    // Toggle a user's like reaction
    toggleLike(userId, postId) {
      // Initialize post reactions if needed
      if (!this.reactions[postId]) {
        this.reactions[postId] = { likes: 0, hearts: 0 };
      }
      
      // Initialize user reaction if needed
      const key = `${userId}_${postId}`;
      if (!this.userReactions[key]) {
        this.userReactions[key] = { hasLiked: false, hasHearted: false };
      }
      
      // Toggle like state
      const currentState = this.userReactions[key].hasLiked;
      this.userReactions[key].hasLiked = !currentState;
      
      // Update count
      this.reactions[postId].likes += !currentState ? 1 : -1;
      
      // Save changes
      this._saveToLocalStorage();
      
      // Return new reaction state
      return {
        hasLiked: this.userReactions[key].hasLiked,
        likesCount: this.reactions[postId].likes
      };
    }
    
    // Toggle a user's heart reaction
    toggleHeart(userId, postId) {
      // Initialize post reactions if needed
      if (!this.reactions[postId]) {
        this.reactions[postId] = { likes: 0, hearts: 0 };
      }
      
      // Initialize user reaction if needed
      const key = `${userId}_${postId}`;
      if (!this.userReactions[key]) {
        this.userReactions[key] = { hasLiked: false, hasHearted: false };
      }
      
      // Toggle heart state
      const currentState = this.userReactions[key].hasHearted;
      this.userReactions[key].hasHearted = !currentState;
      
      // Update count
      this.reactions[postId].hearts += !currentState ? 1 : -1;
      
      // Save changes
      this._saveToLocalStorage();
      
      // Return new reaction state
      return {
        hasHearted: this.userReactions[key].hasHearted,
        heartsCount: this.reactions[postId].hearts
      };
    }
    
    // Initialize post with default reaction counts
    initializePost(postId, initialLikes = 0, initialHearts = 0) {
      if (!this.reactions[postId]) {
        this.reactions[postId] = {
          likes: initialLikes,
          hearts: initialHearts
        };
        
        this._saveToLocalStorage();
      }
    }
    
    // Load from localStorage
    _loadFromLocalStorage() {
      try {
        const savedReactions = localStorage.getItem('postReactions');
        const savedUserReactions = localStorage.getItem('userReactions');
        
        if (savedReactions) {
          this.reactions = JSON.parse(savedReactions);
        }
        
        if (savedUserReactions) {
          this.userReactions = JSON.parse(savedUserReactions);
        }
      } catch (error) {
        console.error('Error loading reactions from localStorage:', error);
      }
    }
    
    // Save to localStorage
    _saveToLocalStorage() {
      try {
        localStorage.setItem('postReactions', JSON.stringify(this.reactions));
        localStorage.setItem('userReactions', JSON.stringify(this.userReactions));
      } catch (error) {
        console.error('Error saving reactions to localStorage:', error);
      }
    }
  }
  
  // Export a singleton instance
  const reactionService = new ReactionService();
  export default reactionService;