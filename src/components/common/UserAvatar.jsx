// src/components/common/UserAvatar.jsx
import React, { useState } from 'react';
import UserProfileModal from './UserProfileModal';

const UserAvatar = ({ username, size = 'medium', onClick, showModal = true }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Extract initial from username
  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };
  
  // Determine size class
  const getSizeClass = () => {
    switch(size) {
      case 'small': return 'user-avatar-small';
      case 'large': return 'user-avatar-large';
      case 'medium':
      default: return 'user-avatar-medium';
    }
  };
  
  // Generate background color based on username
  const getBackgroundColor = (username) => {
    if (!username) return '#999';
    
    // Simple hash function to generate consistent colors for the same username
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to hex color
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).slice(-2);
    }
    
    return color;
  };
  
  const handleClick = (e) => {
    e.stopPropagation();
    
    if (showModal) {
      setIsModalOpen(true);
    }
    
    if (onClick) {
      onClick(username);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const backgroundColor = getBackgroundColor(username);
  const initial = getInitial(username);
  
  return (
    <>
      <div 
        className={`user-avatar ${getSizeClass()}`}
        style={{ 
          backgroundColor,
          color: '#fff',
          cursor: 'pointer'
        }}
        onClick={handleClick}
        title={username}
      >
        {initial}
      </div>
      
      {isModalOpen && showModal && (
        <UserProfileModal 
          username={username} 
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default UserAvatar;