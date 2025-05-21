// src/components/common/CritiqueCard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CritiqueCard.css';

const CritiqueCard = (props) => {
  const {
    id,
    community,
    date,
    title,
    description,
    editNumber,
    status,
    image,
    author
  } = props;
  
  const navigate = useNavigate();
  
  // Check if current user is the author of the post
  const currentUserName = localStorage.getItem('currentUserName') || window.currentUserName;
  const isAuthor = currentUserName && currentUserName === author;

  // Determine status label and color
  const getStatusInfo = () => {
    switch (status) {
      case 'just-started':
        return { label: 'Just Started', color: '#e64a19' };
      case 'in-progress':
        return { label: 'In Progress', color: '#ffa000' };
      case 'completed':
        return { label: 'Completed', color: '#388e3c' };
      default:
        return { label: 'Open', color: '#0288d1' };
    }
  };

  const statusInfo = getStatusInfo();
  
  // Handle enter whiteboard button click
  const handleEnterWhiteboard = () => {
    navigate(`/whiteboard/${id}`);
  };

  return (
    <div className="critique-card">
      <div className="card-image-container">
        {/* Make the image clickable to go to the whiteboard */}
        <div className="image-link" onClick={handleEnterWhiteboard}>
          <img src={image} alt={title} className="card-image" />
        </div>
        
        <div className="status-badge" style={{ backgroundColor: statusInfo.color }}>
          {statusInfo.label}
        </div>
        {editNumber > 0 && (
          <div className="edit-badge">
            Edit #{editNumber}
          </div>
        )}
        
        {/* Add the Edit Post button at the top for authors */}
        {isAuthor && (
          <div className="edit-post-btn-top">
            <Link to={`/edit-post/${id}`} className="edit-own-btn-top">
              Edit Post
            </Link>
          </div>
        )}
      </div>
      
      <div className="card-content">
        <div className="card-meta">
          <Link to={`/community/${community?.replace('r/', '')}`} className="community-link">
            {community || 'General'}
          </Link>
          <span className="dot-separator">•</span>
          <span className="post-date">{date}</span>
          {author && (
            <>
              <span className="dot-separator">•</span>
              <span className="post-author">by {author}</span>
            </>
          )}
        </div>
        
        {/* Link title to whiteboard instead of post page */}
        <h3 className="card-title">
          <a href="#" onClick={(e) => {
            e.preventDefault();
            navigate(`/whiteboard/${id}`);
          }}>
            {title}
          </a>
        </h3>
        
        <p className="card-description">{description}</p>
        
        <div className="card-actions">
          {/* Always show Enter Whiteboard button */}
          <button 
            className="enter-whiteboard-btn"
            onClick={handleEnterWhiteboard}
          >
            Enter Whiteboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CritiqueCard;