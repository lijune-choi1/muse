// src/services/CommentService.js
// Service for managing comment data including reactions and replies
import { auth } from './firebase';

class CommentService {
    constructor() {
      this.storageKey = 'comment_data';
      this.initializeStorage();
      this.currentUser = null;
      
      // Set up auth state listener to keep track of current user
      auth.onAuthStateChanged(user => {
        if (user) {
          this.currentUser = {
            uid: user.uid,
            name: user.displayName || 'Current User',
            email: user.email
          };
          console.log('CommentService: User authenticated as', this.currentUser.name);
          
          // Store current user in localStorage for components to access
          localStorage.setItem('currentUserName', this.currentUser.name);
          
          // Override any hardcoded values
          window.currentUserName = this.currentUser.name;
        } else {
          this.currentUser = null;
          console.log('CommentService: No user authenticated');
        }
      });
    }
  
    // Initialize storage if it doesn't exist
    initializeStorage() {
      if (!localStorage.getItem(this.storageKey)) {
        localStorage.setItem(this.storageKey, JSON.stringify({}));
      }
    }
    
    // Get the current user
    getCurrentUser() {
      // First check Firebase auth
      const user = auth.currentUser;
      if (user) {
        return {
          uid: user.uid,
          name: user.displayName || 'Current User',
          email: user.email
        };
      }
      
      // Fallback to stored user if available
      return this.currentUser;
    }
  
    // Get all comments data
    getAllComments() {
      try {
        return JSON.parse(localStorage.getItem(this.storageKey)) || {};
      } catch (error) {
        console.error('Error retrieving comments:', error);
        return {};
      }
    }
  
    // Get a specific comment by ID
    getComment(commentId) {
      const comments = this.getAllComments();
      return comments[commentId] || null;
    }
  
    // Save or update a comment
    saveComment(comment) {
      try {
        const comments = this.getAllComments();
        
        // Get current user
        const user = this.getCurrentUser();
        const userName = user?.name || 'Anonymous';
        
        // Override any hardcoded author name with the current user
        if (!comment.author || comment.author === 'Jane Doe') {
          comment.author = userName;
        }
        
        // Ensure comment has proper structure
        const updatedComment = {
          ...comment,
          author: comment.author || userName,  // Use current user name if not provided
          reactions: comment.reactions || { agreed: 0, disagreed: 0 },
          replies: comment.replies || []
        };
        
        comments[comment.id] = updatedComment;
        localStorage.setItem(this.storageKey, JSON.stringify(comments));
        
        return updatedComment;
      } catch (error) {
        console.error('Error saving comment:', error);
        return null;
      }
    }
  
    // Delete a comment
    deleteComment(commentId) {
      try {
        const comments = this.getAllComments();
        
        if (comments[commentId]) {
          delete comments[commentId];
          localStorage.setItem(this.storageKey, JSON.stringify(comments));
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Error deleting comment:', error);
        return false;
      }
    }
  
    // Update comment content
    updateCommentContent(commentId, newContent) {
      const comment = this.getComment(commentId);
      
      if (!comment) return null;
      
      comment.text = newContent;
      return this.saveComment(comment);
    }
  
    // Update comment type
    updateCommentType(commentId, newType) {
      const comment = this.getComment(commentId);
      
      if (!comment) return null;
      
      comment.type = newType;
      return this.saveComment(comment);
    }
  
    // Get user reactions for a comment
    getUserReactions(userId, commentId) {
      // If userId is not provided, use current user
      if (!userId) {
        const user = this.getCurrentUser();
        userId = user?.uid || 'anonymous';
      }
      
      const userReactionsKey = `user_reactions_${userId}`;
      let userReactions;
      
      try {
        userReactions = JSON.parse(localStorage.getItem(userReactionsKey)) || {};
      } catch (error) {
        console.error('Error retrieving user reactions:', error);
        userReactions = {};
      }
      
      return userReactions[commentId] || { agreed: false, disagreed: false };
    }
  
    // Update comment reactions
    updateCommentReactions(commentId, reactions, userReacted, userId) {
      // If userId is not provided, use current user
      if (!userId) {
        const user = this.getCurrentUser();
        userId = user?.uid || 'anonymous';
      }
      
      // Update comment reactions
      const comment = this.getComment(commentId);
      
      if (!comment) return null;
      
      comment.reactions = reactions;
      const updatedComment = this.saveComment(comment);
      
      // Update user reactions
      this.saveUserReaction(userId, commentId, userReacted);
      
      return updatedComment;
    }
  
    // Save user reaction
    saveUserReaction(userId, commentId, reaction) {
      // If userId is not provided, use current user
      if (!userId) {
        const user = this.getCurrentUser();
        userId = user?.uid || 'anonymous';
      }
      
      const userReactionsKey = `user_reactions_${userId}`;
      let userReactions;
      
      try {
        userReactions = JSON.parse(localStorage.getItem(userReactionsKey)) || {};
      } catch (error) {
        console.error('Error retrieving user reactions:', error);
        userReactions = {};
      }
      
      userReactions[commentId] = reaction;
      localStorage.setItem(userReactionsKey, JSON.stringify(userReactions));
    }
  
    // Add a reply to a comment
    addReply(commentId, reply) {
      const comment = this.getComment(commentId);
      
      if (!comment) return null;
      
      if (!comment.replies) {
        comment.replies = [];
      }
      
      // Get current user for the reply author if not provided
      if (!reply.author || reply.author === 'Jane Doe') {
        const user = this.getCurrentUser();
        reply.author = user?.name || 'Anonymous';
      }
      
      comment.replies.push(reply);
      return this.saveComment(comment);
    }
  
    // Get all replies for a comment
    getReplies(commentId) {
      const comment = this.getComment(commentId);
      
      if (!comment) return [];
      
      return comment.replies || [];
    }
  
    // Delete a reply from a comment
    deleteReply(commentId, replyId) {
      const comment = this.getComment(commentId);
      
      if (!comment || !comment.replies) return null;
      
      const replyIndex = comment.replies.findIndex(reply => reply.id === replyId);
      
      if (replyIndex === -1) return comment;
      
      comment.replies.splice(replyIndex, 1);
      return this.saveComment(comment);
    }
  }
  
  // Create singleton instance
  const commentService = new CommentService();

  // Initialize user name override to prevent "Jane Doe" from showing
  (function initializeUserName() {
    // Check if user is logged in through Firebase
    const user = auth.currentUser;
    if (user) {
      window.currentUserName = user.displayName || 'Current User';
      localStorage.setItem('currentUserName', window.currentUserName);
      console.log('Setting current user name from auth:', window.currentUserName);
    } else {
      // Set a default if no user is logged in
      const savedName = localStorage.getItem('currentUserName');
      window.currentUserName = savedName || 'Current User';
      console.log('Using saved/default user name:', window.currentUserName);
    }
    
    // Listen for auth state changes
    auth.onAuthStateChanged(user => {
      if (user) {
        window.currentUserName = user.displayName || 'Current User';
        localStorage.setItem('currentUserName', window.currentUserName);
        console.log('Updated user name after auth change:', window.currentUserName);
      }
    });
  })();
  
  export default commentService;