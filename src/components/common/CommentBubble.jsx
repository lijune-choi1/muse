// Updated CommentBubble.jsx with reactions and reply feature
import React, { useState, useEffect } from 'react';
import './CommentBubble.css';

const CommentBubble = ({ 
  comment, 
  onContentChange, 
  onBlur, 
  onTypeChange, 
  onDelete,
  onClose,
  onReactionChange,
  onReplyAdd,
  userProfile // Prop for user information
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localComment, setLocalComment] = useState({
    ...comment,
    text: comment.content || comment.text || "",
    reactions: comment.reactions || { agreed: 0, disagreed: 0 },
    replies: comment.replies || []
  });
  
  // Add state for reactions and replies
  const [userReacted, setUserReacted] = useState({ 
    agreed: comment.userReacted?.agreed || false, 
    disagreed: comment.userReacted?.disagreed || false 
  });
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");

  // Category colors and labels
  const categoryInfo = {
    'technical': {
      color: '#ff4136',
      label: 'Technical'
    },
    'conceptual': {
      color: '#0074D9',
      label: 'Conceptual'
    },
    'details': {
      color: '#2ECC40',
      label: 'Details'
    }
  };

  // Get current category info or default to technical
  const currentCategory = categoryInfo[localComment.type?.toLowerCase()] || categoryInfo.technical;

  // Allow editing on single click
  const handleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Save changes
    onContentChange(localComment.id, localComment.text);
    onTypeChange(localComment.id, localComment.type);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Revert to original comment
    setLocalComment({
      ...comment,
      text: comment.content || comment.text || ""
    });
    setIsEditing(false);
  };

  // Cycle through comment types on right-click
  const handleTypeChange = (e) => {
    e.preventDefault();
    const types = ['technical', 'conceptual', 'details'];
    const currentIndex = types.indexOf(localComment.type?.toLowerCase() || 'technical');
    const nextIndex = (currentIndex + 1) % types.length;
    
    setLocalComment(prev => ({
      ...prev,
      type: types[nextIndex]
    }));
  };
  
  // Handle reaction clicks (agree/disagree)
  const handleReaction = (type) => {
    // Toggle the reaction
    const newReacted = { ...userReacted };
    
    if (type === 'agreed') {
      newReacted.agreed = !newReacted.agreed;
      // If user disagrees and now agrees, remove disagree
      if (newReacted.agreed && newReacted.disagreed) {
        newReacted.disagreed = false;
      }
    } else if (type === 'disagreed') {
      newReacted.disagreed = !newReacted.disagreed;
      // If user agrees and now disagrees, remove agree
      if (newReacted.disagreed && newReacted.agreed) {
        newReacted.agreed = false;
      }
    }
    
    setUserReacted(newReacted);
    
    // Update reaction counts
    const newReactions = { ...localComment.reactions };
    
    // Calculate the deltas based on previous state change
    if (type === 'agreed') {
      newReactions.agreed = newReactions.agreed + (newReacted.agreed ? 1 : -1);
      if (newReacted.agreed && userReacted.disagreed) {
        newReactions.disagreed--;
      }
    } else if (type === 'disagreed') {
      newReactions.disagreed = newReactions.disagreed + (newReacted.disagreed ? 1 : -1);
      if (newReacted.disagreed && userReacted.agreed) {
        newReactions.agreed--;
      }
    }
    
    // Ensure counts don't go below 0
    newReactions.agreed = Math.max(0, newReactions.agreed);
    newReactions.disagreed = Math.max(0, newReactions.disagreed);
    
    // Update local state
    setLocalComment(prev => ({
      ...prev,
      reactions: newReactions
    }));
    
    // Call the onReactionChange callback if provided
    if (onReactionChange) {
      onReactionChange(localComment.id, {
        reactions: newReactions,
        userReacted: newReacted
      });
    }
  };
  
  // Handle adding a reply
  const handleAddReply = () => {
    if (!replyText.trim()) return;
    
    const newReply = {
      id: `reply-${Date.now()}`,
      author: userProfile?.name || "Anonymous",
      avatar: userProfile?.avatar || "/default-avatar.png",
      content: replyText,
      timestamp: new Date().toISOString()
    };
    
    const updatedReplies = [...localComment.replies, newReply];
    
    setLocalComment(prev => ({
      ...prev,
      replies: updatedReplies
    }));
    
    // Clear input and show replies
    setReplyText("");
    setShowReplies(true);
    
    // Call the onReplyAdd callback if provided
    if (onReplyAdd) {
      onReplyAdd(localComment.id, newReply, updatedReplies);
    }
  };
  
  // Format timestamp for display
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000; // diff in seconds
    
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    
    return date.toLocaleDateString();
  };

  // Rendering logic
  let bubbleContent;
  let bubbleClass = "comment-bubble";

  // Determine user profile information
  const userName = userProfile?.name || "Anonymous";
  const userAvatar = userProfile?.avatar || "/default-avatar.png";
  
  // Check if comment has replies
  const hasReplies = localComment.replies && localComment.replies.length > 0;

  if (isEditing) {
    // Edit mode
    bubbleClass += " edit-mode";
    
    bubbleContent = (
      <>
        <div className="comment-bubble-header">
          <div className="user-section">
            <img 
              src={userAvatar} 
              alt={userName} 
              className="user-icon" 
            />
            <span>{userName}</span>
          </div>
          <div className="header-actions">
            <span className="header-title">Edit</span>
            <button 
              className="close-button"
              onClick={handleCancel}
            >
              ✕
            </button>
          </div>
        </div>
        <div className="comment-edit-container">
          <div 
            className="type-selector"
            onContextMenu={handleTypeChange}
            title="Right-click to cycle comment types"
          >
            <select 
              className="comment-type-select"
              value={localComment.type || "technical"}
              onChange={(e) => setLocalComment(prev => ({
                ...prev, 
                type: e.target.value.toLowerCase()
              }))}
              style={{ backgroundColor: currentCategory.color }}
            >
              <option value="technical">Technical</option>
              <option value="conceptual">Conceptual</option>
              <option value="details">Details</option>
            </select>
          </div>
          <textarea
            className="comment-textarea"
            value={localComment.text}
            onChange={(e) => setLocalComment(prev => ({
              ...prev, 
              text: e.target.value
            }))}
            autoFocus
            placeholder="Enter your comment..."
          />
          <div className="comment-edit-actions">
            <button 
              className="save-button"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </>
    );
  } else {
    // View mode
    bubbleClass += " expanded";
    
    bubbleContent = (
      <>
        {/* Show thread badge if comment has replies */}
        {hasReplies && (
          <div className="thread-badge">
            {localComment.replies.length}
          </div>
        )}
      
        <div 
          className="comment-bubble-header"
          onContextMenu={handleTypeChange}
        >
          <div className="user-section">
            <img 
              src={userAvatar} 
              alt={userName} 
              className="user-icon" 
            />
            <span>{userName}</span>
          </div>
          <div 
            className={`comment-type-pill ${localComment.type}`} 
            style={{backgroundColor: currentCategory.color}}
            title="Right-click to cycle comment types"
          >
            {currentCategory.label}
          </div>
          <div className="header-actions">
            <button 
              className="edit-button"
              onClick={handleClick}
              title="Edit comment"
            >
              ✏️
            </button>
            <button 
              className="delete-button"
              onClick={() => onDelete(localComment.id)}
              title="Delete comment"
            >
              🗑️
            </button>
            <button 
              className="close-button"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>
        
        <div 
          className="comment-content"
          onClick={handleClick}
        >
          {localComment.text || "No content provided"}
        </div>
        
        {/* Reaction buttons (Agree/Disagree) */}
        <div className="comment-reactions">
          <button 
            className={`reaction-button agreed ${userReacted.agreed ? 'active' : ''}`}
            onClick={() => handleReaction('agreed')}
          >
            ✓ Agree
            {localComment.reactions.agreed > 0 && (
              <span className="reaction-count-comment">{localComment.reactions.agreed}</span>
            )}
          </button>
          
          <button 
            className={`reaction-button disagreed ${userReacted.disagreed ? 'active' : ''}`}
            onClick={() => handleReaction('disagreed')}
          >
            ✕ Disagree
            {localComment.reactions.disagreed > 0 && (
              <span className="reaction-count-comment">{localComment.reactions.disagreed}</span>
            )}
          </button>
          
          <button 
            className="reaction-button reply"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? "Hide Replies" : "Reply"}
            {hasReplies && !showReplies && (
              <span className="reaction-count-comment">{localComment.replies.length}</span>
            )}
          </button>
        </div>
        
        {/* Replies section */}
        <div className={`comment-replies ${showReplies ? 'expanded' : ''}`}>
          {/* Existing replies */}
          {localComment.replies && localComment.replies.map(reply => (
            <div key={reply.id} className="reply-item">
              <div className="reply-header">
                <img 
                  src={reply.avatar} 
                  alt={reply.author} 
                  className="reply-avatar" 
                />
                <span className="reply-author">{reply.author}</span>
                <span className="reply-time">{formatTime(reply.timestamp)}</span>
              </div>
              <div className="reply-content">
                {reply.content}
              </div>
            </div>
          ))}
          
          {/* Reply input */}
          <div className="reply-input-container">
            <input
              type="text"
              className="reply-input"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Add a reply..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddReply()}
            />
            <button 
              className="reply-submit"
              onClick={handleAddReply}
            >
              Send
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div 
      className={bubbleClass} 
      onClick={(e) => e.stopPropagation()}
    >
      {bubbleContent}
    </div>
  );
};

export default CommentBubble;