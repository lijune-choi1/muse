// src/components/whiteboard/UserCursor.jsx
import React from 'react';
import './UserCursor.css';

const UserCursor = ({ 
  position, 
  user, 
  color = '#4285F4',
  isActive = true,
  isTyping = false
}) => {
  // Don't render if position is invalid
  if (!position || position.x === undefined || position.y === undefined) {
    return null;
  }

  // Set position styling
  const cursorStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    display: isActive ? 'block' : 'none'
  };

  // Get first and last initials for the avatar if no image provided
  const getInitials = (name) => {
    if (!name) return '?';
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="user-cursor" style={cursorStyle}>
      {/* Cursor pointer */}
      <div className="cursor-pointer" style={{ borderColor: color }}>
        {/* Typing indicator animation */}
        {isTyping && (
          <div className="typing-indicator">
            <span style={{ backgroundColor: color }}></span>
            <span style={{ backgroundColor: color }}></span>
            <span style={{ backgroundColor: color }}></span>
          </div>
        )}
      </div>
      
      {/* User info tag */}
      <div className="cursor-user-tag" style={{ backgroundColor: color }}>
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name || 'User'} 
            className="cursor-avatar" 
          />
        ) : (
          <div className="cursor-initials">
            {getInitials(user.name)}
          </div>
        )}
        <span className="cursor-name">{user.name || 'Anonymous'}</span>
      </div>
    </div>
  );
};

export default UserCursor;