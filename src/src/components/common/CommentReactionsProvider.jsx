// src/context/CommentReactionsProvider.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import commentService from '../services/CommentService';

// Create context
const CommentReactionsContext = createContext();

// Custom hook to use the context
export const useCommentReactions = () => useContext(CommentReactionsContext);

const CommentReactionsProvider = ({ children }) => {
  // State for managing comments data
  const [commentsData, setCommentsData] = useState({});
  const [userReactions, setUserReactions] = useState({});
  
  // Current user ID - in a real app, this would come from authentication
  const userId = 'current_user'; // Replace with actual user ID from your auth system
  
  // Initialize data on component mount
  useEffect(() => {
    // Load all comments data
    const storedComments = commentService.getAllComments();
    setCommentsData(storedComments);
    
    // Load user's reactions for each comment
    const userReactionsData = {};
    
    Object.keys(storedComments).forEach(commentId => {
      userReactionsData[commentId] = commentService.getUserReactions(userId, commentId);
    });
    
    setUserReactions(userReactionsData);
  }, [userId]);
  
  // Toggle user reaction (agree/disagree)
  const toggleReaction = (commentId, reactionType) => {
    // Get current comment data
    const comment = commentsData[commentId];
    if (!comment) return;
    
    // Get current user reactions
    const currentUserReaction = userReactions[commentId] || { agreed: false, disagreed: false };
    const newUserReaction = { ...currentUserReaction };
    
    // Update reaction state based on type
    if (reactionType === 'agreed') {
      newUserReaction.agreed = !newUserReaction.agreed;
      if (newUserReaction.agreed && newUserReaction.disagreed) {
        newUserReaction.disagreed = false;
      }
    } else if (reactionType === 'disagreed') {
      newUserReaction.disagreed = !newUserReaction.disagreed;
      if (newUserReaction.disagreed && newUserReaction.agreed) {
        newUserReaction.agreed = false;
      }
    }
    
    // Update reactions count
    const newReactions = { ...comment.reactions };
    
    // Calculate the deltas based on previous state change
    if (reactionType === 'agreed') {
      newReactions.agreed = newReactions.agreed + (newUserReaction.agreed ? 1 : -1);
      if (newUserReaction.agreed && currentUserReaction.disagreed) {
        newReactions.disagreed--;
      }
    } else if (reactionType === 'disagreed') {
      newReactions.disagreed = newReactions.disagreed + (newUserReaction.disagreed ? 1 : -1);
      if (newUserReaction.disagreed && currentUserReaction.agreed) {
        newReactions.agreed--;
      }
    }
    
    // Ensure counts don't go below 0
    newReactions.agreed = Math.max(0, newReactions.agreed);
    newReactions.disagreed = Math.max(0, newReactions.disagreed);
    
    // Update local storage
    commentService.updateCommentReactions(commentId, newReactions, newUserReaction, userId);
    
    // Update state
    setCommentsData(prev => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        reactions: newReactions
      }
    }));
    
    setUserReactions(prev => ({
      ...prev,
      [commentId]: newUserReaction
    }));
    
    return { reactions: newReactions, userReacted: newUserReaction };
  };
  
  // Add reply to a comment
  const addReply = (commentId, reply) => {
    // Get current comment data
    const comment = commentsData[commentId];
    if (!comment) return null;
    
    // Add reply to comment
    const updatedComment = commentService.addReply(commentId, reply);
    
    if (updatedComment) {
      // Update state
      setCommentsData(prev => ({
        ...prev,
        [commentId]: updatedComment
      }));
      
      return updatedComment.replies;
    }
    
    return null;
  };
  
  // Update comment content
  const updateCommentContent = (commentId, content) => {
    const updatedComment = commentService.updateCommentContent(commentId, content);
    
    if (updatedComment) {
      setCommentsData(prev => ({
        ...prev,
        [commentId]: updatedComment
      }));
      
      return updatedComment;
    }
    
    return null;
  };
  
  // Update comment type
  const updateCommentType = (commentId, type) => {
    const updatedComment = commentService.updateCommentType(commentId, type);
    
    if (updatedComment) {
      setCommentsData(prev => ({
        ...prev,
        [commentId]: updatedComment
      }));
      
      return updatedComment;
    }
    
    return null;
  };
  
  // Delete a comment
  const deleteComment = (commentId) => {
    const deleted = commentService.deleteComment(commentId);
    
    if (deleted) {
      setCommentsData(prev => {
        const newData = { ...prev };
        delete newData[commentId];
        return newData;
      });
      
      setUserReactions(prev => {
        const newReactions = { ...prev };
        delete newReactions[commentId];
        return newReactions;
      });
      
      return true;
    }
    
    return false;
  };
  
  // Save a new comment
  const saveComment = (comment) => {
    const savedComment = commentService.saveComment(comment);
    
    if (savedComment) {
      setCommentsData(prev => ({
        ...prev,
        [comment.id]: savedComment
      }));
      
      return savedComment;
    }
    
    return null;
  };
  
  // Context value
  const value = {
    comments: commentsData,
    userReactions,
    toggleReaction,
    addReply,
    updateCommentContent,
    updateCommentType,
    deleteComment,
    saveComment,
    getUserReactions: (commentId) => userReactions[commentId] || { agreed: false, disagreed: false }
  };
  
  return (
    <CommentReactionsContext.Provider value={value}>
      {children}
    </CommentReactionsContext.Provider>
  );
};

export default CommentReactionsProvider;