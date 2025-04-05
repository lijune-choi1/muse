// Updated CommentBubble.jsx
import React, { useState, useEffect } from 'react';
import './CommentBubble.css';

const CommentBubble = ({ 
  comment, 
  onContentChange, 
  onBlur, 
  onTypeChange, 
  onDelete,
  onClose,
  userProfile // New prop for user information
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localComment, setLocalComment] = useState({
    ...comment,
    text: comment.content || comment.text || ""
  });

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
    const currentIndex = types.indexOf(localComment.type.toLowerCase());
    const nextIndex = (currentIndex + 1) % types.length;
    
    setLocalComment(prev => ({
      ...prev,
      type: types[nextIndex]
    }));
  };

  // Rendering logic
  let bubbleContent;
  let bubbleClass = "comment-bubble";

  // Determine user profile information
  const userName = userProfile?.name || "Anonymous";
  const userAvatar = userProfile?.avatar || "/default-avatar.png";

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
        <div 
          className="comment-bubble-header"
          onClick={handleClick}
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
          onContextMenu={handleTypeChange}
        >
          {localComment.text || "No content provided"}
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