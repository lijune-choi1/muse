import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WhiteboardCanvas from '../components/whiteboard/WhiteboardCanvas';
import critiqueService from './CritiqueService';
import './Whiteboard.css';

const Whiteboard = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef();
  
  // State management
  const [post, setPost] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Whiteboard state
  const [mode, setMode] = useState('select');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Comment state
  const [comments, setComments] = useState([]);
  const [stamps, setStamps] = useState([]);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [expandedCommentId, setExpandedCommentId] = useState(null);
  const [hoveredCommentId, setHoveredCommentId] = useState(null);
  const [score, setScore] = useState({ technical: 0, conceptual: 0, details: 0, total: 0 });

  // Calculate points based on comment links
  const calculateLinkPoints = (comments) => {
    const counts = { technical: 0, conceptual: 0, details: 0 };
    let total = 0;

    comments.forEach((comment) => {
      if (!comment.type) return;

      const commentType = comment.type.toLowerCase();
      const basePoints = comment.points || 0;

      // Initialize link point multiplier
      let linkMultiplier = 1;

      // Check links and calculate multiplier
      if (comment.links && comment.links.length > 0) {
        const linkedComments = comment.links.map(
          linkId => comments.find(c => c.id === linkId)
        ).filter(Boolean); // Remove any undefined links

        const matchingColorLinks = linkedComments.filter(
          linkedComment => linkedComment.type.toLowerCase() === commentType
        );

        if (matchingColorLinks.length > 0) {
          // Same color links multiply points by 2
          linkMultiplier = 2;
        } else if (linkedComments.length > 0) {
          // Different color links multiply points by 3
          linkMultiplier = 3;
        }
      }

      // Calculate points with multiplier
      const calculatedPoints = basePoints * linkMultiplier;

      // Update counts and total
      counts[commentType]++;
      total += calculatedPoints;
    });

    return { ...counts, total };
  };

  // Load post and whiteboard data
  useEffect(() => {
    const loadData = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        
        // Load post details including image
        const postData = await critiqueService.getPostById(parseInt(postId));
        setPost(postData);
        
        // Set image URL (real or placeholder)
        if (postData?.image) {
          setImageUrl(postData.image);
        } else {
          setImageUrl(`/api/placeholder/${600 + (postData.id % 10)}/${400 + (postData.id % 20)}`);
        }
        
        // Load whiteboard data
        const whiteboardData = await critiqueService.getWhiteboardData(parseInt(postId));
        console.log('Loaded Whiteboard Data:', whiteboardData);
        
        if (whiteboardData.comments && whiteboardData.comments.length > 0) {
          setComments(whiteboardData.comments);
        }
        
        if (whiteboardData.stamps && whiteboardData.stamps.length > 0) {
          setStamps(whiteboardData.stamps);
        }
      } catch (error) {
        console.error("Error loading post or whiteboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [postId]);

  // Save whiteboard data when it changes
  useEffect(() => {
    const saveData = async () => {
      if (!postId || loading) return;
      if (comments.length === 0 && stamps.length === 0) return;
      
      try {
        await critiqueService.saveWhiteboardData(parseInt(postId), {
          comments,
          stamps
        });
        console.log('Saved whiteboard data for post:', postId);
      } catch (error) {
        console.error("Error saving whiteboard data:", error);
      }
    };
    
    saveData();
  }, [comments, stamps, postId, loading]);

  // Update score when comments change
  useEffect(() => {
    const newScore = calculateLinkPoints(comments);
    setScore(newScore);
  }, [comments]);
  
  // Debug: Log comments
  useEffect(() => {
    console.log('Current Comments:', comments);
  }, [comments]);

  // Add a new comment
  const handleAddComment = (newComment) => {
    console.log('Adding new comment:', newComment);
    setComments(prev => [...prev, newComment]);
    
    // Auto-select and expand the new comment
    setSelectedCommentId(newComment.id);
    setEditingCommentId(newComment.id);
    setExpandedCommentId(newComment.id);
  };

  // Add a new stamp
  const handleAddStamp = (newStamp) => {
    setStamps(prev => [...prev, newStamp]);
  };

  // Canvas mouse event handling
  const handleCanvasMouseDown = (e) => {
    if (e.button !== 0) return;
    
    // Clear selections when clicking empty canvas
    if (e.target === canvasRef.current || e.target.classList.contains('whiteboard-placeholder')) {
      setSelectedCommentId(null);
      setEditingCommentId(null);
      setExpandedCommentId(null);
      setHoveredCommentId(null);
    }
  };

  // Zoom controls
  const zoomIn = () => setZoomLevel(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  const resetZoom = () => setZoomLevel(1);
  
  // Pan controls
  const panBy = (dx, dy) => {
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  if (loading) {
    return (
      <div className="whiteboard-container">
        <div className="loading">Loading whiteboard...</div>
      </div>
    );
  }

  return (
    <div className="whiteboard-container">
      {/* Top score bar */}
      <div className="scorebar-container">
        <div className="score-item total-points">
          <span className="score-label">Total Points</span>
          <span className="score-value">{score.total}</span>
        </div>
        <div className="score-item">
          <span className="score-label">Technical</span>
          <span className="score-value">{score.technical}</span>
        </div>
        <div className="score-item">
          <span className="score-label">Conceptual</span>
          <span className="score-value">{score.conceptual}</span>
        </div>
        <div className="score-item">
          <span className="score-label">Details</span>
          <span className="score-value">{score.details}</span>
        </div>
      </div>

      {/* Goal indicator */}
      <div className="goal-container">
        <span className="goal-label">Goal</span>
        <span className="comment-count">{comments.length} comments</span>
      </div>

      {/* Main canvas */}
      <div 
        className="canvas-wrapper" 
        ref={canvasRef} 
        onMouseDown={handleCanvasMouseDown}
      >
        {/* This is the important part - use WhiteboardCanvas component */}
        <WhiteboardCanvas
          zoom={zoomLevel}
          pan={pan}
          onAddComment={handleAddComment}
          comments={comments}
          selectedCommentId={selectedCommentId}
          editingCommentId={editingCommentId}
          expandedCommentId={expandedCommentId}
          hoveredCommentId={hoveredCommentId}
          mode={mode}
          onCommentSelect={setSelectedCommentId}
          onCommentEdit={setEditingCommentId}
          onCommentExpand={setExpandedCommentId}
          onCommentHover={setHoveredCommentId}
          setComments={setComments}
          imageUrl={imageUrl}
        />
      </div>

      {/* Mode toolbar */}
      <div className="toolbar-container">
        <button 
          className={`toolbar-button ${mode === 'select' ? 'active' : ''}`}
          onClick={() => setMode('select')}
        >
          Select Mode
        </button>
        <button 
          className={`toolbar-button ${mode === 'comment' ? 'active' : ''}`}
          onClick={() => setMode('comment')}
        >
          Comment Mode
        </button>
        <button 
          className={`toolbar-button ${mode === 'stamp' ? 'active' : ''}`}
          onClick={() => setMode('stamp')}
        >
          Stamp Mode
        </button>
      </div>

      {/* Zoom controls */}
      <div className="zoom-controls">
        <button className="zoom-button" onClick={zoomIn}>+</button>
        <div className="zoom-value">{Math.round(zoomLevel * 100)}%</div>
        <button className="zoom-button" onClick={zoomOut}>−</button>
        <button className="zoom-button" onClick={resetZoom}>↺</button>
      </div>


      {/* Back button */}
      <button 
        className="fullscreen-button"
        onClick={() => navigate(-1)}
      >
        ↩
      </button>
    </div>
  );
};

export default Whiteboard;