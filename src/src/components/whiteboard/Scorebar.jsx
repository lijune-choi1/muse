// src/components/whiteboard/ScoreBar.jsx
import React from 'react';

const ScoreBar = ({ scores, totalPoints }) => {
  return (
    <div className="scorebar-container">
      <div className="score-item total-points">
        <span className="score-label">Total Points</span>
        <span className="score-value">{totalPoints}</span>
      </div>
      
      <div className="score-item">
        <span className="score-label">Technical</span>
        <span className="score-value">{scores.technical}</span>
      </div>
      
      <div className="score-item">
        <span className="score-label">Conceptual</span>
        <span className="score-value">{scores.conceptual}</span>
      </div>
      
      <div className="score-item">
        <span className="score-label">Details</span>
        <span className="score-value">{scores.details}</span>
      </div>
      
      {/* Goal indicator moved to Whiteboard.jsx */}
    </div>
  );
};

export default ScoreBar;