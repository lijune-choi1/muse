// src/components/whiteboard/CreativePostWhiteboard.jsx
import React, { useRef, useEffect, useState } from 'react';
import useWhiteboardState from './useWhiteboard.js';
import WhiteboardCanvas from './WhiteboardCanvas';
import ToolBar from './Toolbar';
import ScoreBar from './Scorebar';
import ZoomControls from './ZoomControls';
import CommentCategoryModal from '../common/CommentCategoryModal';
import critiqueService from '../../pages/CritiqueService'; // Corrected import path

const CreativePostWhiteboard = ({ critiqueData }) => {
  const canvasRef = useRef();
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    mode,
    setMode,
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    pan,
    panBy,
    stamps,
    addStamp,
    setStamps,
    comments,
    addComment,
    setComments,
    selectedStampId,
    selectStamp,
    selectedCommentId,
    setSelectedComment,
    editingCommentId,
    setEditingComment,
    expandedCommentId,
    setExpandedComment,
    hoveredCommentId,
    setHoveredComment,
    score,
    setScore
  } = useWhiteboardState();

  // Recalculate score when comments update
  useEffect(() => {
    const counts = { technical: 0, conceptual: 0, details: 0 };
    let total = 0;
    comments.forEach((c) => {
      if (c.type && ['technical', 'conceptual', 'details'].includes(c.type.toLowerCase())) {
        counts[c.type.toLowerCase()]++;
        total += c.points || 0;
      }
    });
    setScore({ ...counts, total });
  }, [comments, setScore]);

  // Load image from critiqueData
  useEffect(() => {
    if (critiqueData) {
      if (critiqueData.image) {
        setImageUrl(critiqueData.image);
      } else {
        // Create a placeholder image with post ID
        const placeholderId = critiqueData.id || 123;
        setImageUrl(`/api/placeholder/${600 + (placeholderId % 10)}/${400 + (placeholderId % 20)}`);
      }
    }
  }, [critiqueData]);

  // Load whiteboard data from service
  useEffect(() => {
    const loadWhiteboardData = async () => {
      if (!critiqueData?.id) return;
      
      setIsLoading(true);
      try {
        // Load whiteboard data from service
        const data = await critiqueService.getWhiteboardData(critiqueData.id);
        
        if (data.comments && data.comments.length > 0) {
          setComments(data.comments);
        }
        
        if (data.stamps && data.stamps.length > 0) {
          setStamps(data.stamps);
        }
      } catch (error) {
        console.error("Error loading whiteboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWhiteboardData();
  }, [critiqueData?.id, setComments, setStamps]);

  // Save whiteboard data when it changes
  useEffect(() => {
    const saveWhiteboardData = async () => {
      if (!critiqueData?.id || isLoading) return;
      
      // Skip the initial save when the component first loads
      if (comments.length === 0 && stamps.length === 0) return;
      
      try {
        const dataToSave = {
          comments,
          stamps
        };
        
        await critiqueService.saveWhiteboardData(critiqueData.id, dataToSave);
      } catch (error) {
        console.error("Error saving whiteboard data:", error);
      }
    };
    
    saveWhiteboardData();
  }, [comments, stamps, critiqueData?.id, isLoading]);

  const handleCanvasMouseDown = (e) => {
    if (e.button !== 0) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel - pan.x;
    const y = (e.clientY - rect.top) / zoomLevel - pan.y;

    if (mode === 'stamp') {
      const newStamp = {
        id: `stamp-${Date.now()}`,
        label: '⭐',
        x,
        y
      };
      addStamp(newStamp);
    } else if (mode !== 'comment') {
      // Only clear selections when clicking on empty canvas
      if (e.target === canvas || e.target.classList.contains('whiteboard-placeholder')) {
        setSelectedComment(null);
        setEditingComment(null);
        setExpandedComment(null);
        setHoveredComment(null);
        selectStamp(null);
      }
    }
  };

  // Calculate total comment count for the goal indicator
  const commentCount = comments.length;
  const goalTarget = 20; // Fixed target for this example

  return (
    <div className="whiteboard-container creative-post-whiteboard">
      {/* Header with critique info */}
      {critiqueData && (
        <div className="critique-whiteboard-header">
          <h3>{critiqueData.title || "Untitled Critique"}</h3>
          <div className="critique-whiteboard-meta">
            <span className="critique-status">{
              critiqueData.status === 'just-started' ? 'Just Started' : 
              critiqueData.status === 'in-progress' ? 'In Progress' : 
              critiqueData.status === 'near-completion' ? 'Near Completion' : 'Done'
            }</span>
            <span className="critique-edit">{
              critiqueData.editNumber === 1 ? '1st Edit' : 
              critiqueData.editNumber === 2 ? '2nd Edit' : 
              critiqueData.editNumber === 3 ? '3rd Edit' : 
              `${critiqueData.editNumber}th Edit`
            }</span>
          </div>
        </div>
      )}

      {/* Top score bar */}
      <ScoreBar
        scores={{
          technical: score.technical,
          conceptual: score.conceptual,
          details: score.details
        }}
        totalPoints={score.total}
      />

      {/* Goal indicator */}
      <div className="goal-container">
        <span className="goal-label">Goal</span>
        <span className="comment-count">{commentCount} comments</span>
      </div>

      {/* Main canvas */}
      <div className="canvas-wrapper" ref={canvasRef} onMouseDown={handleCanvasMouseDown}>
        <WhiteboardCanvas
          zoom={zoomLevel}
          pan={pan}
          stamps={stamps}
          comments={comments}
          selectedStampId={selectedStampId}
          selectedCommentId={selectedCommentId}
          editingCommentId={editingCommentId}
          expandedCommentId={expandedCommentId}
          hoveredCommentId={hoveredCommentId}
          mode={mode}
          onStampClick={selectStamp}
          onCommentSelect={setSelectedComment}
          onCommentEdit={setEditingComment}
          onCommentExpand={setExpandedComment}
          onCommentHover={setHoveredComment}
          onAddComment={addComment}
          setComments={setComments}
          postImage={imageUrl} // Use the image URL from the critique data
        />
      </div>

      {/* Bottom toolbar */}
      <ToolBar currentMode={mode} setMode={setMode} />

      {/* Zoom controls */}
      <div className="zoom-controls">
        <button className="zoom-button" onClick={zoomIn}>+</button>
        <div className="zoom-value">{Math.round(zoomLevel * 100)}%</div>
        <button className="zoom-button" onClick={zoomOut}>−</button>
        <button className="zoom-button" onClick={resetZoom}>↺</button>
      </div>

      {/* Add comment button */}
      <button onClick={() => setMode('comment')} className="fab-button">＋</button>
    </div>
  );
};

export default CreativePostWhiteboard;