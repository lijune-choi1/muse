// src/pages/Whiteboard.jsx - With Cursor Tracking
import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WhiteboardCanvas from '../components/whiteboard/WhiteboardCanvas';
import CommentTracker from '../components/whiteboard/CommentTracker';
import CommentSystemExplainer from '../components/whiteboard/CommentSystemExplainer';
import AnnotationLayer from '../components/whiteboard/AnnotationLayer';
import CursorManager from '../components/whiteboard/CursorManager';
import critiqueService from '../services/CritiqueService';
import commentService from '../services/CommentService';
import ToolBar from '../components/whiteboard/Toolbar';
import { useAuth } from '../contexts/AuthContext';
import '../components/whiteboard/Toolbar.css';
import './Whiteboard.css';

const Whiteboard = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef();
  const { currentUser } = useAuth();
  
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
  const [showLinks, setShowLinks] = useState(true);
  
  // Cursor tracking
  const [cursorTrackingEnabled, setCursorTrackingEnabled] = useState(true);
  
  // Comment Tracker state
  const [trackerCollapsed, setTrackerCollapsed] = useState(false);
  
  // Clustering states
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [clusterThreshold, setClusterThreshold] = useState(40);
  
  // Explainer state
  const [showExplainer, setShowExplainer] = useState(true);
  const [explainerDismissed, setExplainerDismissed] = useState(false);
  
  // User information
  const userProfile = {
    name: currentUser?.displayName || currentUser?.email || "Anonymous User",
    avatar: currentUser?.photoURL || "/path/to/default-avatar.jpg",
    id: currentUser?.uid || "anonymous-user"
  };
  
  // Check local storage for user preferences
  useEffect(() => {
    const hasSeenExplainer = localStorage.getItem('hasSeenCommentExplainer');
    if (hasSeenExplainer) {
      setShowExplainer(false);
      setExplainerDismissed(true);
    }
    
    // Check if tracker collapse state is stored
    const trackerState = localStorage.getItem('commentTrackerCollapsed');
    if (trackerState) {
      setTrackerCollapsed(trackerState === 'true');
    }
    
    // Check cursor tracking preference
    const cursorTracking = localStorage.getItem('cursorTrackingEnabled');
    if (cursorTracking) {
      setCursorTrackingEnabled(cursorTracking === 'true');
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
    localStorage.setItem('hasSeenCommentExplainer', 'true');
  };

  // Handle tracker collapse toggle
  const handleTrackerToggle = (collapsed) => {
    setTrackerCollapsed(collapsed);
    localStorage.setItem('commentTrackerCollapsed', collapsed);
  };
  
  // Toggle cursor tracking
  const toggleCursorTracking = () => {
    const newState = !cursorTrackingEnabled;
    setCursorTrackingEnabled(newState);
    localStorage.setItem('cursorTrackingEnabled', newState);
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
        ).filter(Boolean);

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
        
        // Load comments from Firebase
        const firebaseComments = await commentService.getCommentsByDesignId(postId);
        if (firebaseComments && Object.keys(firebaseComments).length > 0) {
          // Convert from object to array
          const commentsArray = Object.values(firebaseComments);
          setComments(commentsArray);
          console.log("Loaded comments from Firebase:", commentsArray);
        } else {
          console.log("No comments found in Firebase for this design");
          setComments([]);
        }
        
        // Load whiteboard data for annotations
        const whiteboardData = await critiqueService.getWhiteboardData(postId);
        console.log("Whiteboard data loaded:", whiteboardData);
        
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
  };

  // Handle comment selection from the tracker
  const handleTrackerCommentSelect = (commentId) => {
    setSelectedCommentId(commentId);
    setExpandedCommentId(commentId);
    
    // If the comment exists, scroll to its position
    const selectedComment = comments.find(comment => comment.id === commentId);
    if (selectedComment && selectedComment.position) {
      // Calculate the center position for the comment
      const commentX = selectedComment.position.x;
      const commentY = selectedComment.position.y;
      
      // Calculate the new pan to center the comment
      const containerWidth = canvasRef.current?.clientWidth || 0;
      const containerHeight = canvasRef.current?.clientHeight || 0;
      
      const newPan = {
        x: -(commentX * zoomLevel) + (containerWidth / 2),
        y: -(commentY * zoomLevel) + (containerHeight / 2)
      };
      
      // Update pan position to center on the comment
      setPan(newPan);
      setLocalPan(newPan);
    }
  };

  return (
    <div className="whiteboard-container">
      {/* Explainer overlay */}
      {showExplainer && !explainerDismissed && (
        <CommentSystemExplainer onDismiss={handleExplainerDismiss} />
      )}
      
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
            // Pass designId to the whiteboard canvas for Firebase queries
            designId={postId}
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
        
        {/* Cursor Manager - shows other users' cursors */}
        {cursorTrackingEnabled && (
          <CursorManager
            designId={postId}
            currentUser={currentUser}
            canvasRef={canvasRef}
            enabled={true}
          />
        )}
      </div>
  
      {/* Comment Tracker sidebar */}
      <CommentTracker
        comments={comments}
        onCommentSelect={handleTrackerCommentSelect}
        selectedCommentId={selectedCommentId}
        collapsed={trackerCollapsed}
        onToggleCollapse={handleTrackerToggle}
      />
  
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
      
      {/* Cursor tracking toggle */}
      <button 
        className="cursor-tracking-toggle"
        onClick={toggleCursorTracking}
        title={cursorTrackingEnabled ? "Disable cursor tracking" : "Enable cursor tracking"}
      >
        {cursorTrackingEnabled ? "👁️" : "👁️‍🗨️"}
      </button>
      
      {/* Collaboration indicator showing active users */}
      {cursorTrackingEnabled && (
        <div className="active-users-indicator">
          <div className="active-users-count">
            <span className="user-dot" style={{ backgroundColor: '#4285F4' }}></span>
            {/* This would show the actual count from CursorManager */}
            <span>2 users online</span>
          </div>
        </div>
      )}
      
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