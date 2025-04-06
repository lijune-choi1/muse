// src/services/CommentService.js
// Service for managing comment data including reactions and replies

class CommentService {
    constructor() {
      this.storageKey = 'comment_data';
      this.initializeStorage();
    }
  
    // Initialize storage if it doesn't exist
    initializeStorage() {
      if (!localStorage.getItem(this.storageKey)) {
        localStorage.setItem(this.storageKey, JSON.stringify({}));
      }
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
        
        // Ensure comment has proper structure
        const updatedComment = {
          ...comment,
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
      // Update comment reactions
      const comment = this.getComment(commentId);
      
      if (!comment) return null;
      
      comment.reactions = reactions;
      const updatedComment = this.saveComment(comment);
      
      // Update user reactions if userId is provided
      if (userId) {
        this.saveUserReaction(userId, commentId, userReacted);
      }
      
      return updatedComment;
    }
  
    // Save user reaction
    saveUserReaction(userId, commentId, reaction) {
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
  export default commentService;