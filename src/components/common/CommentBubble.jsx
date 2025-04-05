// src/components/common/CommentBubble.jsx
import React from 'react';
import './CommentBubble.css';

const CommentBubble = ({ 
  comment, 
  isExpanded, 
  isEditing,
  onContentChange, 
  onBlur, 
  onTypeChange, 
  onDelete,
  onClose,
  setEditingComment
}) => {
  // Different states based on props
  let bubbleContent;
  let bubbleClass = "comment-bubble";
  
  // Handle either text or content property for backward compatibility
  const commentText = comment.content || comment.text || "";

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
  const currentCategory = categoryInfo[comment.type?.toLowerCase()] || categoryInfo.technical;

  if (isEditing) {
    // Edit mode - Image 2 (expanded with edit controls)
    bubbleClass += " edit-mode";
    
    bubbleContent = (
      <>
        <div className="comment-bubble-header">
          <div className="user-section">
            <div className="user-icon"></div>
            <span>User</span>
          </div>
          <div className="header-actions">
            <span className="header-title">Edit</span>
            <button 
              className="close-button"
              onClick={() => {
                onBlur(comment.id);
                if (onClose) onClose();
              }}
            >
              ✕
            </button>
          </div>
        </div>
        <div className="comment-edit-container">
          <div className="type-selector">
            <select 
              className="comment-type-select"
              value={comment.type || "technical"}
              onChange={(e) => onTypeChange(comment.id, e.target.value.toLowerCase())}
              style={{ backgroundColor: currentCategory.color }}
            >
              <option value="technical">Technical</option>
              <option value="conceptual">Conceptual</option>
              <option value="details">Details</option>
            </select>
          </div>
          <textarea
            className="comment-textarea"
            value={commentText}
            onChange={(e) => onContentChange(comment.id, e.target.value)}
            onBlur={() => onBlur(comment.id)}
            autoFocus
            placeholder="Enter your comment..."
          />
        </div>
      </>
    );
  } else if (isExpanded) {
    // Expanded view mode (click once state - Image 2)
    bubbleClass += " expanded";
    
    bubbleContent = (
      <>
        <div className="comment-bubble-header">
          <div className="user-section">
            <div className="user-icon"></div>
            <span>User</span>
          </div>
          <div className={`comment-type-pill ${comment.type}`} style={{backgroundColor: currentCategory.color}}>
            {currentCategory.label}
          </div>
          <div className="header-actions">
            <div className="type-dropdown-container">
              <select
                className="comment-type-dropdown"
                value={comment.type || "technical"}
                onChange={(e) => onTypeChange(comment.id, e.target.value.toLowerCase())}
              >
                <option value="technical">Technical</option>
                <option value="conceptual">Conceptual</option>
                <option value="details">Details</option>
              </select>
            </div>
            <button 
              className="edit-button"
              onClick={() => {
                // Switch to edit mode when edit button is clicked
                if (setEditingComment) {
                  setEditingComment(comment.id);
                }
              }}
              title="Edit comment"
            >
              ✏️
            </button>
            <button 
              className="delete-button"
              onClick={() => onDelete(comment.id)}
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
          onDoubleClick={() => {
            // Switch to edit mode when content is double-clicked
            if (setEditingComment) {
              setEditingComment(comment.id);
            }
          }}
        >
          {commentText || "No content provided"}
        </div>
      </>
    );
  } else {
    // Hover state - Image 1 (simple info bubble)
    bubbleClass += " hover-state";
    
    bubbleContent = (
      <>
        <div className="user-section">
          <div className="user-icon"></div>
          <span>User</span>
        </div>
        <div className={`comment-type-pill ${comment.type}`} style={{backgroundColor: currentCategory.color}}>
          {currentCategory.label}
        </div>
        <div className="comment-text">
          {commentText || "Comment"}
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