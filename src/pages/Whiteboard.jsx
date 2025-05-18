// src/pages/Whiteboard.jsx - Fixed version
import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WhiteboardCanvas from '../components/whiteboard/WhiteboardCanvas';
import CommentSystemExplainer from '../components/whiteboard/CommentSystemExplainer';
import AnnotationLayer from '../components/whiteboard/AnnotationLayer';
import critiqueService from '../services/CritiqueService';
import ToolBar from '../components/whiteboard/Toolbar';
import { useAuth } from '../contexts/AuthContext';
import '../components/whiteboard/Toolbar.css';
import './Whiteboard.css';

const Whiteboard = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef();
  const { currentUser } = useAuth(); // Get current user from auth context
  
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

  // User profile - Use current user from auth context
  const userProfile = {
    name: currentUser?.displayName || currentUser?.email || "Anonymous User",
    avatar: currentUser?.photoURL || "/path/to/default-avatar.jpg",
    id: currentUser?.uid || "anonymous-user"
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
        console.log("Loading whiteboard data for post ID:", postId);
        
        // Load post details including image
        const postData = await critiqueService.getPostById(postId);
        console.log("Post data loaded:", postData);
        setPost(postData);
        
        // Set image URL (use actual image URL from post data)
        if (postData?.imageUrl) {
          console.log("Using image URL from post:", postData.imageUrl);
          setImageUrl(postData.imageUrl);
        } else if (postData?.image) {
          console.log("Using image from post:", postData.image);
          setImageUrl(postData.image);
        } else {
          console.log("Using placeholder image");
          setImageUrl(`/api/placeholder/${600 + (parseInt(postId) % 10 || 0)}/${400 + (parseInt(postId) % 20 || 0)}`);
        }
        
        // Load whiteboard data
        const whiteboardData = await critiqueService.getWhiteboardData(postId);
        console.log("Whiteboard data loaded:", whiteboardData);
        
        // Initialize comments with saved data or defaults
        let processedComments = [];
        if (whiteboardData?.comments && whiteboardData.comments.length > 0) {
          processedComments = whiteboardData.comments.map(comment => ({
            ...comment,
            reactions: comment.reactions || { agreed: 0, disagreed: 0 },
            replies: comment.replies || [],
            links: comment.links || []
          }));
          setComments(processedComments);
          console.log("Loaded saved comments:", processedComments);
        } else {
          // If no comments, add sample comments for testing (can be removed in production)
          const sampleComments = [
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
          ];
          setComments(sampleComments);
          console.log("Using sample comments since none were saved");
          
          // Save sample comments to database
          await critiqueService.saveWhiteboardData(postId, { 
            comments: sampleComments,
            stamps: []
          });
        }
        
        // Load any saved annotations
        if (whiteboardData?.annotations && whiteboardData.annotations.length > 0) {
          // Separate user and guest annotations
          const userAnno = whiteboardData.annotations.filter(a => a.userId === userProfile.id);
          const guestAnno = whiteboardData.annotations.filter(a => a.userId !== userProfile.id);
          
          setAnnotations(userAnno);
          setGuestAnnotations(guestAnno);
          console.log("Loaded saved annotations");
        }
      } catch (error) {
        console.error("Error loading post or whiteboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [postId, userProfile.id]);

  // Update score when comments change
  useEffect(() => {
    const newScore = calculateLinkPoints(comments);
    setScore(newScore);
  }, [comments]);

  // Sync localPan with pan
  useEffect(() => {
    setLocalPan(pan);
  }, [pan]);

  // Save comments when they change
  useEffect(() => {
    // Don't save empty comments or during initial load
    if (loading || comments.length === 0) return;
    
    const saveComments = async () => {
      try {
        console.log("Saving comments to whiteboard data:", comments);
        await critiqueService.saveWhiteboardData(postId, { 
          comments: comments,
          stamps: [] // Add stamps if needed
        });
        console.log("Comments saved successfully");
      } catch (error) {
        console.error("Error saving whiteboard comments:", error);
      }
    };
    
    // Use a debounce to avoid too many saves
    const timeoutId = setTimeout(saveComments, 1000);
    return () => clearTimeout(timeoutId);
  }, [comments, postId, loading]);

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
      
      // Save annotations to database
      const saveAnnotations = async () => {
        try {
          await critiqueService.saveWhiteboardData(postId, { 
            annotations: annotations
          });
          console.log("Annotations saved successfully");
        } catch (error) {
          console.error("Error saving whiteboard annotations:", error);
        }
      };
      
      saveAnnotations();
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
    
    // Save annotations to backend
    const saveAnnotationsToBackend = async () => {
      try {
        await critiqueService.saveWhiteboardData(postId, { 
          annotations: newAnnotations
        });
        console.log("Annotations saved successfully");
      } catch (error) {
        console.error("Error saving whiteboard annotations:", error);
      }
    };
    
    saveAnnotationsToBackend();
    
    if (collaborationEnabled) {
      simulateGuestActivity('Guest is viewing your annotations...');
    }
  };

  // Handle annotation clear
  const handleAnnotationClear = () => {
    setAnnotations([]);
    
    // Clear annotations from backend
    const clearAnnotationsFromBackend = async () => {
      try {
        await critiqueService.saveWhiteboardData(postId, { 
          annotations: []
        });
        console.log("Annotations cleared successfully");
      } catch (error) {
        console.error("Error clearing whiteboard annotations:", error);
      }
    };
    
    clearAnnotationsFromBackend();
    
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
            useCollaborativeComments={useCollaborativeComments}
            // User profile - pass current user from auth
            userProfile={userProfile}
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