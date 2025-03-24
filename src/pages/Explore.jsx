// src/pages/Explore.jsx
import React from 'react';
import './Explore.css';

const CritiqueCard = ({ onEnterClick }) => {
  return (
    <div className="critique-room-card">
      <div className="card-header">
        <div className="avatar-circle"></div>
        <div className="card-title">CRITIQUE NAME</div>
      </div>
      <div className="card-stats">
        <div className="stat-group">
          <div className="stat-value">20</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-group">
          <div className="stat-value">10</div>
          <div className="stat-label">Followers</div>
        </div>
      </div>
      <div className="card-description">
        This is a critique room.
      </div>
      <div className="card-actions">
        <button 
          className="enter-button"
          onClick={onEnterClick}
        >
          Enter Critique
        </button>
      </div>
    </div>
  );
};

const Explore = () => {
  const handleEnterClick = () => {
    console.log('Enter critique clicked');
    // Navigation logic here
  };

  return (
    <div className="explore-container">
      <h1 className="explore-title">Explore</h1>
      
      <div className="explore-section">
        <h2 className="section-title">Top Trending Critique Rooms</h2>
        
        <div className="critiques-room-grid">
          {[...Array(8)].map((_, index) => (
            <CritiqueCard 
              key={index}
              onEnterClick={handleEnterClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;