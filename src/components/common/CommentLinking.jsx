// src/components/common/CommentLinking.jsx
import React, { useState, useEffect } from 'react';
import './CommentLinking.css';

const CommentLinking = ({ 
  comments, 
  sourceCommentId, 
  onLinkCreate, 
  onLinkRemove,
  onCancel,
  zoomLevel = 1,
  panOffset = { x: 0, y: 0 }
}) => {
  const [targetCommentId, setTargetCommentId] = useState(null);
  const sourceComment = comments.find(c => c.id === sourceCommentId);
  
  // Check if source has existing links
  const existingLinks = sourceComment?.links || [];
  
  // Effect to add document-level event listener for escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);
  
  // Handle hover on a potential target comment
  const handleMouseEnter = (commentId) => {
    if (commentId === sourceCommentId) return;
    setTargetCommentId(commentId);
  };
  
  const handleMouseLeave = () => {
    setTargetCommentId(null);
  };
  
  // Handle click on a target comment
  const handleClick = (commentId) => {
    if (commentId === sourceCommentId) return;
    
    // Check if link already exists
    if (existingLinks.includes(commentId)) {
      onLinkRemove(sourceCommentId, commentId);
    } else {
      onLinkCreate(sourceCommentId, commentId);
    }
  };
  
  // Get source comment position with zoom and pan applied
  const getSourcePosition = () => {
    if (!sourceComment) return { x: 0, y: 0 };
    
    return {
      x: panOffset.x + sourceComment.position.x * zoomLevel,
      y: panOffset.y + sourceComment.position.y * zoomLevel
    };
  };
  
  // Render preview link line when hovering over a potential target
  const renderPreviewLink = () => {
    if (!targetCommentId) return null;
    
    const targetComment = comments.find(c => c.id === targetCommentId);
    
    if (!targetComment) return null;
    
    // Get positions with zoom and pan applied
    const sourcePos = getSourcePosition();
    const targetPos = {
      x: panOffset.x + targetComment.position.x * zoomLevel,
      y: panOffset.y + targetComment.position.y * zoomLevel
    };
    
    // Determine line color based on comment types
    let strokeColor = "#9B59B6"; // Default purple for different types
    
    if (sourceComment.type === targetComment.type) {
      // Same type - use that type's color
      switch (sourceComment.type.toLowerCase()) {
        case 'technical': strokeColor = "#ff4136"; break;
        case 'conceptual': strokeColor = "#0074D9"; break;
        case 'details': strokeColor = "#2ECC40"; break;
        default: strokeColor = "#9B59B6";
      }
    }
    
    const isExistingLink = existingLinks.includes(targetCommentId);
    
    return (
      <svg 
        className="link-preview-svg"
      >
        <line
          x1={sourcePos.x}
          y1={sourcePos.y}
          x2={targetPos.x}
          y2={targetPos.y}
          stroke={strokeColor}
          strokeWidth={2}
          strokeDasharray={isExistingLink ? "none" : "4"}
          className={`link-preview ${isExistingLink ? "existing-link" : ""}`}
        />
      </svg>
    );
  };
  
  // Get source comment type label
  const getSourceTypeLabel = () => {
    if (!sourceComment || !sourceComment.type) return 'Comment';
    
    switch (sourceComment.type.toLowerCase()) {
      case 'technical': return 'Technical';
      case 'conceptual': return 'Conceptual';
      case 'details': return 'Details';
      default: return sourceComment.type;
    }
  };
  
  // Get instruction text based on hover state
  const getInstructionText = () => {
    if (!targetCommentId) {
      return "Click on another comment to create a link";
    }
    
    if (existingLinks.includes(targetCommentId)) {
      return "Click to remove this link";
    }
    
    return "Click to create link";
  };
  
  return (
    <div className="comment-linking-mode">
      {/* Instruction panel */}
      <div className="linking-instructions">
        <div className="linking-source-info">
          Linking from: <span style={{fontWeight: 'bold'}}>{getSourceTypeLabel()}</span> comment
        </div>
        <div className="linking-target-info">
          {getInstructionText()}
        </div>
        <button 
          className="linking-cancel-button"
          onClick={onCancel}
        >
          Cancel Linking
        </button>
      </div>
      
      {/* Preview link line */}
      {renderPreviewLink()}
      
      {/* Clickable overlay for each comment */}
      {comments.map(comment => (
        comment.id !== sourceCommentId && (
          <div
            key={`link-target-${comment.id}`}
            className={`linking-target-overlay ${existingLinks.includes(comment.id) ? 'existing-link' : ''}`}
            style={{
              left: `${panOffset.x + comment.position.x * zoomLevel}px`,
              top: `${panOffset.y + comment.position.y * zoomLevel}px`,
              transform: `translate(-50%, -50%) scale(${1/zoomLevel})`,
              width: `${30 * zoomLevel}px`,
              height: `${30 * zoomLevel}px`,
            }}
            onMouseEnter={() => handleMouseEnter(comment.id)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(comment.id)}
            title={existingLinks.includes(comment.id) ? "Remove link" : "Create link"}
          />
        )
      ))}
      
      {/* Highlight source comment */}
      {sourceComment && (
        <div
          className="linking-source-highlight"
          style={{
            left: `${panOffset.x + sourceComment.position.x * zoomLevel}px`,
            top: `${panOffset.y + sourceComment.position.y * zoomLevel}px`,
            transform: `translate(-50%, -50%) scale(${1/zoomLevel})`,
            width: `${30 * zoomLevel}px`,
            height: `${30 * zoomLevel}px`,
            backgroundColor: (() => {
              switch (sourceComment.type?.toLowerCase()) {
                case 'technical': return '#ff4136';
                case 'conceptual': return '#0074D9';
                case 'details': return '#2ECC40';
                default: return '#ff4136';
              }
            })()
          }}
        />
      )}
    </div>
  );
};

export default CommentLinking;