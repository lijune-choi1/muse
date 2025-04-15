import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WhiteboardCanvas from '../components/whiteboard/WhiteboardCanvas';
import CommentSystemExplainer from '../components/whiteboard/CommentSystemExplainer';
import AnnotationLayer from '../components/whiteboard/AnnotationLayer';
import critiqueService from './CritiqueService';
import ToolBar from '../components/whiteboard/Toolbar';
import '../components/whiteboard/Toolbar.css';
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
  const [localPan, setLocalPan] = useState({ x: 0, y: 0 });
  const [annotations, setAnnotations] = useState([]);
  const [guestAnnotations, setGuestAnnotations] = useState([]);
  
  // Collaboration testing states
  const [collaborationEnabled, setCollaborationEnabled] = useState(false);
  const [collaborationMode, setCollaborationMode] = useState('full');
  const [useCollaborativeComments, setUseCollaborativeComments] = useState(false);
  const [guestActivity, setGuestActivity] = useState(null);
  
  // Comment state
  const [comments, setComments] = useState([]);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [expandedCommentId, setExpandedCommentId] = useState(null);
  const [hoveredCommentId, setHoveredCommentId] = useState(null);
  const [score, setScore] = useState({ technical: 0, conceptual: 0, details: 0, total: 0 });
  
  // Display states
  const [showComments, setShowComments] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [showLinks, setShowLinks] = useState(true); // Link visibility toggle
  
  // Clustering states
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [clusterThreshold, setClusterThreshold] = useState(40);
  const [showClusterControls, setShowClusterControls] = useState(false);
  
  // Explainer state
  const [showExplainer, setShowExplainer] = useState(true);
  const [explainerDismissed, setExplainerDismissed] = useState(false);

  // Mock user profile - in real app, this would come from auth
  const userProfile = {
    name: "Jane Doe",
    avatar: "/path/to/avatar.jpg",
    id: "user-1"
  };
  
  const guestProfile = {
    name: "Guest User",
    avatar: "/path/to/guest-avatar.jpg",
    id: "guest-1"
  };

  // Check local storage to see if the user has already seen the explainer
  useEffect(() => {
    const hasSeenExplainer = localStorage.getItem('hasSeenCommentExplainer');
    if (hasSeenExplainer) {
      setShowExplainer(false);
      setExplainerDismissed(true);
    }
  }, []);

  // Update visibility based on mode
  useEffect(() => {
    // Show comments in all modes except annotation mode
    setShowComments(mode !== 'annotate');
    
    // Only show annotations in annotation mode
    setShowAnnotations(mode === 'annotate');
    
    // Clear selection when switching to annotation mode
    if (mode === 'annotate') {
      setSelectedCommentId(null);
      setExpandedCommentId(null);
    }
  }, [mode]);

  // Handle explainer dismissal
  const handleExplainerDismiss = () => {
    setShowExplainer(false);
    setExplainerDismissed(true);
    
    // Store in local storage so it doesn't show again
    localStorage.setItem('hasSeenCommentExplainer', 'true');
  };

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
            },
            // Add some overlapping comments to demonstrate clustering
            {
              id: 'sample-comment-3',
              position: { x: 305, y: 195 },
              type: 'details',
              text: 'This overlaps with the conceptual comment',
              reactions: { agreed: 0, disagreed: 0 },
              replies: [],
              links: []
            },
            {
              id: 'sample-comment-4',
              position: { x: 310, y: 205 },
              type: 'technical',
              text: 'Another overlapping comment',
              reactions: { agreed: 0, disagreed: 0 },
              replies: [],
              links: []
            },
            {
              id: 'sample-comment-5',
              position: { x: 315, y: 198 },
              type: 'details',
              text: 'Third overlapping comment',
              reactions: { agreed: 0, disagreed: 0 },
              replies: [],
              links: []
            }
          ]);
        }
        
        // Load any saved annotations
        if (whiteboardData.annotations && whiteboardData.annotations.length > 0) {
          // Separate user and guest annotations
          const userAnno = whiteboardData.annotations.filter(a => a.userId === userProfile.id);
          const guestAnno = whiteboardData.annotations.filter(a => a.userId !== userProfile.id);
          
          setAnnotations(userAnno);
          setGuestAnnotations(guestAnno);
        }
        
        // Add some simulated guest annotations if there aren't any
        if (!whiteboardData.annotations || 
            !whiteboardData.annotations.some(a => a.userId !== userProfile.id)) {
          setGuestAnnotations([
            {
              points: [
                { x: 150, y: 120 },
                { x: 200, y: 140 },
                { x: 250, y: 130 },
                { x: 300, y: 150 }
              ],
              color: '#0074D9',
              width: 3,
              tool: 'pen',
              timestamp: new Date().toISOString(),
              userId: 'guest-1',
              userName: 'Guest User'
            }
          ]);
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

  // Sync localPan with pan
  useEffect(() => {
    setLocalPan(pan);
  }, [pan]);

  if (loading) {
    return (
      <div className="whiteboard-container">
        <div className="loading">Loading whiteboard...</div>
      </div>
    );
  }

  // Handle mode change with appropriate cursor updates
  const handleModeChange = (newMode) => {
    // If switching from annotation mode, make sure we save any pending annotations
    if (mode === 'annotate') {
      // You might want to add logic here to save annotations to your backend
      console.log("Saving annotations:", annotations);
    }
    
    setMode(newMode);
  };

  // Simulate guest activities
  const simulateGuestActivity = (activity) => {
    if (!collaborationEnabled) return;
    
    setGuestActivity(activity);
    setTimeout(() => setGuestActivity(null), 3000);
  };

  // Handle annotation save
  const handleAnnotationSave = (newAnnotations) => {
    setAnnotations(newAnnotations);
    
    // In a real app, you would save these to your backend
    // critiqueService.saveAnnotations(postId, newAnnotations);
    
    if (collaborationEnabled) {
      simulateGuestActivity('Guest is viewing your annotations...');
    }
  };

  // Handle annotation clear
  const handleAnnotationClear = () => {
    setAnnotations([]);
    
    // In a real app, you would clear these from your backend
    // critiqueService.clearAnnotations(postId);
    
    if (collaborationEnabled) {
      simulateGuestActivity('Guest noticed you cleared the annotations');
    }
  };

  // Handle cluster threshold change
  const handleClusterThresholdChange = (e) => {
    const value = parseInt(e.target.value);
    setClusterThreshold(value);
  };

  return (
    <div className="whiteboard-container">
      {/* Explainer overlay */}
      {showExplainer && !explainerDismissed && (
        <CommentSystemExplainer onDismiss={handleExplainerDismiss} />
      )}
      
      {/* Top score bar */}
      <div className="scorebar-container" style={{ opacity: showComments ? 1 : 0.2 }}>
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
          display: 'none',
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
        <h4>Controls</h4>
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
        
        <hr style={{ margin: '10px 0', borderTop: '1px solid #ddd' }} />
        
        {/* Clustering controls */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>
              <input 
                type="checkbox" 
                checked={clusteringEnabled}
                onChange={() => setClusteringEnabled(!clusteringEnabled)}
              />
              Enable Comment Clustering
            </label>
            <button 
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#0074D9',
                fontSize: '14px'
              }}
              onClick={() => setShowClusterControls(!showClusterControls)}
            >
              {showClusterControls ? 'Hide Options' : 'Show Options'}
            </button>
          </div>
          
          {showClusterControls && (
            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <label>
                Cluster Threshold: {clusterThreshold}px
                <input 
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={clusterThreshold}
                  onChange={handleClusterThresholdChange}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </label>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                Smaller values create more clusters, larger values group more comments together.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main canvas area */}
      <div className="canvas-wrapper" ref={canvasRef}>
        {/* Background Image */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) translate(${localPan.x}px, ${localPan.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.1s ease-out'
          }}
        >
          <img 
            src={imageUrl} 
            alt="Whiteboard content"
            className="whiteboard-image" 
            style={{ 
              maxWidth: '70%', 
              maxHeight: '70%',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              border: '1px solid #ddd'
            }} 
          />
        </div>
        
        {/* Comments Layer - only visible when not in annotation mode */}
        {showComments && (
          <WhiteboardCanvas
            zoom={zoomLevel}
            pan={localPan}
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
            // Link visibility
            showLinks={showLinks}
            // Clustering props
            clusteringEnabled={clusteringEnabled}
            clusterThreshold={clusterThreshold}
            // Collaboration props
            collaborationEnabled={collaborationEnabled}
            collaborationMode={collaborationMode}
            useCollaborativeCommentsuseCollaborativeComments={useCollaborativeComments}
            />
          )}
          
          {/* Annotation Layer - only shown in annotation mode */}
          <AnnotationLayer 
            enabled={mode === 'annotate'}
            zoom={zoomLevel}
            pan={localPan}
            initialColor="#FF0000"
            initialStrokeWidth={3}
            userProfile={userProfile}
            guestStrokes={guestAnnotations}
            onSave={handleAnnotationSave}
            onClear={handleAnnotationClear}
          />
        </div>
  
        {/* Guest activity indicator */}
        {guestActivity && (
          <div style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(52, 152, 219, 0.9)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            zIndex: 1000,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            {guestActivity}
          </div>
        )}
  
        <ToolBar
            currentMode={mode}
            setMode={handleModeChange}
            showLinks={showLinks}
            setShowLinks={setShowLinks}
            clusteringEnabled={clusteringEnabled}
            setClusteringEnabled={setClusteringEnabled}
          />
  
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
        
        {/* Clustering information tooltip */}
        {clusteringEnabled && mode !== 'annotate' && (
          <div className="clustering-info-tooltip" style={{
            position: 'absolute',
            bottom: '70px',
            left: '20px',
            backgroundColor: 'rgba(52, 152, 219, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            maxWidth: '280px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.3s',
            zIndex: 90
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Comment Clustering Active</div>
            <div>Multiple comments in the same area are grouped into clusters. Click a cluster to see all comments in a thread view.</div>
          </div>
        )}
      </div>
    );
  };
  
  export default Whiteboard;
