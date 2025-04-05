// 1. First, update CommentTag.jsx to prevent event interference
// src/components/common/CommentTag.jsx

import React from 'react';
import './CommentTag.css';

const CommentTag = ({ 
  comment, 
  isSelected, 
  onClick, 
  onDoubleClick, 
  onMouseEnter,
  onMouseLeave,
  onLinkClick 
}) => {
  // Note: We removed onMouseDown from the props to prevent it from interfering with dragging
  
  return (
    <div
      id={comment.id}
      className={`comment-tag ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(comment.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (onDoubleClick) onDoubleClick(comment.id);
      }}
      onMouseEnter={() => onMouseEnter && onMouseEnter()}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
      // Important: we do NOT add onMouseDown here to avoid conflicting with the draggable behavior
    >
      <div 
        className="comment-pin"
        style={{ backgroundColor: comment.color || "#ffb6c1" }}
      >
        <div className="comment-pin-inner"></div>
      </div>
      
      {/* Only show link button when selected */}
      {isSelected && onLinkClick && (
        <button 
          className="comment-link-button" 
          onClick={(e) => {
            e.stopPropagation();
            onLinkClick(comment.id);
          }}
          title="Create link from this comment"
        >
          🔗
        </button>
      )}
    </div>
  );
};

export default CommentTag;