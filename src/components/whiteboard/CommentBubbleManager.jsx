// src/components/common/CommentBubbleManager.jsx
import React, { useState, useRef, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import CommentBubble from '../common/CommentBubble';

/**
 * CommentBubbleManager handles displaying comment bubbles in different states
 * (hover, expanded, edit) and manages the interactions between them.
 * It now ensures comments are only those saved in Firebase.
 */
const CommentBubbleManager = ({
  designId, // Add designId prop to fetch comments for specific design
  comments,
  selectedCommentId,
  expandedCommentId,
  onCommentSelect,
  onCommentExpand,
  onContentChange,
  onTypeChange,
  onDelete,
  onReactionChange,
  onReplyAdd,
  zoom,
  localPan,
  userProfile,
  guestProfile,
  db // You can optionally pass the Firestore instance as a prop
}) => {
  // State for managing comment display
  const [hoveredCommentBubbleId, setHoveredCommentBubbleId] = useState(null);
  const [commentDisplayModes, setCommentDisplayModes] = useState({});
  const [firebaseComments, setFirebaseComments] = useState([]);
  const hoverTimerRef = useRef(null);

  // Subscribe to comments from Firebase
  useEffect(() => {
    if (!designId) return;

    // Get Firestore instance if not provided as prop
    const firestore = db || getFirestore();
    
    // Create a query against the comments collection
    const commentsRef = collection(firestore, 'comments');
    const commentsQuery = query(commentsRef, where('designId', '==', designId));

    // Set up real-time listener
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFirebaseComments(commentsData);
      console.log('Fetched Firebase comments:', commentsData);
    }, (error) => {
      console.error("Error fetching comments from Firebase:", error);
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [designId, db]);

  // Use Firebase comments for all operations
  const activeComments = firebaseComments.length > 0 ? firebaseComments : comments;

  // Handle comment tag hover
  const handleCommentTagEnter = (commentId) => {
    // Verify this comment exists in Firebase
    if (!activeComments.some(c => c.id === commentId)) {
      console.warn(`Comment ${commentId} not found in Firebase. Ignoring hover.`);
      return;
    }
    
    // Don't show hover bubble if comment is already expanded
    if (expandedCommentId === commentId) return;
    
    // Clear any pending hover timeout
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    
    setHoveredCommentBubbleId(commentId);
    
    // Update display mode for this comment
    setCommentDisplayModes(prev => ({
      ...prev,
      [commentId]: 'hover'
    }));
  };
  
  // Handle comment tag hover end
  const handleCommentTagLeave = (commentId) => {
    // Don't hide if we're hovering on the bubble itself
    hoverTimerRef.current = setTimeout(() => {
      const bubbleElement = document.querySelector(`[data-comment-id="${commentId}"]`);
      if (bubbleElement && bubbleElement.matches(':hover')) {
        return;
      }
      
      setHoveredCommentBubbleId(prev => prev === commentId ? null : prev);
    }, 50); // Small delay to check if mouse moved to bubble
  };
  
  // Handle bubble mouse enter
  const handleBubbleMouseEnter = (commentId) => {
    // Clear any pending hover timeout
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    
    // Keep the bubble visible
    setHoveredCommentBubbleId(commentId);
  };
  
  // Handle bubble mouse leave
  const handleBubbleMouseLeave = (commentId) => {
    // Only hide if we're not hovering the tag
    hoverTimerRef.current = setTimeout(() => {
      const tagElement = document.querySelector(`[data-tag-id="${commentId}"]`);
      if (tagElement && tagElement.matches(':hover')) {
        return;
      }
      
      setHoveredCommentBubbleId(prev => prev === commentId ? null : prev);
    }, 50);
  };

  // Handle comment selection (click)
  const handleCommentClick = (e, commentId) => {
    e.stopPropagation();
    
    // Verify this comment exists
    if (!activeComments.some(c => c.id === commentId)) {
      console.warn(`Comment ${commentId} not found. Ignoring click.`);
      return;
    }
    
    // Select the comment
    onCommentSelect(commentId);
    
    // If the comment is already in hover mode, expand it
    if (hoveredCommentBubbleId === commentId) {
      // Update display mode for this comment
      setCommentDisplayModes(prev => ({
        ...prev,
        [commentId]: 'expanded'
      }));
      
      // Notify parent component that this comment is expanded
      onCommentExpand(commentId);
    }
  };

  // Handle double click to edit comment
  const handleCommentDoubleClick = (e, commentId) => {
    e.stopPropagation();
    
    // Verify this comment exists
    if (!activeComments.some(c => c.id === commentId)) {
      console.warn(`Comment ${commentId} not found. Ignoring double-click.`);
      return;
    }
    
    // Select the comment
    onCommentSelect(commentId);
    
    // Set display mode to edit
    setCommentDisplayModes(prev => ({
      ...prev,
      [commentId]: 'edit'
    }));
    
    // Notify parent component that this comment is expanded
    onCommentExpand(commentId);
  };

  // Handle comment close
  const handleCloseBubble = () => {
    setHoveredCommentBubbleId(null);
    onCommentExpand(null);
  };

  // Render hovering bubbles (when hovering over tags)
  const renderHoverBubbles = () => {
    if (!hoveredCommentBubbleId || hoveredCommentBubbleId === expandedCommentId) return null;
    
    // Use Firebase comments to ensure we only show stored comments
    const comment = activeComments.find(c => c.id === hoveredCommentBubbleId);
    if (!comment) return null;
    
    // Position the bubble to the right of the comment
    const commentX = comment.position.x * zoom + localPan.x;
    const commentY = comment.position.y * zoom + localPan.y;
    const bubbleX = commentX + 30; // Offset to the right
    
    // Determine if comment is guest-created
    const isGuestComment = comment.guestCreated || false;
    
    return (
      <div 
        style={{
          position: 'absolute',
          left: `${bubbleX}px`,
          top: `${commentY}px`,
          transform: 'translate(0, -50%)',
          transformOrigin: 'left center',
          pointerEvents: 'auto',
          zIndex: 20
        }}
        data-comment-id={hoveredCommentBubbleId}
        onMouseEnter={() => handleBubbleMouseEnter(hoveredCommentBubbleId)}
        onMouseLeave={() => handleBubbleMouseLeave(hoveredCommentBubbleId)}
      >
        <CommentBubble
          comment={comment}
          displayMode="hover"
          onContentChange={onContentChange}
          onTypeChange={onTypeChange}
          onDelete={onDelete}
          onClose={handleCloseBubble}
          onReactionChange={onReactionChange}
          onReplyAdd={onReplyAdd}
          userProfile={isGuestComment ? guestProfile : userProfile}
        />
      </div>
    );
  };

  // Render expanded bubble (when comment is being edited or viewed in detail)
  const renderExpandedBubble = () => {
    if (!expandedCommentId) return null;
    
    // Use Firebase comments to ensure we only show stored comments
    const comment = activeComments.find(c => c.id === expandedCommentId);
    if (!comment) return null;
    
    // Position the bubble to the right of the comment
    const commentX = comment.position.x * zoom + localPan.x;
    const commentY = comment.position.y * zoom + localPan.y;
    const bubbleX = commentX + 60; // Larger offset to the right for expanded bubble
    
    // Get current display mode for this comment
    const displayMode = commentDisplayModes[expandedCommentId] || 'expanded';
    
    // Determine if comment is guest-created
    const isGuestComment = comment.guestCreated || false;
    
    return (
      <div 
        style={{
          position: 'absolute',
          left: `${bubbleX}px`,
          top: `${commentY}px`,
          transform: 'translate(0, -50%)',
          transformOrigin: 'left center',
          pointerEvents: 'auto',
          zIndex: 10
        }}
        data-comment-id={expandedCommentId}
      >
        <CommentBubble
          comment={comment}
          displayMode={displayMode}
          onContentChange={onContentChange}
          onTypeChange={onTypeChange}
          onDelete={onDelete}
          onClose={handleCloseBubble}
          onReactionChange={onReactionChange}
          onReplyAdd={onReplyAdd}
          userProfile={isGuestComment ? guestProfile : userProfile}
        />
      </div>
    );
  };

  // Public methods exposed to parent components
  return {
    handleCommentTagEnter,
    handleCommentTagLeave,
    handleCommentClick,
    handleCommentDoubleClick,
    renderHoverBubbles,
    renderExpandedBubble,
    firebaseComments // Expose the firebase comments to parent component
  };
};

export default CommentBubbleManager;