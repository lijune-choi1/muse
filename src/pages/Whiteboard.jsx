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
  
  // Collaboration testing states
  const [collaborationEnabled, setCollaborationEnabled] = useState(false);
  const [collaborationMode, setCollaborationMode] = useState('full');
  const [useCollaborativeComments, setUseCollaborativeComments] = useState(false);
  
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
      const basePoints = comment.points || 1;

      // Initialize link point multiplier
      let linkMultiplier = 1;

      // Check links and calculate multiplier
      if (comment.links && comment.links.length > 0) {
        const linkedComments = comment.links.map(
          linkId => comments.find(c => c.id === linkId)
        ).filter(Boolean); // Remove any undefined links

        const matchingColorLinks = linkedComments.filter(
          linkedComment => linkedComment.type?.toLowerCase() === commentType
        );

        if (matchingColorLinks.length > 0) {
          // Same color links multiply points by 2
          linkMultiplier = 2;
        } else if (linkedComments.length > 0) {
          // Different color links multiply points by 3
          linkMultiplier = 3;
        }
      }

      // Add bonus for comments with high agreement
      let agreementBonus = 0;
      if (comment.reactions && comment.reactions.agreed > 0) {
        // Each agreement adds 0.5 points
        agreementBonus = comment.reactions.agreed * 0.5;
      }

      // Calculate points with multiplier and bonus
      const calculatedPoints = (basePoints * linkMultiplier) + agreementBonus;

      // Update counts and total
      counts[commentType]++;
      total += calculatedPoints;
    });

    return { ...counts, total: Math.round(total) };
  };

  // Load initial data
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
          setImageUrl(`/api/placeholder/${600 + (postData?.id % 10 || 0)}/${400 + (postData?.id % 20 || 0)}`);
        }
        
        // Load whiteboard data
        const whiteboardData = await critiqueService.getWhiteboardData(parseInt(postId));
        
        // Initialize comments with some defaults
        let processedComments = [];
        if (whiteboardData.comments && whiteboardData.comments.length > 0) {
          processedComments = whiteboardData.comments.map(comment => ({
            ...comment,
            reactions: comment.reactions || { agreed: 0, disagreed: 0 },
            replies: comment.replies || [],
            links: comment.links || []
          }));
          setComments(processedComments);
        } else {
          // If no comments, add some sample comments
          setComments([
            {
              id: 'sample-comment-1',
              position: { x: 100, y: 100 },
              type: 'technical',
              text: 'Sample technical comment',
              reactions: { agreed: 0, disagreed: 0 },
              replies: [],
              links: []
            },
            {
              id: 'sample-comment-2',
              position: { x: 300, y: 200 },
              type: 'conceptual',
              text: 'Sample conceptual comment',
              reactions: { agreed: 0, disagreed: 0 },
              replies: [],
              links: []
            }
          ]);
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

  // Update score when comments change
  useEffect(() => {
    const newScore = calculateLinkPoints(comments);
    setScore(newScore);
  }, [comments]);

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

      {/* Collaboration control panel */}
      <div 
        style={{
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          zIndex: 100
        }}
      >
        <h4>Collaboration Controls</h4>
        <div>
          <label>
            <input 
              type="checkbox" 
              checked={collaborationEnabled}
              onChange={() => setCollaborationEnabled(!collaborationEnabled)}
            />
            Enable Collaboration
          </label>
        </div>
        {collaborationEnabled && (
          <>
            <div>
              <label>
                Collaboration Mode:
                <select 
                  value={collaborationMode}
                  onChange={(e) => setCollaborationMode(e.target.value)}
                >
                  <option value="full">Full</option>
                  <option value="limited">Limited</option>
                  <option value="view-only">View Only</option>
                </select>
              </label>
            </div>
            <div>
              <label>
                <input 
                  type="checkbox" 
                  checked={useCollaborativeComments}
                  onChange={() => setUseCollaborativeComments(!useCollaborativeComments)}
                />
                Collaborative Comments
              </label>
            </div>
          </>
        )}
      </div>

      {/* Main canvas */}
      <div className="canvas-wrapper" ref={canvasRef}>
        <WhiteboardCanvas
          zoom={zoomLevel}
          pan={pan}
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
          // Collaboration props
          collaborationEnabled={collaborationEnabled}
          collaborationMode={collaborationMode}
          useCollaborativeComments={useCollaborativeComments}
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

      {/* Add comment button */}
      <button 
        className="fab-button"
        onClick={() => setMode('comment')}
        title="Add Comment"
      >
        +
      </button>

      {/* Zoom controls */}
      <div className="zoom-controls">
        <button className="zoom-button" onClick={() => setZoomLevel(prev => Math.min(prev * 1.2, 3))}>+</button>
        <div className="zoom-value">{Math.round(zoomLevel * 100)}%</div>
        <button className="zoom-button" onClick={() => setZoomLevel(prev => Math.max(prev / 1.2, 0.5))}>−</button>
        <button className="zoom-button" onClick={() => setZoomLevel(1)}>↺</button>
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

export default Whiteboard