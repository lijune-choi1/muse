// src/pages/Whiteboard.jsx
import React, { useState, useRef, useEffect } from 'react';
import './Whiteboard.css';

const COMMENT_TYPES = {
  TECHNICAL: { type: 'technical', color: '#FF5252', points: 5 },
  DETAILS: { type: 'details', color: '#4CAF50', points: 3 },
  CONCEPTUAL: { type: 'conceptual', color: '#2196F3', points: 7 }
};

const MARKER_COLORS = [
  '#FF5252', // Red
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FFC107', // Yellow
  '#9C27B0', // Purple
  '#FF9800', // Orange
  '#000000'  // Black
];

const STAMP_ICONS = [
  '👍', '👎', '❓', '❗', '⭐', '🚀', '🔥', '⚠️', '✅'
];

const Whiteboard = () => {
  const [comments, setComments] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLinking, setIsLinking] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [sourceLinkId, setSourceLinkId] = useState(null);
  const [showLinks, setShowLinks] = useState(true);
  const [commentTypeStats, setCommentTypeStats] = useState({
    technical: 0,
    details: 0,
    conceptual: 0
  });
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedComment, setSelectedComment] = useState(null);
  const [expandedComment, setExpandedComment] = useState(null);
  const [showCommentFAB, setShowCommentFAB] = useState(false);
  
  // New state for additional features
  const [currentTool, setCurrentTool] = useState('select'); // 'select', 'stamp', 'marker'
  const [markerColor, setMarkerColor] = useState(MARKER_COLORS[0]);
  const [markerWidth, setMarkerWidth] = useState(3);
  const [markerPaths, setMarkerPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [stamps, setStamps] = useState([]);
  const [selectedStampIcon, setSelectedStampIcon] = useState(STAMP_ICONS[0]);
  const [showStampSelector, setShowStampSelector] = useState(false);
  const [showLinkTextInput, setShowLinkTextInput] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedStamp, setSelectedStamp] = useState(null);

  const whiteboardRef = useRef(null);
  const canvasRef = useRef(null);
  const markerCanvasRef = useRef(null);
  const dragRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const linkTextInputRef = useRef(null);

  // Define the handleDeleteElement function
  const handleDeleteElement = () => {
    if (selectedPath) {
      setMarkerPaths(markerPaths.filter(path => path.id !== selectedPath));
      setSelectedPath(null);
    }
    
    if (selectedStamp) {
      setStamps(stamps.filter(stamp => stamp.id !== selectedStamp));
      setSelectedStamp(null);
    }
    
    if (selectedComment) {
      deleteComment(selectedComment);
    }
  };

  // Initialize canvas for marker and set dimensions
  useEffect(() => {
    const canvas = markerCanvasRef.current;
    const container = whiteboardRef.current;
    
    if (canvas && container) {
      // Set canvas dimensions to match the whiteboard
      const resizeCanvas = () => {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Reset context properties after resize
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Redraw all paths
        renderMarkerPaths();
      };
      
      // Initial sizing
      resizeCanvas();
      
      // Resize on window resize
      window.addEventListener('resize', resizeCanvas);
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [whiteboardRef.current]);

  // Update stats whenever comments change
  useEffect(() => {
    const stats = {
      technical: 0,
      details: 0,
      conceptual: 0
    };
    
    let points = 0;
    comments.forEach(comment => {
      if (comment.type && COMMENT_TYPES[comment.type.toUpperCase()]) {
        stats[comment.type]++;
        points += COMMENT_TYPES[comment.type.toUpperCase()].points;
      }
    });
    
    setCommentTypeStats(stats);
    setTotalPoints(points);
  }, [comments]);

  // Focus link text input when it becomes visible
  useEffect(() => {
    if (showLinkTextInput && linkTextInputRef.current) {
      linkTextInputRef.current.focus();
    }
  }, [showLinkTextInput]);

  const renderMarkerPaths = () => {
    const canvas = markerCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    markerPaths.forEach(path => {
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      
      // Draw the path
      if (path.points.length > 0) {
        ctx.moveTo(path.points[0].x, path.points[0].y);
        
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        
        ctx.stroke();
      }
      
      // If this path is selected, draw a highlight around it
      if (selectedPath === path.id) {
        // Draw points along the path to show it's selected
        ctx.fillStyle = '#000';
        path.points.forEach((point, index) => {
          // Only draw selection points every few points to avoid overcrowding
          if (index % 3 === 0) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
    });
  };

  const handleCanvasMouseDown = (e) => {
    // Prevent default to avoid text selection during drawing
    e.preventDefault();
    
    // Only process if it's a left mouse button click
    if (e.button !== 0) return;
    
    if (currentTool === 'marker') {
      const rect = markerCanvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newPath = {
        id: `path-${Date.now()}`,
        color: markerColor,
        width: markerWidth,
        points: [{ x, y }]
      };
      
      setCurrentPath(newPath);
      
      document.addEventListener('mousemove', handleMarkerMove);
      document.addEventListener('mouseup', stopMarkerDrawing);
    } else if (currentTool === 'stamp') {
      const rect = whiteboardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Create a new stamp at the clicked position
      const newStamp = {
        id: `stamp-${Date.now()}`,
        icon: selectedStampIcon,
        position: { x, y }
      };
      
      setStamps([...stamps, newStamp]);
    } else if (currentTool === 'select') {
      // If in select mode, check if we clicked on a path or stamp
      checkPathSelection(e);
      checkStampSelection(e);
      
      // Check if we clicked on any comment is handled in the comment's onClick
    }
  };

  const handleMarkerMove = (e) => {
    if (!currentPath) return;
    
    const rect = markerCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPath(prevPath => {
      if (!prevPath) return null;
      
      const newPoints = [...prevPath.points, { x, y }];
      return { ...prevPath, points: newPoints };
    });
    
    // Draw the current path
    const ctx = markerCanvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = currentPath.color;
    ctx.lineWidth = currentPath.width;
    
    const lastPoint = currentPath.points[currentPath.points.length - 1];
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopMarkerDrawing = () => {
    if (currentPath) {
      setMarkerPaths(prevPaths => [...prevPaths, currentPath]);
    }
    
    setCurrentPath(null);
    document.removeEventListener('mousemove', handleMarkerMove);
    document.removeEventListener('mouseup', stopMarkerDrawing);
  };

  // Check if a marker path was clicked
  const checkPathSelection = (e) => {
    // Clear current selections first
    setSelectedPath(null);
    
    const rect = markerCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check each path in reverse (to get the top-most one first)
    for (let i = markerPaths.length - 1; i >= 0; i--) {
      const path = markerPaths[i];
      
      // Check if the click is near any point in the path
      for (let j = 0; j < path.points.length; j++) {
        const point = path.points[j];
        const distance = Math.sqrt(
          Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
        );
        
        // If we're within the line width (plus a bit of tolerance), select it
        if (distance <= path.width + 5) {
          setSelectedPath(path.id);
          return;
        }
      }
    }
  };
  
  // Check if a stamp was clicked
  const checkStampSelection = (e) => {
    // Only check if we haven't selected a path
    if (selectedPath) return;
    
    setSelectedStamp(null);
    
    const rect = whiteboardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check each stamp in reverse (to get the top-most one first)
    for (let i = stamps.length - 1; i >= 0; i--) {
      const stamp = stamps[i];
      const distance = Math.sqrt(
        Math.pow(stamp.position.x - x, 2) + Math.pow(stamp.position.y - y, 2)
      );
      
      // If we're within the stamp icon (which is 40px), select it
      if (distance <= 20) {
        setSelectedStamp(stamp.id);
        return;
      }
    }
  };

  // Removed handleAddStamp function as we now directly create stamps on click

  const handleAddComment = (type) => {
    const commentType = COMMENT_TYPES[type];
    
    if (currentTool === 'stamp') {
      // If stamp tool is active, wait for user to click on the canvas
      setCurrentTool('stamp');
      return;
    }
    
    const position = { x: 100, y: 100 };
    if (whiteboardRef.current) {
      const rect = whiteboardRef.current.getBoundingClientRect();
      position.x = rect.width / 2 - 100;
      position.y = rect.height / 2 - 50;
    }
    
    const newComment = {
      id: `comment-${Date.now()}`,
      content: '',
      type: commentType.type,
      color: commentType.color,
      points: commentType.points,
      position: position,
      isEditing: true
    };
    
    setComments([...comments, newComment]);
    setSelectedComment(newComment.id);
    setShowCommentFAB(false);
  };

  const handleCommentClick = (id) => {
    if (isLinking) {
      if (sourceLinkId && sourceLinkId !== id) {
        // Show input for link text
        setSelectedComment(id);
        setShowLinkTextInput(true);
      } else {
        // Start linking from this comment
        setSourceLinkId(id);
      }
    } else if (currentTool === 'select') {
      // Toggle editing mode
      setComments(comments.map(comment => 
        comment.id === id ? { ...comment, isEditing: true } : comment
      ));
      setSelectedComment(id);
      setSelectedPath(null);
      setSelectedStamp(null);
    }
  };

  const submitLinkText = () => {
    if (sourceLinkId && selectedComment) {
      // Create a link between source and target
      const newLink = {
        id: `link-${Date.now()}`,
        source: sourceLinkId,
        target: selectedComment,
        text: linkText
      };
      
      setLinks([...links, newLink]);
      setIsLinking(false);
      setSourceLinkId(null);
      setLinkText('');
      setShowLinkTextInput(false);
    }
  };

  const handleCommentDoubleClick = (id) => {
    if (currentTool === 'select') {
      setExpandedComment(expandedComment === id ? null : id);
    }
  };

  const startDragging = (e, id) => {
    if (currentTool !== 'select') return;
    
    e.stopPropagation();
    
    const comment = comments.find(c => c.id === id);
    if (!comment) return;
    
    dragRef.current = id;
    const element = document.getElementById(id);
    const rect = element.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopDragging);
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current) return;
    
    const whiteboardRect = whiteboardRef.current.getBoundingClientRect();
    const x = e.clientX - whiteboardRect.left - dragOffsetRef.current.x;
    const y = e.clientY - whiteboardRect.top - dragOffsetRef.current.y;
    
    setComments(comments.map(comment => 
      comment.id === dragRef.current 
        ? { ...comment, position: { x, y } } 
        : comment
    ));
  };

  const stopDragging = () => {
    dragRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopDragging);
  };

  const handleCommentChange = (id, content) => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, content } : comment
    ));
  };

  const handleCommentBlur = (id) => {
    setComments(comments.map(comment => {
      if (comment.id === id) {
        // If the content is empty, delete the comment
        if (!comment.content.trim()) {
          setTimeout(() => deleteComment(id), 100);
          return comment;
        }
        return { ...comment, isEditing: false };
      }
      return comment;
    }));
    
    setSelectedComment(null);
  };

  const handleCommentTypeChange = (id, type) => {
    const commentType = COMMENT_TYPES[type];
    setComments(comments.map(comment => 
      comment.id === id 
        ? { 
            ...comment, 
            type: commentType.type, 
            color: commentType.color,
            points: commentType.points
          } 
        : comment
    ));
  };

  const toggleLinkingMode = () => {
    setIsLinking(!isLinking);
    if (!isLinking) {
      setSourceLinkId(null);
      setCurrentTool('select'); // Switch to select tool for linking
    }
  };

  const toggleShowLinks = () => {
    setShowLinks(!showLinks);
  };

  const deleteComment = (id) => {
    setComments(comments.filter(comment => comment.id !== id));
    setLinks(links.filter(link => link.source !== id && link.target !== id));
    setSelectedComment(null);
  };

  const deleteLink = (id) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const clearMarkerPaths = () => {
    setMarkerPaths([]);
  };

  const renderLinks = () => {
    if (!showLinks) return null;
    
    return links.map(link => {
      const sourceComment = comments.find(c => c.id === link.source);
      const targetComment = comments.find(c => c.id === link.target);
      
      if (!sourceComment || !targetComment) return null;
      
      const sourcePos = {
        x: sourceComment.position.x + 15,
        y: sourceComment.position.y + 15
      };
      
      const targetPos = {
        x: targetComment.position.x + 15,
        y: targetComment.position.y + 15
      };
      
      // Calculate midpoint for link text and X button
      const midX = (sourcePos.x + targetPos.x) / 2;
      const midY = (sourcePos.y + targetPos.y) / 2;
      
      return (
        <g key={link.id} className="comment-link">
          <line
            x1={sourcePos.x}
            y1={sourcePos.y}
            x2={targetPos.x}
            y2={targetPos.y}
            stroke="#666"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          {/* Link text background */}
          {link.text && (
            <rect
              x={midX - 50}
              y={midY - 12}
              width="100"
              height="24"
              fill="#fff"
              rx="4"
              ry="4"
              stroke="#666"
              strokeWidth="1"
            />
          )}
          
          {/* Link text */}
          {link.text && (
            <text
              x={midX}
              y={midY + 5}
              textAnchor="middle"
              fill="#333"
              fontSize="12"
              fontFamily="Arial"
            >
              {link.text}
            </text>
          )}
          
          {/* Delete button */}
          <circle
            cx={midX + 60}
            cy={midY}
            r="8"
            fill="#fff"
            stroke="#666"
            strokeWidth="1"
            className="link-delete"
            onClick={() => deleteLink(link.id)}
          />
          <text
            x={midX + 60}
            y={midY + 4}
            fontSize="12"
            textAnchor="middle"
            fill="#666"
          >
            ×
          </text>
        </g>
      );
    });
  };

  return (
    <div className="whiteboard-container">
      <h1 className="whiteboard-title">Interactive Whiteboard</h1>
      
      {/* Fixed Score Display */}
      <div className="floating-score">
        <div className="score-content">
          <span className="score-title">Total Points:</span>
          <span className="score-value">{totalPoints}</span>
        </div>
      </div>
      
      {/* Top toolbar with links and actions */}
      <div className="whiteboard-toolbar">
        <div className="stats-container">
          <div className="stats-box">
            <h3>Comment Stats</h3>
            <div className="stat-item">
              <span className="stat-label">Technical:</span>
              <span className="stat-value">{commentTypeStats.technical}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Details:</span>
              <span className="stat-value">{commentTypeStats.details}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Conceptual:</span>
              <span className="stat-value">{commentTypeStats.conceptual}</span>
            </div>
          </div>
        </div>
        
        <div className="whiteboard-actions">
          <button 
            className={`toggle-btn ${isLinking ? 'active' : ''}`}
            onClick={toggleLinkingMode}
          >
            {isLinking ? 'Cancel Linking' : 'Link Comments'}
          </button>
          <button 
            className={`toggle-btn ${showLinks ? 'active' : ''}`}
            onClick={toggleShowLinks}
          >
            {showLinks ? 'Hide Links' : 'Show Links'}
          </button>
          <button
            className="toggle-btn"
            onClick={clearMarkerPaths}
          >
            Clear Drawings
          </button>
        </div>
      </div>
      
      {/* Stats box has been moved to the top toolbar */}
      
      {/* Whiteboard Canvas */}
      <div 
        className="whiteboard-canvas" 
        ref={whiteboardRef}
        onClick={(e) => {
          if (isLinking) {
            setIsLinking(false);
            setSourceLinkId(null);
          }
          // Don't create a comment if we're in a drawing tool mode
          if (currentTool !== 'select') {
            e.stopPropagation();
            return;
          }
        }}
        onMouseDown={handleCanvasMouseDown}
      >
        {/* Drawing canvas for marker tool */}
        <canvas
          ref={markerCanvasRef}
          className="marker-canvas"
          width={whiteboardRef.current ? whiteboardRef.current.offsetWidth : 1000}
          height={whiteboardRef.current ? whiteboardRef.current.offsetHeight : 600}
        />
        
        {/* SVG layer for links */}
        <svg className="links-layer" width="100%" height="100%">
          {renderLinks()}
        </svg>
        
        {/* Render stamps */}
        {stamps.map(stamp => (
          <div
            key={stamp.id}
            className={`stamp-icon ${selectedStamp === stamp.id ? 'selected' : ''}`}
            style={{
              left: `${stamp.position.x}px`,
              top: `${stamp.position.y}px`
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (currentTool === 'select') {
                setSelectedStamp(stamp.id === selectedStamp ? null : stamp.id);
                setSelectedPath(null);
                setSelectedComment(null);
              }
            }}
          >
            {stamp.icon}
          </div>
        ))}
        {comments.map(comment => (
          <div
            key={comment.id}
            id={comment.id}
            className={`comment-bubble ${comment.id === expandedComment ? 'expanded' : ''} ${comment.id === selectedComment ? 'selected' : ''} ${comment.isStamp ? 'stamp' : ''}`}
            style={{
              backgroundColor: comment.color,
              left: `${comment.position.x}px`,
              top: `${comment.position.y}px`
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (currentTool === 'select') {
                if (isLinking) {
                  if (sourceLinkId && sourceLinkId !== comment.id) {
                    // Show input for link text
                    setSelectedComment(comment.id);
                    setShowLinkTextInput(true);
                  } else {
                    // Start linking from this comment
                    setSourceLinkId(comment.id);
                  }
                } else {
                  // Toggle selection if not editing
                  if (!comment.isEditing) {
                    setSelectedComment(comment.id === selectedComment ? null : comment.id);
                    setSelectedPath(null);
                    setSelectedStamp(null);
                  } else {
                    // If already in editing mode, keep it selected
                    setSelectedComment(comment.id);
                  }
                }
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleCommentDoubleClick(comment.id);
            }}
          >
            <div 
              className="comment-handle"
              onMouseDown={(e) => startDragging(e, comment.id)}
            >
              <span className="comment-type">{comment.type}</span>
              <span className="comment-points">+{comment.points}pts</span>
            </div>
            
            {comment.isEditing ? (
              <div className="comment-edit-container">
                <textarea
                  className="comment-textarea"
                  value={comment.content}
                  onChange={(e) => handleCommentChange(comment.id, e.target.value)}
                  onBlur={() => handleCommentBlur(comment.id)}
                  autoFocus
                  placeholder="Enter your comment..."
                />
                <div className="comment-edit-controls">
                  <select 
                    className="comment-type-select"
                    value={comment.type.toUpperCase()}
                    onChange={(e) => handleCommentTypeChange(comment.id, e.target.value)}
                  >
                    <option value="TECHNICAL">Technical</option>
                    <option value="DETAILS">Details</option>
                    <option value="CONCEPTUAL">Conceptual</option>
                  </select>
                  <button 
                    className="delete-comment-btn"
                    onClick={() => deleteComment(comment.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="comment-content">
                {comment.id === expandedComment ? (
                  comment.content
                ) : (
                  comment.content.length > 50 
                    ? `${comment.content.substring(0, 50)}...` 
                    : comment.content
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* Linking message */}
        {isLinking && sourceLinkId && (
          <div className="linking-message">
            Select another comment to link with the selected comment
          </div>
        )}
        
        {/* Link text input */}
        {showLinkTextInput && (
          <div className="link-text-input-container">
            <input
              ref={linkTextInputRef}
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Enter link text"
              className="link-text-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  submitLinkText();
                } else if (e.key === 'Escape') {
                  setShowLinkTextInput(false);
                  setIsLinking(false);
                  setSourceLinkId(null);
                }
              }}
            />
            <div className="link-text-buttons">
              <button onClick={submitLinkText}>Add</button>
              <button onClick={() => {
                setShowLinkTextInput(false);
                setIsLinking(false);
                setSourceLinkId(null);
              }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      
      {/* Stamp icon selector (only visible when stamp tool is active) */}
      {currentTool === 'stamp' && (
        <div className="stamp-selector">
          <span className="stamp-selector-label">Choose Stamp:</span>
          <div className="stamp-icons">
            {STAMP_ICONS.map(icon => (
              <div
                key={icon}
                className={`stamp-option ${icon === selectedStampIcon ? 'active' : ''}`}
                onClick={() => setSelectedStampIcon(icon)}
              >
                {icon}
              </div>
            ))}
          </div>
        </div>
      )}
      {currentTool === 'marker' && (
        <div className="color-picker">
          <span className="color-picker-label">Color:</span>
          {MARKER_COLORS.map(color => (
            <div
              key={color}
              className={`color-option ${color === markerColor ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setMarkerColor(color)}
            />
          ))}
          <div className="marker-width-container">
            <span className="width-label">Width: {markerWidth}</span>
            <input
              type="range"
              min="1"
              max="10"
              value={markerWidth}
              onChange={(e) => setMarkerWidth(parseInt(e.target.value))}
              className="marker-width-slider"
            />
          </div>
        </div>
      )}
      
      {/* Bottom toolbar with drawing tools */}
      <div className="bottom-toolbar">
        <div className="tool-buttons">
          <button 
            className={`tool-btn ${currentTool === 'select' ? 'active' : ''}`}
            onClick={() => setCurrentTool('select')}
          >
            <span className="tool-icon">☝️</span>
            <span>Select</span>
          </button>
          <button 
            className={`tool-btn ${currentTool === 'stamp' ? 'active' : ''}`}
            onClick={() => setCurrentTool('stamp')}
          >
            <span className="tool-icon">📌</span>
            <span>Stamp</span>
          </button>
          <button 
            className={`tool-btn ${currentTool === 'marker' ? 'active' : ''}`}
            onClick={() => setCurrentTool('marker')}
          >
            <span className="tool-icon">✏️</span>
            <span>Marker</span>
          </button>
          <button 
            className="tool-btn delete-btn"
            onClick={handleDeleteElement}
            disabled={!selectedPath && !selectedStamp && !selectedComment}
          >
            <span className="tool-icon">🗑️</span>
            <span>Delete</span>
          </button>
        </div>
      </div>
      
      {/* Floating Action Button for adding comments */}
      <div 
        className={`comment-fab ${showCommentFAB ? 'expanded' : ''}`}
        onClick={() => setShowCommentFAB(!showCommentFAB)}
      >
        <div className="fab-main">
          <span className="fab-icon">+</span>
        </div>
        
        {showCommentFAB && (
          <div className="fab-menu">
            <div 
              className="fab-item" 
              style={{ backgroundColor: COMMENT_TYPES.TECHNICAL.color }}
              onClick={(e) => {
                e.stopPropagation();
                handleAddComment('TECHNICAL');
              }}
            >
              Technical
            </div>
            <div 
              className="fab-item" 
              style={{ backgroundColor: COMMENT_TYPES.DETAILS.color }}
              onClick={(e) => {
                e.stopPropagation();
                handleAddComment('DETAILS');
              }}
            >
              Details
            </div>
            <div 
              className="fab-item" 
              style={{ backgroundColor: COMMENT_TYPES.CONCEPTUAL.color }}
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
    </div>
  );
};

export default Whiteboard;