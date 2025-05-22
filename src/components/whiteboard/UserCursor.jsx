// src/components/whiteboard/UserCursor.jsx
import React from 'react';
import './UserCursor.css';

const UserCursor = ({ 
  position, 
  user, 
  color = '#4285F4',
  isActive = true,
  isTyping = false,
  isOverCanvas = true, // New prop to indicate if user is actively over canvas
  lastSeen = null // New prop for last activity time
}) => {
  // Don't render if position is invalid
  if (!position || position.x === undefined || position.y === undefined) {
    return null;
  }

  // Calculate if user is recently active (within last 30 seconds)
  const isRecentlyActive = lastSeen ? (Date.now() - lastSeen < 30000) : true;
  
  // Determine opacity based on activity state
  const getOpacity = () => {
    if (!isActive) return 0.3; // Very faded if inactive
    if (!isOverCanvas) return 0.6; // Slightly faded if not over canvas
    if (!isRecentlyActive) return 0.7; // Slightly faded if not recently active
    return 1; // Full opacity for active users
  };

  // Set position styling
  const cursorStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    display: isActive ? 'block' : 'none',
    opacity: getOpacity(),
    transition: 'opacity 0.3s ease'
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

  // Get status indicator
  const getStatusIndicator = () => {
    if (!isActive) return '⚫'; // Offline
    if (isTyping) return '✏️'; // Typing
    if (!isOverCanvas) return '👁️'; // Viewing but not over canvas
    if (!isRecentlyActive) return '💤'; // Idle
    return '🟢'; // Active
  };

  return (
    <div className="user-cursor" style={cursorStyle}>
      {/* Cursor pointer - only show if user is over canvas */}
      {isOverCanvas && (
        <div 
          className="cursor-pointer" 
          style={{ 
            borderColor: color,
            opacity: isRecentlyActive ? 1 : 0.5
          }}
        >
          {/* Typing indicator animation */}
          {isTyping && (
            <div className="typing-indicator">
              <span style={{ backgroundColor: color }}></span>
              <span style={{ backgroundColor: color }}></span>
              <span style={{ backgroundColor: color }}></span>
            </div>
          )}
        </div>
      )}
      
      {/* User info tag - always visible when user is active */}
      <div 
        className={`cursor-user-tag ${!isRecentlyActive ? 'idle' : ''}`}
        style={{ 
          backgroundColor: color,
          left: isOverCanvas ? '15px' : '0px', // Adjust position if no cursor pointer
          top: isOverCanvas ? '-5px' : '0px'
        }}
      >
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
        
        {/* Status indicator */}
        <span 
          className="cursor-status"
          style={{
            fontSize: '10px',
            marginLeft: '4px'
          }}
          title={
            !isActive ? 'Offline' :
            isTyping ? 'Typing' :
            !isOverCanvas ? 'Viewing' :
            !isRecentlyActive ? 'Idle' :
            'Active'
          }
        >
          {getStatusIndicator()}
        </span>
      </div>
      
      {/* Presence ring for idle users */}
      {isActive && !isRecentlyActive && (
        <div 
          className="presence-ring"
          style={{
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            border: `2px solid ${color}`,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            animation: 'pulse 2s infinite'
          }}
        />
      )}
    </div>
  );
};

export default UserCursor;