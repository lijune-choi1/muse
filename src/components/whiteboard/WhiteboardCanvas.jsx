// WhiteboardCanvas.jsx
import React, { useRef, useState, useEffect } from 'react';
import CommentTag from '../common/CommentTag';
import CommentBubble from '../common/CommentBubble';
import CommentDraggable from '../common/CommentDraggeable';
import CommentCategoryModal from '../common/CommentCategoryModal';
import './WhiteboardCanvas.css';

const WhiteboardCanvas = ({
  zoom,
  pan,
  onAddComment,
  comments,
  selectedCommentId,
  editingCommentId,
  expandedCommentId,
  hoveredCommentId,
  mode,
  onCommentSelect,
  onCommentEdit,
  onCommentExpand,
  onCommentHover,
  setComments,
  imageUrl
}) => {
  const canvasRef = useRef();
  const [linkingMode, setLinkingMode] = useState(false);
  const [linkSourceId, setLinkSourceId] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [pendingCommentPosition, setPendingCommentPosition] = useState(null);

  // Debug logging effect - MOVED TO COMPONENT LEVEL
  useEffect(() => {
    console.log('Comments rendering:', comments);
    comments.forEach(comment => {
      console.log('Individual Comment:', {
        id: comment.id,
        position: comment.position,
        content: comment.content,
        type: comment.type
      });
    });
  }, [comments]);

  // Function to position elements relative to the canvas, accounting for zoom
  const getZoomedStyle = (position) => ({
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: `translate(-50%, -50%) scale(${1 / zoom})`,
    transformOrigin: 'center center',
    zIndex: 5,
    pointerEvents: 'auto'
  });

  const handleDoubleClick = (e) => {
    // Only proceed if we're in comment mode or select mode
    if (mode !== 'comment' && mode !== 'select') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    // Store the position and show the category selection modal
    setPendingCommentPosition({ x, y });
    setShowCategoryModal(true);
  };

  // Create a new comment after category selection
  const handleCategorySelected = (category) => {
    if (!pendingCommentPosition) return;
    
    const categoryColors = {
      'technical': '#ff4136',
      'conceptual': '#0074D9',
      'details': '#2ECC40'
    };
    
    const basePoints = {
      'technical': 5,
      'conceptual': 7,
      'details': 3
    };
    
    // Create a new comment with the selected category
    const newComment = {
      id: `comment-${Date.now()}`,
      content: '',
      type: category,
      points: basePoints[category] || 5,
      position: pendingCommentPosition,
      color: categoryColors[category] || '#ff4136',
      links: []
    };

    if (onAddComment) {
      console.log('✅ Creating comment with category:', category, newComment);
      onAddComment(newComment);
      
      if (onCommentEdit) onCommentEdit(newComment.id);
      if (onCommentSelect) onCommentSelect(newComment.id);
      if (onCommentExpand) onCommentExpand(newComment.id);
    }
    
    // Reset modal state
    setShowCategoryModal(false);
    setPendingCommentPosition(null);
  };

  // Cancel comment creation
  const handleCancelCategorySelection = () => {
    setShowCategoryModal(false);
    setPendingCommentPosition(null);
  };

  // Handler for updating comment positions
  const handleCommentPositionChange = (commentId, newPosition) => {
    console.log(`Dragging comment ${commentId} to:`, newPosition);
    
    if (setComments) {
      setComments(prevComments => {
        const updatedComments = prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, position: newPosition } 
            : comment
        );
        return updatedComments;
      });
    }
  };

  // Handler for updating comment type
  const handleCommentTypeChange = (commentId, newType) => {
    const categoryColors = {
      'technical': '#ff4136',
      'conceptual': '#0074D9',
      'details': '#2ECC40'
    };
    
    const basePoints = {
      'technical': 5,
      'conceptual': 7,
      'details': 3
    };
    
    if (setComments) {
      setComments(prevComments => {
        return prevComments.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                type: newType,
                color: categoryColors[newType] || '#ff4136',
                points: basePoints[newType] || 5
              } 
            : comment
        );
      });
    }
  };

  // Create a link between comments
  const handleCreateLink = (sourceId) => {
    setLinkingMode(true);
    setLinkSourceId(sourceId);
  };

  // Complete the link when a target is selected
  const handleLinkComplete = (targetId) => {
    if (!linkingMode || !linkSourceId || linkSourceId === targetId) {
      setLinkingMode(false);
      setLinkSourceId(null);
      return;
    }

    console.log(`Creating link from ${linkSourceId} to ${targetId}`);
    
    setComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id === linkSourceId) {
          // Add the target to the source's links if it doesn't already exist
          const links = [...(comment.links || [])];
          if (!links.includes(targetId)) {
            links.push(targetId);
          }
          return { ...comment, links };
        }
        return comment;
      });
    });

    // Reset linking mode
    setLinkingMode(false);
    setLinkSourceId(null);
  };

  // Handle comment selection based on the current mode
  const handleCommentSelect = (commentId) => {
    if (linkingMode) {
      handleLinkComplete(commentId);
    } else {
      if (onCommentSelect) {
        onCommentSelect(commentId);
      }
    }
  };

  // Draw a line between two points
  const drawLine = (start, end, color = "#555555", thickness = 2, dashed = false) => {
    // Calculate control points for a curved line
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    // Add a slight curve to the line
    const curveOffset = 30; 
    const controlPoint = {
      x: midX,
      y: midY - curveOffset
    };
    
    return (
      <path
        d={`M ${start.x} ${start.y} Q ${controlPoint.x} ${controlPoint.y} ${end.x} ${end.y}`}
        stroke={color}
        strokeWidth={thickness / zoom} // Scale stroke width with zoom
        fill="none"
        strokeDasharray={dashed ? "5,5" : ""}
        markerEnd="url(#arrowhead)"
      />
    );
  };

  return (
    <div
      ref={canvasRef}
      onDoubleClick={handleDoubleClick}
      className="whiteboard-canvas"
      style={{
        transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
        transformOrigin: 'center center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0
      }}
    >
      {/* Placeholder background */}
      <div className="whiteboard-placeholder">
        <img
          src={imageUrl || "/api/placeholder/600/400"}
          alt="Whiteboard Placeholder"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* SVG layer for drawing links */}
      <svg 
        width="100%" 
        height="100%" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          pointerEvents: 'none',
          zIndex: 4
        }}
      >
        {/* Define the arrowhead marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#555555" />
          </marker>
        </defs>
        
        {/* Draw all the links between comments */}
        {comments.map(comment => {
          if (!comment.links || comment.links.length === 0) return null;
          
          return comment.links.map(targetId => {
            const targetComment = comments.find(c => c.id === targetId);
            if (!targetComment) return null;
            
            return (
              <g key={`link-${comment.id}-${targetId}`}>
                {drawLine(comment.position, targetComment.position)}
              </g>
            );
          });
        })}
        
        {/* Draw the linking line when in linking mode */}
        {linkingMode && linkSourceId && (
          <g>
            {(() => {
              const sourceComment = comments.find(c => c.id === linkSourceId);
              if (!sourceComment) return null;
              
              // Get mouse position for temporary line
              const tempEnd = {
                x: (hoveredCommentId && comments.find(c => c.id === hoveredCommentId)) 
                  ? comments.find(c => c.id === hoveredCommentId).position.x 
                  : sourceComment.position.x + 100,
                y: (hoveredCommentId && comments.find(c => c.id === hoveredCommentId)) 
                  ? comments.find(c => c.id === hoveredCommentId).position.y 
                  : sourceComment.position.y
              };
              
              return drawLine(sourceComment.position, tempEnd, "#0066cc", 2, true);
            })()}
          </g>
        )}
      </svg>

      {/* Comments with Draggable */}
      {comments.map((comment) => (
        <React.Fragment key={comment.id}>
          {/* The comment tag wrapped in a draggable component */}
          <CommentDraggable
            key={`draggable-${comment.id}`}
            position={comment.position}
            onPositionChange={(newPosition) => handleCommentPositionChange(comment.id, newPosition)}
            zoomLevel={zoom}
            panOffset={pan}
            canvasRef={canvasRef}
            isDraggable={mode === 'select' || mode === 'comment'}
          >
            <CommentTag
              comment={comment}
              isSelected={selectedCommentId === comment.id}
              onClick={() => handleCommentSelect(comment.id)}
              onDoubleClick={() => onCommentEdit(comment.id)}
              onMouseEnter={() => onCommentHover(comment.id)}
              onMouseLeave={() => onCommentHover(null)}
              onLinkClick={() => handleCreateLink(comment.id)}
              isLinkSource={linkSourceId === comment.id}
              isLinkingMode={linkingMode}
            />
          </CommentDraggable>

          {/* Comment bubble positioned relative to its tag */}
          {(hoveredCommentId === comment.id || selectedCommentId === comment.id) && (
            <CommentDraggable
              key={`bubble-draggable-${comment.id}`}
              position={{ 
                x: comment.position.x, 
                y: comment.position.y + 50 // Position the bubble below the tag with proper spacing
              }}
              onPositionChange={() => {}} // Bubbles don't need to be independently repositioned
              zoomLevel={zoom}
              panOffset={pan}
              canvasRef={canvasRef}
              isDraggable={false} // Bubbles are not independently draggable
            >
              <CommentBubble
                comment={comment}
                isExpanded={expandedCommentId === comment.id}
                isEditing={editingCommentId === comment.id}
                onContentChange={(id, val) => {
                  // Handler for content change
                  if (setComments) {
                    setComments(prevComments => 
                      prevComments.map(c => 
                        c.id === id ? { ...c, content: val } : c
                      )
                    );
                  }
                }}
                setEditingComment={onCommentEdit}
                onBlur={() => {
                  // Handle blur event
                  if (editingCommentId) {
                    onCommentEdit(null);
                  }
                }}
                onTypeChange={(id, type) => handleCommentTypeChange(id, type)}
                onDelete={(id) => {
                  // Handler for delete
                  if (setComments) {
                    // First, remove any links to this comment
                    setComments(prevComments => {
                      const updatedComments = prevComments.map(c => {
                        if (c.links && c.links.includes(id)) {
                          return {
                            ...c,
                            links: c.links.filter(linkId => linkId !== id)
                          };
                        }
                        return c;
                      });
                      
                      // Then remove the comment itself
                      return updatedComments.filter(c => c.id !== id);
                    });
                    
                    // Clear selections
                    if (onCommentSelect) onCommentSelect(null);
                    if (onCommentEdit) onCommentEdit(null);
                    if (onCommentExpand) onCommentExpand(null);
                  }
                }}
                onClose={() => onCommentSelect(null)}
              />
            </CommentDraggable>
          )}
        </React.Fragment>
      ))}

      {/* Visual indicator for linking mode */}
      {linkingMode && (
        <div 
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: `translateX(-50%) scale(${1/zoom})`,
            background: 'rgba(0, 102, 204, 0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            zIndex: 100,
            pointerEvents: 'none'
          }}
        >
          Click on a comment to create a link
        </div>
      )}

      {/* Category selection modal */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          pointerEvents: 'auto'
        }}>
          <CommentCategoryModal 
            onSelect={handleCategorySelected}
            onCancel={handleCancelCategorySelection}
          />
        </div>
      )}
    </div>
  );
};

export default WhiteboardCanvas;