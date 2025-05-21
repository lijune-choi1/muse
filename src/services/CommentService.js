// src/services/CommentService.js
// Service for managing comment data including reactions and replies in Firebase
import { auth, db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp 
} from 'firebase/firestore';

class CommentService {
    constructor() {
      this.commentsCollection = 'comments';
      this.reactionsCollection = 'reactions';
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
  
    // Get all comments for a specific design
    async getCommentsByDesignId(designId) {
      try {
        const commentsRef = collection(db, this.commentsCollection);
        const q = query(commentsRef, where('designId', '==', designId));
        const querySnapshot = await getDocs(q);
        
        const comments = {};
        querySnapshot.forEach((doc) => {
          comments[doc.id] = {
            id: doc.id,
            ...doc.data()
          };
        });
        
        return comments;
      } catch (error) {
        console.error('Error retrieving comments:', error);
        return {};
      }
    }
  
    // Get a specific comment by ID
    async getComment(commentId) {
      try {
        const commentRef = doc(db, this.commentsCollection, commentId);
        const commentDoc = await getDoc(commentRef);
        
        if (commentDoc.exists()) {
          return {
            id: commentDoc.id,
            ...commentDoc.data()
          };
        }
        
        return null;
      } catch (error) {
        console.error('Error retrieving comment:', error);
        return null;
      }
    }
  
    // Save or update a comment
    async saveComment(comment) {
      try {
        // Get current user
        const user = this.getCurrentUser();
        const userName = user?.name || 'Anonymous';
        const userId = user?.uid || 'anonymous';
        
        // Override any hardcoded author name with the current user
        if (!comment.author || comment.author === 'Jane Doe') {
          comment.author = userName;
        }
        
        // Ensure comment has proper structure
        const updatedComment = {
          ...comment,
          author: comment.author || userName,
          authorId: comment.authorId || userId,
          reactions: comment.reactions || { agreed: 0, disagreed: 0 },
          replies: comment.replies || [],
          updatedAt: serverTimestamp()
        };
        
        // If this is a new comment, add createdAt
        if (!comment.createdAt) {
          updatedComment.createdAt = serverTimestamp();
        }
        
        // If comment has an ID, update it; otherwise, create new
        if (comment.id) {
          const commentRef = doc(db, this.commentsCollection, comment.id);
          await setDoc(commentRef, updatedComment, { merge: true });
        } else {
          // Generate a new ID
          const commentsRef = collection(db, this.commentsCollection);
          const newCommentRef = await addDoc(commentsRef, updatedComment);
          updatedComment.id = newCommentRef.id;
        }
        
        return updatedComment;
      } catch (error) {
        console.error('Error saving comment:', error);
        return null;
      }
    }
  
    // Delete a comment
    async deleteComment(commentId) {
      try {
        const commentRef = doc(db, this.commentsCollection, commentId);
        await deleteDoc(commentRef);
        return true;
      } catch (error) {
        console.error('Error deleting comment:', error);
        return false;
      }
    }
  
    // Update comment content
    async updateCommentContent(commentId, newContent) {
      try {
        const commentRef = doc(db, this.commentsCollection, commentId);
        await updateDoc(commentRef, {
          text: newContent,
          updatedAt: serverTimestamp()
        });
        
        return await this.getComment(commentId);
      } catch (error) {
        console.error('Error updating comment content:', error);
        return null;
      }
    }
  
    // Update comment type
    async updateCommentType(commentId, newType) {
      try {
        const commentRef = doc(db, this.commentsCollection, commentId);
        await updateDoc(commentRef, {
          type: newType,
          updatedAt: serverTimestamp()
        });
        
        return await this.getComment(commentId);
      } catch (error) {
        console.error('Error updating comment type:', error);
        return null;
      }
    }
  
    // Get user reactions for a comment
    async getUserReactions(userId, commentId) {
      // If userId is not provided, use current user
      if (!userId) {
        const user = this.getCurrentUser();
        userId = user?.uid || 'anonymous';
      }
      
      try {
        const reactionRef = doc(db, this.reactionsCollection, `${userId}_${commentId}`);
        const reactionDoc = await getDoc(reactionRef);
        
        if (reactionDoc.exists()) {
          return reactionDoc.data();
        }
        
        return { agreed: false, disagreed: false };
      } catch (error) {
        console.error('Error retrieving user reactions:', error);
        return { agreed: false, disagreed: false };
      }
    }
  
    // Update comment reactions
    async updateCommentReactions(commentId, reactions, userReacted, userId) {
      // If userId is not provided, use current user
      if (!userId) {
        const user = this.getCurrentUser();
        userId = user?.uid || 'anonymous';
      }
      
      try {
        // Update comment reactions
        const commentRef = doc(db, this.commentsCollection, commentId);
        await updateDoc(commentRef, {
          reactions: reactions,
          updatedAt: serverTimestamp()
        });
        
        // Update user reactions
        await this.saveUserReaction(userId, commentId, userReacted);
        
        return await this.getComment(commentId);
      } catch (error) {
        console.error('Error updating comment reactions:', error);
        return null;
      }
    }
  
    // Save user reaction
    async saveUserReaction(userId, commentId, reaction) {
      // If userId is not provided, use current user
      if (!userId) {
        const user = this.getCurrentUser();
        userId = user?.uid || 'anonymous';
      }
      
      try {
        const reactionRef = doc(db, this.reactionsCollection, `${userId}_${commentId}`);
        await setDoc(reactionRef, {
          ...reaction,
          userId,
          commentId,
          updatedAt: serverTimestamp()
        });
        
        return true;
      } catch (error) {
        console.error('Error saving user reaction:', error);
        return false;
      }
    }
  
    // Add a reply to a comment
    async addReply(commentId, reply) {
      try {
        // Get current user for the reply author if not provided
        if (!reply.author || reply.author === 'Jane Doe') {
          const user = this.getCurrentUser();
          reply.author = user?.name || 'Anonymous';
          reply.authorId = user?.uid || 'anonymous';
        }
        
        // Add timestamps
        const replyWithTimestamp = {
          ...reply,
          createdAt: serverTimestamp()
        };
        
        // Update the comment with the new reply
        const commentRef = doc(db, this.commentsCollection, commentId);
        await updateDoc(commentRef, {
          replies: arrayUnion(replyWithTimestamp),
          updatedAt: serverTimestamp()
        });
        
        return await this.getComment(commentId);
      } catch (error) {
        console.error('Error adding reply:', error);
        return null;
      }
    }
  
    // Get all replies for a comment
    async getReplies(commentId) {
      try {
        const comment = await this.getComment(commentId);
        
        if (!comment) return [];
        
        return comment.replies || [];
      } catch (error) {
        console.error('Error getting replies:', error);
        return [];
      }
    }
  
    // Delete a reply from a comment
    async deleteReply(commentId, replyId) {
      try {
        const comment = await this.getComment(commentId);
        
        if (!comment || !comment.replies) return null;
        
        const replyToRemove = comment.replies.find(reply => reply.id === replyId);
        
        if (!replyToRemove) return comment;
        
        const commentRef = doc(db, this.commentsCollection, commentId);
        await updateDoc(commentRef, {
          replies: arrayRemove(replyToRemove),
          updatedAt: serverTimestamp()
        });
        
        return await this.getComment(commentId);
      } catch (error) {
        console.error('Error deleting reply:', error);
        return null;
      }
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