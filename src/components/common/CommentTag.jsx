// Updated CommentTag.jsx
import React from 'react';
import './CommentTag.css';

const CommentTag = ({ 
  comment, 
  isSelected, 
  onClick, 
  onDoubleClick, 
  onMouseEnter,
  onMouseLeave,
  onLinkClick,
  userProfile // New prop for user information
}) => {
  // Determine user information
  const userName = userProfile?.name || "Anonymous";
  const userAvatar = userProfile?.avatar || "/default-avatar.png";
  
  return (
    <div
      id={comment.id}
      className={`comment-tag ${isSelected ? 'selected' : ''} ${comment.type}`}
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
    >
      <div 
        className="comment-pin"
        style={{ backgroundColor: comment.color || "#ffb6c1" }}
      >
        <div className="comment-pin-inner"></div>
      </div>
      
      {/* User avatar */}
      <div className="comment-tag-user-info">
        <img 
          src={userAvatar} 
          alt={userName} 
          className="comment-tag-user-avatar" 
        />
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