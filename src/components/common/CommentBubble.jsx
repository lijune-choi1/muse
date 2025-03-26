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
  setEditingComment  // Add this prop
}) => {
  // Different states based on props
  let bubbleContent;
  let bubbleClass = "comment-bubble";
  
  // Position calculation (adjusted to appear beside the tag)
  const positionStyle = {
    left: `${comment.position.x + 30}px`,
    top: `${comment.position.y - 20}px`
  };

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
              value={comment.type}
              onChange={(e) => onTypeChange(comment.id, e.target.value.toUpperCase())}
              style={{ backgroundColor: comment.color }}
            >
              <option value="technical">Technical</option>
              <option value="details">Details</option>
              <option value="conceptual">Conceptual</option>
            </select>
          </div>
          <textarea
            className="comment-textarea"
            value={comment.content || ""}
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
          <div className="comment-type-pill" style={{backgroundColor: comment.color}}>
            {comment.type}
          </div>
          <div className="header-actions">
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
          {comment.content || "Lorem Ipsum Lorem Ipsum"}
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
        <div className="comment-type-pill" style={{backgroundColor: comment.color}}>
          {comment.type}
        </div>
        <div className="comment-text">
          {comment.content || "Comment"}
        </div>
      </>
    );
  }

  return (
    <div 
      className={bubbleClass} 
      style={positionStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {bubbleContent}
    </div>
  );
};

export default CommentBubble;