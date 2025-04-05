// src/components/common/UserProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfileModal.css';

const UserProfileModal = ({ username, onClose }) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Current user - in a real app would come from auth context
  const currentUser = 'lijune.choi20';
  
  useEffect(() => {
    // Close modal when escape key is pressed
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      try {
        // Since we don't have a UserService yet, create mock data
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
        
        // Create mock user data based on username
        const mockUserData = {
          username,
          displayName: username.charAt(0).toUpperCase() + username.slice(1),
          bio: `Design enthusiast with a passion for ${username.includes('choi') ? 'typography' : 'UI/UX design'}.`,
          joinDate: 'March 2024',
          stats: {
            posts: Math.floor(Math.random() * 20) + 1,
            followers: Math.floor(Math.random() * 100) + 5,
            following: Math.floor(Math.random() * 50) + 5
          }
        };
        
        setUserData(mockUserData);
        
        // Check localStorage follow state
        setIsFollowing(localStorage.getItem(`following_${username}`) === 'true');
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [username]);
  
  const handleFollowToggle = async () => {
    try {
      // Toggle follow state
      const newFollowingState = !isFollowing;
      setIsFollowing(newFollowingState);
      
      // Store in localStorage for persistence
      localStorage.setItem(`following_${username}`, newFollowingState.toString());
      
      // If we were following, decrease follower count, otherwise increase
      if (userData) {
        setUserData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: prev.stats.followers + (newFollowingState ? 1 : -1)
          }
        }));
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };
  
  const handleViewProfile = () => {
    onClose();
    // Navigate to user profile
    navigate(`/user-profile/${username}`);
  };
  
  const handleClickOutside = (e) => {
    if (e.target.classList.contains('user-profile-modal-overlay')) {
      onClose();
    }
  };
  
  // Get background color based on username for avatar
  const getAvatarBackgroundColor = (username) => {
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

  return (
    <div className="user-profile-modal-overlay" onClick={handleClickOutside}>
      <div className="user-profile-modal-content">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        {loading ? (
          <div className="modal-loading">Loading user profile...</div>
        ) : (
          <>
            <div className="modal-header">
              <div className="user-avatar-large" style={{ 
                backgroundColor: getAvatarBackgroundColor(username)
              }}>
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <h3 className="modal-username">{userData?.displayName || userData?.username}</h3>
                <p className="user-joined">Joined {userData?.joinDate}</p>
              </div>
            </div>
            
            <div className="user-bio">
              {userData?.bio}
            </div>
            
            <div className="user-stats">
              <div className="stat">
                <span className="stat-value">{userData?.stats?.posts || 0}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{userData?.stats?.followers || 0}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-value">{userData?.stats?.following || 0}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
            
            {username !== currentUser && (
              <div className="modal-actions">
                <button 
                  className={`follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <button 
                  className="view-profile-btn"
                  onClick={handleViewProfile}
                >
                  View Full Profile
                </button>
              </div>
            )}
            
            {username === currentUser && (
              <div className="modal-actions">
                <button 
                  className="view-profile-btn"
                  onClick={handleViewProfile}
                  style={{ width: '100%' }}
                >
                  View Your Profile
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;