// src/components/whiteboard/CommentCluster.jsx
import React, { useState } from 'react';

const CommentCluster = ({ 
  comments, 
  position, 
  zoom, 
  pan, 
  onSelect,
  onHover,
  onDragStart,
  isSelected,
  isHovered
}) => {
  const [isMouseOver, setIsMouseOver] = useState(false);
  
  if (!comments || comments.length === 0) return null;

  // Calculate aggregated types from all clustered comments
  const types = comments.map(c => c.type);
  const uniqueTypes = [...new Set(types)];
  
  // Determine primary color based on types
  let clusterColor = '#777777'; // Default gray
  
  if (uniqueTypes.length === 1) {
    // Single type cluster - use that type's color
    switch (uniqueTypes[0].toLowerCase()) {
      case 'technical':
        clusterColor = '#ff4136'; // Red
        break;
      case 'conceptual':
        clusterColor = '#0074D9'; // Blue
        break;
      case 'details':
        clusterColor = '#2ECC40'; // Green
        break;
      default:
        clusterColor = '#777777';
    }
  } else if (uniqueTypes.length > 1) {
    // Mixed type cluster - use purple
    clusterColor = '#9B59B6';
  }
  
  // Calculate size based on number of comments (min size 24px, grows with comment count)
  const baseSize = 24;
  const size = Math.min(baseSize + (comments.length * 4), 50); // Maximum size 50px
  
  // Handle click
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(comments.map(c => c.id));
  };
  
  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    e.stopPropagation();
    
    if (e.button !== 0) return; // Only left mouse button
    
    // Call the drag start handler with the cluster IDs and position
    if (onDragStart) {
      onDragStart(e, comments.map(c => c.id), position);
    }
  };
  
  // Handle mouse enter/leave for hover state
  const handleMouseEnter = () => {
    setIsMouseOver(true);
    if (onHover) {
      onHover(comments.map(c => c.id));
    }
  };
  
  const handleMouseLeave = () => {
    setIsMouseOver(false);
    if (onHover) {
      onHover(null);
    }
  };
  
  // Determine whether to show the hover preview
  const showPreview = isHovered || isMouseOver;
  
  return (
    <>
      <div
        className={`comment-cluster ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: clusterColor,
          position: 'absolute',
          left: `${position.x * zoom + pan.x}px`,
          top: `${position.y * zoom + pan.y}px`,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: `${Math.min(14 + Math.floor(comments.length / 3), 20)}px`,
          cursor: 'grab',
          boxShadow: isSelected ? 
            '0 0 0 4px rgba(255, 255, 255, 0.7), 0 0 0 6px ' + clusterColor : 
            '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 10,
          transition: 'all 0.2s ease-out',
        }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={`${comments.length} comments in this area`}
      >
        {comments.length}
      </div>
      
      {/* Preview on hover */}
      {showPreview && (
        <div 
          className="cluster-preview"
          style={{
            position: 'absolute',
            left: `${position.x * zoom + pan.x + size/2 + 10}px`,
            top: `${position.y * zoom + pan.y}px`,
            transform: 'translateY(-50%)',
            backgroundColor: 'white',
            borderRadius: '6px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            padding: '8px',
            width: '200px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 11,
            animation: 'fadeIn 0.2s ease-out',
            cursor: 'default',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>
            {comments.length} comments in this area
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {comments.slice(0, 3).map(comment => (
              <div 
                key={comment.id}
                style={{ 
                  padding: '5px', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  borderLeft: `3px solid ${
                    comment.type === 'technical' ? '#ff4136' : 
                    comment.type === 'conceptual' ? '#0074D9' : 
                    comment.type === 'details' ? '#2ECC40' : '#777777'
                  }`
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>
                  {comment.type}
                </div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {comment.text || 'No content'}
                </div>
              </div>
            ))}
            
            {comments.length > 3 && (
              <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
                + {comments.length - 3} more comments
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CommentCluster;