// src/components/common/WhiteboardSidebar.jsx
import React from 'react';
import './WhiteboardSidebar.css';

const WhiteboardSidebar = ({ 
  isCollapsed, 
  toggleSidebar, 
  commentTypeStats = {technical: 0, conceptual: 0, details: 0}, 
  totalPoints = 0
}) => {
  return (
    <div className={`whiteboard-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-collapse-btn" onClick={toggleSidebar}>
        {isCollapsed ? '>' : '<'}
      </div>
      
      {!isCollapsed && (
        <>
          <div className="sidebar-header">
            <h2>r/lijuneedshelphelp</h2>
            <p>community board for lijune to get feedback for design lmao</p>
            <div className="community-info">
              <p>Created by Mar 13, 2024</p>
              <p>Public</p>
            </div>
            <div className="stats-simple">
              <div className="stat-column">
                <span className="stat-number">20</span>
                <span className="stat-label">Members</span>
              </div>
              <div className="stat-column">
                <span className="stat-number">10</span>
                <span className="stat-label">Online</span>
              </div>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3>Game Stats</h3>
            <div className="stats-box">
              <div className="stat-item">
                <span>Technical: {commentTypeStats.technical.toString().padStart(2, '0')} points</span>
              </div>
              <div className="stat-item">
                <span>Conceptual: {commentTypeStats.conceptual.toString().padStart(2, '0')} points</span>
              </div>
              <div className="stat-item">
                <span>Details: {commentTypeStats.details.toString().padStart(2, '0')} points</span>
              </div>
              <div className="total-points">
                <span>TOTAL POINTS</span>
              </div>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3>COMMUNITY GUIDELINES</h3>
            <div className="guidelines-box">
              <div className="guideline-item">Respect</div>
              <div className="guideline-item">Honesty</div>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3>RULES</h3>
            <div className="rules-list">
              <div className="rule-item">
                <span className="rule-number">1</span>
                <span className="rule-text">Be Respectful</span>
              </div>
              <div className="rule-item">
                <span className="rule-number">2</span>
                <span className="rule-text">Do Not Swear</span>
              </div>
              <div className="rule-item">
                <span className="rule-number">3</span>
                <span className="rule-text">Make Sure To Be Civil</span>
              </div>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3>Moderators</h3>
            <div className="moderators-list">
              <div className="moderator-item">
                <div className="moderator-circle"></div>
                <span className="moderator-name">User 1</span>
              </div>
              <div className="moderator-item">
                <div className="moderator-circle"></div>
                <span className="moderator-name">User 2</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WhiteboardSidebar;