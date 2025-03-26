// src/components/common/CommentTag.jsx
import React from 'react';
import './CommentTag.css';

const CommentTag = ({ 
  comment, 
  isSelected, 
  onClick, 
  onDoubleClick, 
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onLinkClick 
}) => {
  return (
    <div
      id={comment.id}
      className={`comment-tag ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${comment.position.x}px`,
        top: `${comment.position.y}px`
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(comment.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(comment.id);
      }}
      onMouseDown={(e) => onMouseDown(e, comment.id)}
      onMouseEnter={() => onMouseEnter && onMouseEnter()}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
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