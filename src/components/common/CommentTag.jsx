// Simplified CommentTag.jsx
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
  userProfile 
}) => {
  // Determine user information
  const userName = userProfile?.name || "Anonymous";
  const userInitial = userName.charAt(0).toUpperCase();
  
  // Get color for comment type
  const getColorForType = (type) => {
    switch(type?.toLowerCase()) {
      case 'technical': return '#ff4136';
      case 'conceptual': return '#0074D9';
      case 'details': return '#2ECC40';
      default: return '#ff4136'; // Default to technical red
    }
  };
  
  const commentColor = comment.color || getColorForType(comment.type);
  
  // Count links if they exist
  const linkCount = comment.links?.length || 0;
  
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
      onMouseEnter={() => onMouseEnter && onMouseEnter(comment.id)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
    >
      <div 
        className="comment-pin"
        style={{ backgroundColor: commentColor }}
      >
        <span className="user-initial">{userInitial}</span>
      </div>
      
      {/* Show link count badge if comment has links */}
      {linkCount > 0 && (
        <div className="link-counter">{linkCount}</div>
      )}
      
      {/* Only show link button when selected */}
      {isSelected && onLinkClick && (
        <button 
          className="comment-link-button" 
          onClick={(e) => {
            e.stopPropagation();
            onLinkClick(comment.id);
          }}
          title="Link to another comment"
        >
          🔗
        </button>
      )}
    </div>
  );
};

export default CommentTag;