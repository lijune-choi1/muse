// src/components/community/JoinButton.jsx
import React, { useState, useEffect } from 'react';
import critiqueService from '../../services/CritiqueService';

const JoinButton = ({ communityId, communityName, onJoinStatusChange }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hard-coded username for demo - in a real app, this would come from auth context
  const username = 'lijune.choi20';
  
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        setIsLoading(true);
        const following = await critiqueService.isUserFollowingCommunity(username, communityId);
        setIsFollowing(following);
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkFollowStatus();
  }, [communityId, username]);
  
  const handleToggleJoin = async () => {
    try {
      setIsLoading(true);
      
      if (isFollowing) {
        // Unfollow the community
        await critiqueService.unfollowCommunity(username, communityId);
        setIsFollowing(false);
      } else {
        // Follow the community
        await critiqueService.followCommunity(username, communityId);
        setIsFollowing(true);
      }
      
      // Notify parent component about the change
      if (onJoinStatusChange) {
        onJoinStatusChange(isFollowing ? 'unfollowed' : 'followed', communityId, communityName);
      }
    } catch (error) {
      console.error('Error toggling community join status:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button 
      className={`join-btn ${isFollowing ? 'following' : ''}`}
      onClick={handleToggleJoin}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : (isFollowing ? 'Leave' : 'Join')}
    </button>
  );
};

export default JoinButton;