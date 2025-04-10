// src/components/common/EnhancedCritiqueCard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreativePostWhiteboard from '../whiteboard/CreativePostWhiteboard';
import critiqueService from '../../pages/CritiqueService'; // Corrected import path
import './CritiqueCard.css';

const EnhancedCritiqueCard = ({ 
  id = 144,
  community = "r/ijuneneedshelp", 
  date = "2 days ago",
  title = "POST NAME: I need help with my poster design.",
  description = "Hi, I am doing an assignment for Type II and I need help with my poster design. I think the composition is off but I am not too sure... Any advice?",
  editNumber = 2,
  status = "in-progress", // Options: "near-completion", "in-progress", "just-started"
  image = null, // The image URL to be displayed
  onEditClick
}) => {
  const navigate = useNavigate();
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [whiteboardStats, setWhiteboardStats] = useState(null);
  
  // Fetch whiteboard stats if available
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await critiqueService.getWhiteboardStats(id);
        setWhiteboardStats(stats);
      } catch (error) {
        console.error("Error fetching whiteboard stats:", error);
      }
    };
    
    fetchStats();
  }, [id]);

  const handleEnterClick = () => {
    if (showWhiteboard) {
      // Exit whiteboard mode
      setShowWhiteboard(false);
    } else {
      // Toggle to whiteboard mode
      setShowWhiteboard(true);
    }
  };

  // Navigate to the full critique room
  const goToCritiqueRoom = () => {
    navigate(`/critique/${id}`);
  };

  // Determine text for edit button based on editNumber
  const getEditText = () => {
    if (editNumber === 1) return "1st Edit";
    if (editNumber === 2) return "2nd Edit";
    if (editNumber === 3) return "3rd Edit";
    return `${editNumber}th Edit`;
  };
  
  // Get status display text
  const getStatusText = () => {
    switch(status) {
      case "near-completion": return "Near Completion";
      case "in-progress": return "In Progress";
      case "just-started": return "Just Started";
      default: return status;
    }
  };
  
  // Get status class for styling
  const getStatusClass = () => {
    return `status-tag status-${status}`;
  };

  // Create a critiqueData object from the props
  const critiqueData = {
    id,
    community,
    date,
    title,
    description,
    editNumber,
    status,
    image
  };

  return (
    <div className={`critique-card ${showWhiteboard ? 'whiteboard-active' : ''}`}>
      <div className="card-header">
        <div className="community-info">
          <span className="community-name">{community}</span>
          <span className="post-date">{date}</span>
        </div>
        <div className="header-actions">
          <button 
            className="view-critique-btn"
            onClick={goToCritiqueRoom}
          >
            View Details
          </button>
          <button 
            className={`enter-critique-btn ${showWhiteboard ? 'active' : ''}`}
            onClick={handleEnterClick}
          >
            {showWhiteboard ? 'Exit Critique' : 'Enter Critique'}
          </button>
        </div>
      </div>
      
      <div className="card-tags">
        <button 
          className="edit-btn"
          onClick={onEditClick}
        >
          {getEditText()}
        </button>
        
        <div className={getStatusClass()}>
          {getStatusText()}
        </div>
        
        {/* Show comment count badge if there are comments */}
        {whiteboardStats && whiteboardStats.total > 0 && (
          <div className="critique-comment-count">
            {whiteboardStats.technical + whiteboardStats.conceptual + whiteboardStats.details} comments
          </div>
        )}
      </div>
      
      <h3 className="card-title">{title}</h3>
      
      {showWhiteboard ? (
        <div className="card-whiteboard-container">
          <CreativePostWhiteboard critiqueData={critiqueData} />
        </div>
      ) : (
        <>
          <p className="card-description">{description}</p>
          
          {image ? (
            <div className="card-image-container">
              <img src={image} alt={title} className="card-image" />
            </div>
          ) : (
            <div className="card-image-placeholder"></div>
          )}
          
          <div className="card-footer">
            <div className="card-actions">
              <button className="action-btn like-btn">
                <span className="btn-text">Likes</span>
              </button>
              <button className="action-btn share-btn">
                <span className="btn-text">Share</span>
              </button>
            </div>
            
            {/* Show critique stats summary if available */}
            {whiteboardStats && whiteboardStats.total > 0 && (
              <div className="whiteboard-stats-summary">
                <div className="stat-item">
                  <span className="stat-label">Technical:</span>
                  <span className="stat-value">{whiteboardStats.technical}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Conceptual:</span>
                  <span className="stat-value">{whiteboardStats.conceptual}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Details:</span>
                  <span className="stat-value">{whiteboardStats.details}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EnhancedCritiqueCard;