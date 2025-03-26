// src/components/common/FloatingActionButton.jsx
import React from 'react';
import './FloatingActionButton.css';


const FloatingActionButton = ({
  isExpanded,
  toggleExpanded,
  commentTypes,
  handleAddComment
}) => {
  return (
    <div 
      className={`comment-fab ${isExpanded ? 'expanded' : ''}`}
      onClick={toggleExpanded}
    >
      <div className="fab-main">
        <span className="fab-icon">+</span>
      </div>
      
      {isExpanded && (
        <div className="fab-menu">
          <div 
            className="fab-item" 
            style={{ backgroundColor: commentTypes.TECHNICAL.color }}
            onClick={(e) => {
              e.stopPropagation();
              handleAddComment('TECHNICAL');
            }}
          >
            Technical
          </div>
          <div 
            className="fab-item" 
            style={{ backgroundColor: commentTypes.DETAILS.color }}
            onClick={(e) => {
              e.stopPropagation();
              handleAddComment('DETAILS');
            }}
          >
            Details
          </div>
          <div 
            className="fab-item" 
            style={{ backgroundColor: commentTypes.CONCEPTUAL.color }}
            onClick={(e) => {
              e.stopPropagation();
              handleAddComment('CONCEPTUAL');
            }}
          >
            Conceptual
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingActionButton;