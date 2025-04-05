// WhiteboardCanvas.jsx
import React, { useRef, useState, useEffect, useMemo } from 'react';
import CommentTag from '../common/CommentTag';
import CommentBubble from '../common/CommentBubble';
import CommentDraggable from '../common/CommentDraggeable';
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
  
  // New state for custom line drawing
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [linePoints, setLinePoints] = useState([]);

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
        className="link-line" // Added link-line class for animation
      />
    );
  };

  // Handle comment click for linking or selection
  const handleCommentClick = (clickedCommentId) => {
    // If in linking mode
    if (linkingMode) {
      // If no source is selected, set this comment as the source
      if (!linkSourceId) {
        setLinkSourceId(clickedCommentId);
        return;
      }

      // Prevent linking to the same comment
      if (linkSourceId === clickedCommentId) {
        return;
      }

      // Create the link
      setComments(prevComments => {
        return prevComments.map(comment => {
          // Add link to the source comment
          if (comment.id === linkSourceId) {
            const updatedLinks = comment.links 
              ? [...new Set([...comment.links, clickedCommentId])] 
              : [clickedCommentId];
            
            return { 
              ...comment, 
              links: updatedLinks 
            };
          }
          return comment;
        });
      });

      // Reset linking mode
      setLinkingMode(false);
      setLinkSourceId(null);
    } else {
      // Normal comment selection if not in linking mode
      onCommentSelect(clickedCommentId);
    }
  };

  // Handle mouse down for line drawing
  const handleMouseDown = (e) => {
    if (!linkingMode) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    setIsDrawingLine(true);
    setLinePoints([{ x, y }]);
  };

  // Handle mouse move for line drawing
  const handleMouseMove = (e) => {
    if (!isDrawingLine || !linkingMode) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    setLinePoints(prev => [...prev, { x, y }]);
  };

  // Handle mouse up to finalize line drawing
  const handleMouseUp = (e) => {
    if (!isDrawingLine || !linkingMode) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    // Find nearest comment to the end point
    const nearestComment = comments.reduce((nearest, comment) => {
      const distance = Math.sqrt(
        Math.pow(comment.position.x - x, 2) + 
        Math.pow(comment.position.y - y, 2)
      );
      return distance < (nearest.distance || Infinity) 
        ? { comment, distance } 
        : nearest;
    }, {}).comment;

    // If we have a source comment and found a target comment
    if (linkSourceId && nearestComment) {
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === linkSourceId) {
            const updatedLinks = comment.links 
              ? [...new Set([...comment.links, nearestComment.id])] 
              : [nearestComment.id];
            
            return { 
              ...comment, 
              links: updatedLinks 
            };
          }
          return comment;
        })
      );
    }

    // Reset drawing state
    setIsDrawingLine(false);
    setLinePoints([]);
    setLinkingMode(false);
    setLinkSourceId(null);
  };

  // Render custom drawn lines
  const renderDrawnLine = () => {
    if (linePoints.length < 2) return null;

    const pathData = linePoints.reduce((path, point, index) => {
      return index === 0 
        ? `M ${point.x} ${point.y}` 
        : `${path} L ${point.x} ${point.y}`;
    }, '');

    return (
      <path
        d={pathData}
        stroke="#0066cc"
        strokeWidth={2 / zoom}
        fill="none"
        strokeDasharray="5,5"
      />
    );
  };

  // Handle double-click to add comment
  const handleDoubleClick = (e) => {
    // Only proceed if we're in comment mode or select mode
    if (mode !== 'comment' && mode !== 'select') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    // Create comment categories and colors
    const categoryInfo = {
      'technical': { color: '#ff4136', points: 5 },
      'conceptual': { color: '#0074D9', points: 7 },
      'details': { color: '#2ECC40', points: 3 }
    };

    // Default to technical if no preference
    const defaultCategory = 'technical';
    const { color, points } = categoryInfo[defaultCategory];

    // Create a new comment with the default category
    const newComment = {
      id: `comment-${Date.now()}`,
      content: '',
      type: defaultCategory,
      points: points,
      position: { x, y },
      color: color,
      links: []
    };

    if (onAddComment) {
      console.log('✅ Creating comment:', newComment);
      onAddComment(newComment);
      
      // Automatically put the new comment into edit mode
      if (onCommentEdit) onCommentEdit(newComment.id);
      if (onCommentSelect) onCommentSelect(newComment.id);
      if (onCommentExpand) onCommentExpand(newComment.id);
    }
  };

  // Memoized link drawing to improve performance
const linkLines = useMemo(() => {
    const lines = [];
    comments.forEach(sourceComment => {
      if (sourceComment.links && sourceComment.links.length > 0) {
        sourceComment.links.forEach(targetId => {
          const targetComment = comments.find(c => c.id === targetId);
          if (targetComment) {
            // Determine line color based on comment types
            const color = sourceComment.type === targetComment.type 
              ? sourceComment.color  // Same type: use source color
              : "#555555";  // Different type: neutral color
  
            lines.push(
              <g key={`link-${sourceComment.id}-${targetId}`}>
                {drawLine(
                  sourceComment.position, 
                  targetComment.position, 
                  color
                )}
              </g>
            );
          }
        });
      }
    });
    return lines;
  }, [comments, zoom]);

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
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
        
        {/* Render all link lines */}
        {linkLines}

        {/* Render custom drawn line */}
        {isDrawingLine && renderDrawnLine()}
      </svg>

      {/* Comments with Draggable */}
      {comments.map((comment) => (
        <React.Fragment key={comment.id}>
          {/* The comment tag wrapped in a draggable component */}
          <CommentDraggable
            key={`draggable-${comment.id}`}
            position={comment.position}
            onPositionChange={(newPosition) => {
              if (setComments) {
                setComments(prevComments => 
                  prevComments.map(c => 
                    c.id === comment.id 
                      ? { ...c, position: newPosition } 
                      : c
                  )
                );
              }
            }}
            zoomLevel={zoom}
            panOffset={pan}
            canvasRef={canvasRef}
            isDraggable={mode === 'select' || mode === 'comment'}
          >
            <CommentTag
              comment={comment}
              isSelected={selectedCommentId === comment.id}
              onClick={() => handleCommentClick(comment.id)}
              onDoubleClick={() => onCommentEdit(comment.id)}
              onMouseEnter={() => onCommentHover(comment.id)}
              onMouseLeave={() => onCommentHover(null)}
              onLinkClick={() => {
                setLinkingMode(true);
                setLinkSourceId(comment.id);
              }}
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
                userProfile={comment.user}
                onContentChange={(id, val) => {
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
                  if (editingCommentId) {
                    onCommentEdit(null);
                  }
                }}
                onTypeChange={(id, type) => {
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
                        comment.id === id 
                          ? { 
                              ...comment, 
                              type: type,
                              color: categoryColors[type] || '#ff4136',
                              points: basePoints[type] || 5
                            } 
                          : comment
                      );
                    });
                  }
                }}
                onDelete={(id) => {
                  if (setComments) {
                    // Remove links to this comment
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
                      
                      // Remove the comment itself
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
    </div>
  );
};

export default WhiteboardCanvas;