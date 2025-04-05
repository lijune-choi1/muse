// src/components/common/CritiqueCard.jsx - with ReactionService
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import reactionService from './ReactService';
import './CritiqueCard.css';

const CritiqueCard = ({
  id,
  community,
  author,
  date,
  title,
  description,
  editNumber,
  status,
  image,
  onEditClick,
  isThread = false,
  initialLikes = 10,
  initialHearts = 5
}) => {
  // State for tracking reactions
  const [likes, setLikes] = useState(0);
  const [hearts, setHearts] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isHearted, setIsHearted] = useState(false);
  
  // Current user - in a real app would come from auth context
  const currentUser = 'lijune.choi20';
  
  useEffect(() => {
    // Initialize the post with default reaction counts if it doesn't exist yet
    reactionService.initializePost(id, initialLikes, initialHearts);
    
    // Get current reaction counts
    const { likes, hearts } = reactionService.getReactionCounts(id);
    setLikes(likes);
    setHearts(hearts);
    
    // Get user's reaction status
    const { hasLiked, hasHearted } = reactionService.getUserReactions(currentUser, id);
    setIsLiked(hasLiked);
    setIsHearted(hasHearted);
  }, [id, initialLikes, initialHearts, currentUser]);
  
  // Handle like button click
  const handleLikeClick = () => {
    const { hasLiked, likesCount } = reactionService.toggleLike(currentUser, id);
    setIsLiked(hasLiked);
    setLikes(likesCount);
  };
  
  // Handle heart button click
  const handleHeartClick = () => {
    const { hasHearted, heartsCount } = reactionService.toggleHeart(currentUser, id);
    setIsHearted(hasHearted);
    setHearts(heartsCount);
  };

  // Extract author from props or fallback to community name without the "r/" prefix
  const displayAuthor = author || (community ? community.replace(/^r\//, '') : 'unknown');

  // Status labels
  const getStatusLabel = (status) => {
    switch (status) {
      case 'just-started':
        return 'Just Started';
      case 'in-progress':
        return 'In Progress';
      case 'near-completion':
        return 'Near Completion';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  // Status background colors
  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'just-started':
        return '#2196F3';
      case 'in-progress':
        return '#FFC107';
      case 'near-completion':
        return '#4CAF50';
      case 'done':
        return '#9C27B0';
      default:
        return '#aaaaaa';
    }
  };

  // Function to get ordinal suffix for edit numbers
  const getEditLabel = (num) => {
    if (!num) return '1st Edit';
    if (num === 1) return '1st Edit';
    if (num === 2) return '2nd Edit';
    if (num === 3) return '3rd Edit';
    return `${num}th Edit`;
  };

  return (
    <div className="critique-card-container">
      {/* Card Header with user avatar, community name, and date */}
      <div className="critique-card-header">
        <div className="critique-card-user">
          <UserAvatar 
            username={displayAuthor}
            size="small"
          />
          <span className="critique-card-community">{community}</span>
        </div>
        <span className="critique-card-date">{date}</span>
        {isThread && <div className="critique-card-thread-badge">THREAD</div>}
      </div>

      {/* Status badges */}
      <div className="critique-card-badges">
        <div className="critique-card-status-badge" style={{ backgroundColor: getStatusBackgroundColor(status) }}>
          {getStatusLabel(status)}
        </div>
        <div className="critique-card-edit-badge">
          {getEditLabel(editNumber)}
        </div>
      </div>

      {/* Title and description */}
      <h3 className="critique-card-title">{title}</h3>
      <p className="critique-card-description">{description}</p>

      {/* Image */}
      <div className="critique-card-image-container">
        <img 
          src={image} 
          alt={title} 
          className="critique-card-image"
          onError={(e) => {
            e.target.src = `/api/placeholder/600/400`;
          }}
        />
      </div>

      {/* Action buttons */}
      <div className="critique-card-actions">
        <div className="critique-card-reactions">
          <button 
            className={`critique-card-reaction-btn ${isLiked ? 'active' : ''}`}
            onClick={handleLikeClick}
            aria-label={isLiked ? "Unlike" : "Like"}
            title={isLiked ? "Unlike" : "Like"}
          >
            {isLiked ? '✓ Liked' : 'Like'} <span className="critique-card-reaction-count">{likes}</span>
          </button>
          <button 
            className={`critique-card-reaction-btn ${isHearted ? 'active' : ''}`}
            onClick={handleHeartClick}
            aria-label={isHearted ? "Remove heart" : "Heart"}
            title={isHearted ? "Remove heart" : "Heart"}
          >
            {isHearted ? '❤️ Hearted' : 'Hearts'} <span className="critique-card-reaction-count">{hearts}</span>
          </button>
        </div>
        
        <Link 
          to={`/whiteboard/${id}`}
          className="critique-card-enter-btn"
          onClick={(e) => {
            if (onEditClick) {
              e.preventDefault();
              onEditClick(id);
              window.location.href = `/whiteboard/${id}`;
            }
          }}
        >
          Enter Critique
        </Link>
      </div>
    </div>
  );
};

export default CritiqueCard;