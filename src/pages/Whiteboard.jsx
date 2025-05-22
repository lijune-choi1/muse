// src/pages/Whiteboard.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WhiteboardCanvas from '../components/whiteboard/WhiteboardCanvas';
import CommentTracker from '../components/whiteboard/CommentTracker';
import CommentSystemExplainer from '../components/whiteboard/CommentSystemExplainer';
import AnnotationLayer from '../components/whiteboard/AnnotationLayer';
import CursorManager, { useCommentActivityTracking } from '../components/whiteboard/CursorManager';
import HelpModal from '../components/whiteboard/HelpModal';
import critiqueService from '../services/CritiqueService';
import commentService from '../services/CommentService';
import { useAuth } from '../contexts/AuthContext';
import '../components/whiteboard/Toolbar.css';
import './Whiteboard.css';

const Whiteboard = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef();
  const cursorManagerRef = useRef(null);
  const { currentUser } = useAuth();
  
  // Activity tracking
  const { registerCommentActivity, registerLinkingActivity } = useCommentActivityTracking();
  
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
  const [activeUserCount, setActiveUserCount] = useState(1);
  
  // Comment Tracker state - always starts expanded
  const [trackerCollapsed, setTrackerCollapsed] = useState(false);
  
  // Clustering states
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [clusterThreshold, setClusterThreshold] = useState(40);
  
  // Explainer state
  const [showExplainer, setShowExplainer] = useState(true);
  const [explainerDismissed, setExplainerDismissed] = useState(false);
  
  // Help modal state
  const [showHelpModal, setShowHelpModal] = useState(false);
  
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
    
    // Check cursor tracking preference
    const cursorTracking = localStorage.getItem('cursorTrackingEnabled');
    if (cursorTracking) {
      setCursorTrackingEnabled(cursorTracking === 'true');
    }
    
    // Always start with tracker expanded
    setTrackerCollapsed(false);
  }, []);

  // Set up custom event listeners for comment activities with improved handling
  useEffect(() => {
    const handleCommentActivity = (event) => {
      console.log('Whiteboard received comment activity event:', event.detail);
      const { comment, activityType } = event.detail;
      
      // Get the comment's position in screen coordinates
      if (comment && comment.position && canvasRef.current) {
        const screenX = comment.position.x * zoomLevel + localPan.x;
        const screenY = comment.position.y * zoomLevel + localPan.y;
        
        console.log('Converting comment position:', { 
          original: comment.position, 
          screen: { x: screenX, y: screenY },
          zoom: zoomLevel,
          pan: localPan 
        });
        
        // Call the CursorManager method directly if we have a ref to it
        if (cursorManagerRef.current && cursorManagerRef.current.registerCommentActivity) {
          console.log('Calling CursorManager method directly');
          cursorManagerRef.current.registerCommentActivity(
            { ...comment, position: { x: screenX, y: screenY } },
            activityType
          );
        } else {
          console.log('CursorManager ref not available, using fallback');
          // Fallback: dispatch to global handler
          registerCommentActivity(
            { ...comment, position: { x: screenX, y: screenY } },
            activityType
          );
        }
      }
    };
    
    const handleLinkingActivity = (event) => {
      console.log('Whiteboard received linking activity event:', event.detail);
      const { sourceCommentId, targetCommentId, sourcePosition, targetPosition } = event.detail;
      
      // Convert positions to screen coordinates
      if (sourcePosition && targetPosition && canvasRef.current) {
        const screenSourceX = sourcePosition.x * zoomLevel + localPan.x;
        const screenSourceY = sourcePosition.y * zoomLevel + localPan.y;
        const screenTargetX = targetPosition.x * zoomLevel + localPan.x;
        const screenTargetY = targetPosition.y * zoomLevel + localPan.y;
        
        console.log('Converting linking positions:', { 
          source: { original: sourcePosition, screen: { x: screenSourceX, y: screenSourceY } },
          target: { original: targetPosition, screen: { x: screenTargetX, y: screenTargetY } }
        });
        
        // Call the CursorManager method directly if we have a ref to it
        if (cursorManagerRef.current && cursorManagerRef.current.registerLinkingActivity) {
          console.log('Calling CursorManager linking method directly');
          cursorManagerRef.current.registerLinkingActivity(
            sourceCommentId,
            targetCommentId,
            { x: screenSourceX, y: screenSourceY },
            { x: screenTargetX, y: screenTargetY }
          );
        } else {
          console.log('CursorManager ref not available for linking, using fallback');
          // Fallback: dispatch to global handler
          registerLinkingActivity(
            sourceCommentId,
            targetCommentId,
            { x: screenSourceX, y: screenSourceY },
            { x: screenTargetX, y: screenTargetY }
          );
        }
      }
    };
    
    // Add event listeners
    window.addEventListener('register-comment-activity', handleCommentActivity);
    window.addEventListener('register-linking-activity', handleLinkingActivity);
    
    // Cleanup
    return () => {
      window.removeEventListener('register-comment-activity', handleCommentActivity);
      window.removeEventListener('register-linking-activity', handleLinkingActivity);
    };
  }, [registerCommentActivity, registerLinkingActivity, zoomLevel, localPan]);

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
      console.log("Saving annotations:", annotations);
    }
    
    setMode(newMode);
  };

  // Handle annotation save
  const handleAnnotationSave = (newAnnotations) => {
    setAnnotations(newAnnotations);
  };

  // Handle annotation clear
  const handleAnnotationClear = () => {
    setAnnotations([]);
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

  // Enhanced comment activity handler that ensures events are fired
  const handleCommentActivity = (comment, activityType) => {
    console.log('handleCommentActivity called:', { commentId: comment.id, activityType });
    
    // Immediately dispatch the custom event
    const event = new CustomEvent('register-comment-activity', {
      detail: { comment, activityType }
    });
    window.dispatchEvent(event);
    
    // Also try direct call if possible
    if (cursorManagerRef.current && cursorManagerRef.current.registerCommentActivity) {
      cursorManagerRef.current.registerCommentActivity(comment, activityType);
    }
  };

  // Enhanced linking activity handler that ensures events are fired
  const handleLinkingActivity = (sourceComment, targetComment) => {
    if (!sourceComment || !targetComment) return;
    
    console.log('handleLinkingActivity called:', { 
      sourceId: sourceComment.id, 
      targetId: targetComment.id 
    });
    
    // Immediately dispatch the custom event
    const event = new CustomEvent('register-linking-activity', {
      detail: {
        sourceCommentId: sourceComment.id,
        targetCommentId: targetComment.id,
        sourcePosition: sourceComment.position,
        targetPosition: targetComment.position
      }
    });
    window.dispatchEvent(event);
    
    // Also try direct call if possible
    if (cursorManagerRef.current && cursorManagerRef.current.registerLinkingActivity) {
      cursorManagerRef.current.registerLinkingActivity(
        sourceComment.id,
        targetComment.id,
        sourceComment.position,
        targetComment.position
      );
    }
  };

  // Handle help button click
  const handleHelpClick = () => {
    setShowHelpModal(true);
  };

  return (
    <div className="whiteboard-container">
      {/* Top Navigation - similar to the reference image */}
      <div className="whiteboard-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          &#8592;
        </button>
        
        <h1 className="whiteboard-title">{post?.title || "Untitled Whiteboard"}</h1>
        
        <div className="header-actions">
          <button className="user-indicator">{currentUser?.displayName?.charAt(0) || "U"}</button>
          <button className="share-button">Share</button>
          <button className="menu-button">⋮</button>
        </div>
      </div>
      
      {/* Explainer overlay */}
      {showExplainer && !explainerDismissed && (
        <CommentSystemExplainer onDismiss={handleExplainerDismiss} />
      )}
      
      {/* Help modal */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      
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
            // Activity tracking
            onCommentActivity={handleCommentActivity}
            onLinkingActivity={handleLinkingActivity}
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
          designId={postId}
          onSave={handleAnnotationSave}
          onClear={handleAnnotationClear}
          onAnnotationAdded={(annotation) => {
            console.log("Annotation added:", annotation);
          }}
        />
        
        {/* Cursor Manager - shows other users' cursors and activities */}
        {cursorTrackingEnabled && (
          <CursorManager
            ref={cursorManagerRef}
            designId={postId}
            currentUser={currentUser}
            canvasRef={canvasRef}
            enabled={true}
            onUserCountChange={setActiveUserCount}
          />
        )}
      </div>
      
      {/* Left sidebar toolbar - vertical layout */}
      <div className="sidebar-toolbar">
        {/* Main mode buttons - vertical layout */}
        <button 
          className={`toolbar-button ${mode === 'select' ? 'active' : ''}`}
          onClick={() => handleModeChange('select')}
          title="Select Mode"
        >
          <i className="icon-select">⊙</i>
        </button>
        
        <button 
          className={`toolbar-button ${mode === 'comment' ? 'active' : ''}`}
          onClick={() => handleModeChange('comment')}
          title="Comment Mode"
        >
          <i className="icon-comment">✎</i>
        </button>
        
        <button 
          className={`toolbar-button ${mode === 'annotate' ? 'active' : ''}`}
          onClick={() => handleModeChange('annotate')}
          title="Annotate Mode"
        >
          <i className="icon-annotate">✏️</i>
        </button>
        
        {/* Divider */}
        <div className="toolbar-divider"></div>
        
        {/* Comment settings - only visible when in comment or select mode */}
        {(mode === 'comment' || mode === 'select') && (
          <>
            <button
              className={`toolbar-button ${clusteringEnabled ? 'active' : ''}`}
              onClick={() => setClusteringEnabled(!clusteringEnabled)}
              title={clusteringEnabled ? "Disable Comment Grouping" : "Enable Comment Grouping"}
            >
              <i className="icon-group">⌘</i>
            </button>
            
            <button
              className={`toolbar-button ${showLinks ? 'active' : ''}`}
              onClick={() => setShowLinks(!showLinks)}
              title={showLinks ? "Hide Comment Links" : "Show Comment Links"}
            >
              <i className="icon-links">⟀</i>
            </button>
          </>
        )}
        
        {/* Divider */}
        <div className="toolbar-divider"></div>
        
        {/* Cursor tracking toggle */}
        <button 
          className={`toolbar-button ${cursorTrackingEnabled ? 'active' : ''}`}
          onClick={toggleCursorTracking}
          title={cursorTrackingEnabled ? "Disable Cursor Tracking" : "Enable Cursor Tracking"}
        >
          <i className="icon-cursor">👁</i>
        </button>
        
        {/* Help button */}
        <button 
          className="toolbar-button"
          onClick={handleHelpClick}
          title="Help"
        >
          <i className="icon-help">?</i>
        </button>
      </div>
  
      {/* Comment Tracker sidebar - always expanded on initial load */}
      <CommentTracker
        comments={comments}
        onCommentSelect={handleTrackerCommentSelect}
        selectedCommentId={selectedCommentId}
        collapsed={trackerCollapsed}
        onToggleCollapse={handleTrackerToggle}
      />
  
      {/* Zoom controls - bottom right similar to reference image */}
      <div className="zoom-controls">
        <button className="zoom-button" onClick={() => setZoomLevel(prev => Math.min(prev * 1.2, 3))}>+</button>
        <div className="zoom-value">{Math.round(zoomLevel * 100)}%</div>
        <button className="zoom-button" onClick={() => setZoomLevel(prev => Math.max(prev / 1.2, 0.5))}>−</button>
        <button className="zoom-button" onClick={() => setZoomLevel(1)}>↺</button>
      </div>
      
      {/* Active users indicator - bottom of screen similar to reference */}
      {cursorTrackingEnabled && (
        <div className="active-users-indicator">
          <div className="active-users-count">
            <span className="user-dot" style={{ backgroundColor: '#4285F4' }}></span>
            <span>{activeUserCount} {activeUserCount === 1 ? 'user' : 'users'} online</span>
          </div>
          <button 
            className="cursor-toggle-button"
            onClick={toggleCursorTracking}
            title="Toggle cursor tracking"
          >
            👁
          </button>
        </div>
      )}
      
    </div>
  );
};
  
export default Whiteboard;