// src/pages/Whiteboard.jsx
import React, { useState, useRef, useEffect } from 'react';
import './Whiteboard.css';
import CommentTag from '../components/common/CommentTag';
import CommentBubble from '../components/common/CommentBubble';
import WhiteboardSidebar from '../components/common/WhiteboardSidebar';
import ToolBar from '../components/common/Toolbar';
import StampSelector from '../components/common/StampSelector';
import FloatingActionButton from '../components/common/FloatingActionButton';

const COMMENT_TYPES = {
  TECHNICAL: { type: 'technical', color: '#FF5252', points: 5 },
  DETAILS: { type: 'details', color: '#4CAF50', points: 3 },
  CONCEPTUAL: { type: 'conceptual', color: '#2196F3', points: 7 }
};

const STAMP_ICONS = [
  '👍', '👎', '❓', '❗', '⭐', '🚀', '🔥', '⚠️', '✅'
];

const Whiteboard = () => {
  // Core state
  const [comments, setComments] = useState([]);
  const [links, setLinks] = useState([]);
  const [commentTypeStats, setCommentTypeStats] = useState({
    technical: 0,
    details: 0,
    conceptual: 0
  });
  const [totalPoints, setTotalPoints] = useState(0);
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCommentFAB, setShowCommentFAB] = useState(false);
  const [currentTool, setCurrentTool] = useState('select'); // 'select', 'stamp'
  const [showLinks, setShowLinks] = useState(true);
  
  // Selection and hover state
  const [selectedComment, setSelectedComment] = useState(null);
  const [hoveredComment, setHoveredComment] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [expandedComment, setExpandedComment] = useState(null);
  const [selectedStamp, setSelectedStamp] = useState(null);
  
  // Stamp state
  const [stamps, setStamps] = useState([]);
  const [selectedStampIcon, setSelectedStampIcon] = useState(STAMP_ICONS[0]);
  const [draggingStamp, setDraggingStamp] = useState(null);
  
  // Link state
  const [isLinking, setIsLinking] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [sourceLinkId, setSourceLinkId] = useState(null);
  const [showLinkTextInput, setShowLinkTextInput] = useState(false);
  
  // Refs
  const whiteboardRef = useRef(null);
  const dragRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const stampDragOffsetRef = useRef({ x: 0, y: 0 });
  const linkTextInputRef = useRef(null);

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

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected element when Delete or Backspace key is pressed
      if (
        (e.key === 'Delete' || e.key === 'Backspace') && 
        (selectedStamp || selectedComment)
      ) {
        e.preventDefault();
        handleDeleteElement();
      }
    };

    // Add event listener for keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedStamp, selectedComment]);

  const handleCanvasMouseDown = (e) => {
    // Prevent default to avoid text selection
    e.preventDefault();
    
    // Only process if it's a left mouse button click
    if (e.button !== 0) return;
    
    if (currentTool === 'stamp') {
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
      // If in select mode, check if we clicked on a stamp
      checkStampSelection(e);
    }
  };

  // Selection functions
  const checkStampSelection = (e) => {
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

  // Comment functions
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
      position.x = rect.width / 2;
      position.y = rect.height / 2;
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
    setEditingComment(newComment.id);
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
      // Toggle selection
      if (selectedComment === id) {
        setSelectedComment(null);
        setExpandedComment(null);
      } else {
        setSelectedComment(id);
        setExpandedComment(id);  // Auto-expand on selection
        setSelectedStamp(null);
      }
    }
  };
  
  // Handle switching to edit mode
  const handleEditComment = (id) => {
    setEditingComment(id);
    setSelectedComment(id);
    setExpandedComment(id);
  };

  const handleCommentDoubleClick = (id) => {
    if (currentTool === 'select') {
      // Double-click enables editing by making the pin editable
      setEditingComment(id);
      setSelectedComment(id);
      setExpandedComment(id);
    }
  };

  const handleCommentMouseEnter = (id) => {
    if (!selectedComment && !editingComment) {
      setHoveredComment(id);
    }
  };

  const handleCommentMouseLeave = () => {
    setHoveredComment(null);
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
        if (!comment.content || !comment.content.trim()) {
          setTimeout(() => deleteComment(id), 100);
          return comment;
        }
        return { ...comment, isEditing: false };
      }
      return comment;
    }));
    
    setEditingComment(null);
  };

  const handleCommentTypeChange = (id, type) => {
    const commentType = COMMENT_TYPES[type];
    if (commentType) {
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
    }
  };

  // Comment dragging functions
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
    const x = e.clientX - whiteboardRect.left;
    const y = e.clientY - whiteboardRect.top;
    
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

  // // Stamp dragging functions
  // const startDraggingStamp = (e, id) => {
  //   if (currentTool !== 'select') return;
    
  //   e.stopPropagation();
    
  //   const stamp = stamps.find(s => s.id === id);
  //   if (!stamp) return;
    
  //   setDraggingStamp(id);
  //   const rect = e.currentTarget.getBoundingClientRect();
  //   stampDragOffsetRef.current = {
  //     x: e.clientX - rect.left,
  //     y: e.clientY - rect.top
  //   };

  //   document.addEventListener('mousemove', handleStampMove);
  //   document.addEventListener('mouseup', stopDraggingStamp);
  // };

  // const handleStampMove = (e) => {
  //   if (!draggingStamp) return;
    
  //   const whiteboardRect = whiteboardRef.current.getBoundingClientRect();
  //   const x = e.clientX - whiteboardRect.left;
  //   const y = e.clientY - whiteboardRect.top;
    
  //   setStamps(stamps.map(stamp => 
  //     stamp.id === draggingStamp 
  //       ? { ...stamp, position: { x, y } } 
  //       : stamp
  //   ));
  // };

  // Stamp dragging functions
const startDraggingStamp = (e, id) => {
  if (currentTool !== 'select') return;
  console.log("if StarDrag Pass");
  e.stopPropagation();
  
  const stamp = stamps.find(s => s.id === id);
  if (!stamp) return;
  
  // Use similar approach as comment dragging
  const whiteboardRect = whiteboardRef.current.getBoundingClientRect();
  const mouseX = e.clientX - whiteboardRect.left;
  const mouseY = e.clientY - whiteboardRect.top;
  
  // Calculate the offset between mouse position and stamp position
  stampDragOffsetRef.current = {
    x: mouseX - stamp.position.x,
    y: mouseY - stamp.position.y
  };
  console.log("startDrag Pass")
  setDraggingStamp(id);
  document.addEventListener('mousemove', handleStampMove);
  document.addEventListener('mouseup', stopDraggingStamp);
};

const handleStampMove = (e) => {
  if (!draggingStamp) return;
  console.log("handleStampMove Pass");
  const whiteboardRect = whiteboardRef.current.getBoundingClientRect();
  const mouseX = e.clientX - whiteboardRect.left;
  const mouseY = e.clientY - whiteboardRect.top;
  
  // Calculate new position by subtracting the drag offset
  const newX = mouseX - stampDragOffsetRef.current.x;
  const newY = mouseY - stampDragOffsetRef.current.y;
  
  setStamps(stamps.map(stamp => 
    stamp.id === draggingStamp 
      ? { ...stamp, position: { x: newX, y: newY } } 
      : stamp
  ));
};

const stopDraggingStamp = () => {
  setDraggingStamp(null);
  document.removeEventListener('mousemove', handleStampMove);
  document.removeEventListener('mouseup', stopDraggingStamp);
};

  // Linking functions
  const toggleLinkingMode = () => {
    setIsLinking(!isLinking);
    if (!isLinking) {
      setSourceLinkId(null);
      setCurrentTool('select'); // Switch to select tool for linking
    }
  };

  const startLinkingFromComment = (id) => {
    setIsLinking(true);
    setSourceLinkId(id);
    setCurrentTool('select');
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

  // Action functions
  const toggleShowLinks = () => {
    setShowLinks(!showLinks);
  };

  const deleteComment = (id) => {
    setComments(comments.filter(comment => comment.id !== id));
    setLinks(links.filter(link => link.source !== id && link.target !== id));
    setSelectedComment(null);
    setEditingComment(null);
    setExpandedComment(null);
  };

  const deleteStamp = (id) => {
    setStamps(stamps.filter(stamp => stamp.id !== id));
    setSelectedStamp(null);
  };

  const deleteLink = (id) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const handleDeleteElement = () => {
    if (selectedStamp) {
      deleteStamp(selectedStamp);
    }
    
    if (selectedComment) {
      deleteComment(selectedComment);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleFAB = () => {
    setShowCommentFAB(!showCommentFAB);
  };

  const handleCloseComment = () => {
    setSelectedComment(null);
    setEditingComment(null);
    setExpandedComment(null);
  };

  // Render functions
  const renderLinks = () => {
    if (!showLinks) return null;
    
    return links.map(link => {
      const sourceComment = comments.find(c => c.id === link.source);
      const targetComment = comments.find(c => c.id === link.target);
      
      if (!sourceComment || !targetComment) return null;
      
      const sourcePos = {
        x: sourceComment.position.x,
        y: sourceComment.position.y
      };
      
      const targetPos = {
        x: targetComment.position.x,
        y: targetComment.position.y
      };
      
      // Calculate midpoint for link text and X button
      const midX = (sourcePos.x + targetPos.x) / 2;
      const midY = (sourcePos.y + targetPos.y) / 2;
      
      return (
        <g key={link.id} className="comment-link">
          {/* Link line */}
          <line
            x1={sourcePos.x}
            y1={sourcePos.y}
            x2={targetPos.x}
            y2={targetPos.y}
          />
          
          {/* Link text container - styled as a bubble similar to the mockup */}
          <foreignObject 
            x={midX - 50} 
            y={midY - 15}
            width="100" 
            height="30"
          >
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              className="link-text-container"
              style={{
                border: '2px solid black',
                borderRadius: '10px',
                padding: '5px 10px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <span 
                className="link-text"
                style={{
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {link.text || "link"}
              </span>
            </div>
          </foreignObject>
          
          {/* Delete button */}
          <foreignObject
            x={midX + 45}
            y={midY - 10}
            width="20"
            height="20"
          >
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              className="link-delete-btn"
              onClick={() => deleteLink(link.id)}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: '1px solid #999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                fontSize: '14px'
              }}
            >
              ×
            </div>
          </foreignObject>
        </g>
      );
    });
  };

  return (
    <div className="whiteboard-container">
      <h1 className="whiteboard-title">Critique Room</h1>
      
      {/* Fixed Score Display */}
      <div className="floating-score">
        <div className="score-content">
          <span className="score-title">Total Points:</span>
          <span className="score-value">{totalPoints}</span>
        </div>
      </div>
      
      <div className="whiteboard-main-content">
        {/* Whiteboard Canvas with Placeholder */}
        <div 
          className="whiteboard-canvas" 
          ref={whiteboardRef}
          onClick={(e) => {
            if (isLinking) {
              setIsLinking(false);
              setSourceLinkId(null);
            }
            // Clear selections when clicking on canvas
            setSelectedComment(null);
            setExpandedComment(null);
            setEditingComment(null);
            setHoveredComment(null);
            setSelectedStamp(null);
            
            // Don't create a comment if we're in a drawing tool mode
            if (currentTool !== 'select') {
              e.stopPropagation();
              return;
            }
          }}
          onMouseDown={handleCanvasMouseDown}
        >
          {/* Placeholder image in the center */}
          <div className="whiteboard-placeholder">
            <img src="/api/placeholder/600/400" alt="Whiteboard Placeholder" />
          </div>
          
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
                  setSelectedComment(null);
                }
              }}
              onMouseDown={(e) => startDraggingStamp(e, stamp.id)}
            >
              {stamp.icon}
              {selectedStamp === stamp.id && (
                <button 
                  className="stamp-delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteStamp(stamp.id);
                  }}
                  title="Delete stamp"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
          
          {/* Render comments as tags and bubbles */}
          {comments.map(comment => (
            <React.Fragment key={comment.id}>
              {/* Comment Tag (always visible) */}
              <CommentTag
                comment={comment}
                isSelected={selectedComment === comment.id}
                onClick={handleCommentClick}
                onDoubleClick={handleCommentDoubleClick}
                onMouseDown={startDragging}
                onMouseEnter={() => handleCommentMouseEnter(comment.id)}
                onMouseLeave={handleCommentMouseLeave}
                onLinkClick={(id) => startLinkingFromComment(id)}
              />
              
              {/* Comment Bubble (only visible when hovered, selected, or editing) */}
              {(hoveredComment === comment.id || selectedComment === comment.id) && (
                <CommentBubble
                  comment={comment}
                  isExpanded={expandedComment === comment.id}
                  isEditing={editingComment === comment.id}
                  onContentChange={handleCommentChange}
                  setEditingComment={handleEditComment} // Pass the function to set edit mode
                  onBlur={handleCommentBlur}
                  onTypeChange={handleCommentTypeChange}
                  onDelete={deleteComment}
                  onClose={handleCloseComment}
                />
              )}
            </React.Fragment>
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
        
        {/* Collapsible Sidebar */}
        <WhiteboardSidebar
          isCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          commentTypeStats={commentTypeStats}
          totalPoints={totalPoints}
          isLinking={isLinking}
          showLinks={showLinks}
          toggleLinkingMode={toggleLinkingMode}
          toggleShowLinks={toggleShowLinks}
          handleDeleteElement={handleDeleteElement}
          handleAddComment={handleAddComment}
          hasSelection={!!(selectedStamp || selectedComment)}
          commentTypes={COMMENT_TYPES}
        />
      </div>
      
      {/* Stamp selector (only visible when stamp tool is active) */}
      {currentTool === 'stamp' && (
        <StampSelector
          stampIcons={STAMP_ICONS}
          selectedStampIcon={selectedStampIcon}
          setSelectedStampIcon={setSelectedStampIcon}
        />
      )}
      
      {/* Bottom toolbar with tools */}
      <ToolBar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
      />
      
      {/* Floating Action Button for adding comments */}
      <FloatingActionButton
        isExpanded={showCommentFAB}
        toggleExpanded={toggleFAB}
        commentTypes={COMMENT_TYPES}
        handleAddComment={handleAddComment}
      />
    </div>
  );
};

export default Whiteboard;