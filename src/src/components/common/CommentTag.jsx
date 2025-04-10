// src/components/common/CommentTag.jsx with inline SVG icons
import React from 'react';

// Simple SVG Icon component
const Icon = ({ type, size = 16, color = "currentColor" }) => {
  const icons = {
    link: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
    ),
    message: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
    thumbsUp: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
      </svg>
    ),
    thumbsDown: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm10-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
      </svg>
    )
  };

  return icons[type] || null;
};

const CommentTag = ({ 
  comment, 
  isSelected, 
  isBeingEdited, 
  onLinkClick,
  userProfile
}) => {
  // Category colors
  const colors = {
    'technical': '#ff4136',
    'conceptual': '#0074D9',
    'details': '#2ECC40'
  };

  // Get current color or default to technical
  const color = colors[comment.type?.toLowerCase()] || colors.technical;
  
  return (
    <div 
      className={`comment-tag ${isSelected ? 'selected' : ''} ${isBeingEdited ? 'editing' : ''}`}
      title={`${comment.text ? comment.text.substring(0, 50) + (comment.text.length > 50 ? '...' : '') : 'Empty comment'}`}
    >
      <div 
        className="comment-pin"
        style={{ 
          backgroundColor: color,
          boxShadow: isSelected ? `0 0 0 3px rgba(255, 255, 255, 0.8), 0 0 0 6px ${color}` : 'none',
          animation: isBeingEdited ? 'pulse-edit 1.5s infinite' : 'none'
        }}
      >
        {/* Show initials in the pin for guest-created comments */}
        {comment.guestCreated && (
          <span className="comment-pin-initials">
            {userProfile?.name?.charAt(0) || 'G'}
          </span>
        )}
      </div>
      
      {/* Link button */}
      <button 
        className="link-button"
        onClick={(e) => {
          e.stopPropagation();
          onLinkClick();
        }}
        title="Link to another comment"
      >
        <Icon type="link" size={10} />
      </button>
      
      {/* Show reply count if comment has replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="reply-count" title={`${comment.replies.length} replies`}>
          <Icon type="message" size={8} />
          <span className="count-text">{comment.replies.length}</span>
        </div>
      )}
      
      {/* Show reaction indicator if comment has reactions */}
      {comment.reactions && (comment.reactions.agreed > 0 || comment.reactions.disagreed > 0) && (
        <div className="reaction-indicator" style={{ 
          backgroundColor: comment.reactions.agreed > comment.reactions.disagreed ? 
            'rgba(46, 204, 64, 0.9)' : 'rgba(255, 65, 54, 0.9)' 
        }}>
          {comment.reactions.agreed > comment.reactions.disagreed ? 
            <Icon type="thumbsUp" size={8} /> : 
            <Icon type="thumbsDown" size={8} />
          }
        </div>
      )}
      
      <style jsx>{`
        .comment-tag {
          position: relative;
          cursor: grab;
          z-index: 5;
        }
        
        .comment-tag.selected {
          z-index: 6;
        }
        
        .comment-pin {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
          transition: transform 0.2s ease-out;
        }
        
        .comment-tag.selected .comment-pin {
          transform: scale(1.1);
        }
        
        .comment-pin-initials {
          color: white;
          font-size: 10px;
          font-weight: bold;
        }
        
        .link-button {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.9);
          border: 1px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s ease-out;
          pointer-events: auto;
        }
        
        .comment-tag:hover .link-button {
          opacity: 1;
        }
        
        .reply-count {
          position: absolute;
          bottom: -8px;
          right: -8px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #0074D9;
          color: white;
          font-size: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
        
        .count-text {
          font-size: 7px;
          margin-left: 2px;
        }
        
        .reaction-indicator {
          position: absolute;
          bottom: -8px;
          left: -8px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          color: white;
          font-size: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
        
        @keyframes pulse-edit {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CommentTag;