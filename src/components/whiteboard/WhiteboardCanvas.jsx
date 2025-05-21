// src/components/whiteboard/WhiteboardCanvas.jsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import CommentTag from '../common/CommentTag';
import CommentLinking from '../common/CommentLinking';
import CommentCluster from './CommentCluster';
import CommentThread from './CommentThread';
import commentService from '../../services/CommentService';
import CommentBubbleManager from './CommentBubbleManager';
import { clusterComments, isSingletonCluster, createCommentToClusterMap } from './ClusteringUtils';

const WhiteboardCanvas = ({
  zoom, 
  pan, 
  imageUrl,
  comments,
  selectedCommentId,
  expandedCommentId,
  hoveredCommentId,
  setComments,
  onCommentSelect,
  onCommentExpand,
  onCommentHover,
  onCommentEdit,
  mode,
  showLinks = true, // Link visibility
  designId, // Add design ID for Firebase queries
  // Clustering props
  clusteringEnabled = true,
  clusterThreshold = 40
}) => {
  const canvasRef = useRef(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [localPan, setLocalPan] = useState({ x: pan.x, y: pan.y });
  const [links, setLinks] = useState([]);
  const [linkingMode, setLinkingMode] = useState(false);
  const [linkingSourceId, setLinkingSourceId] = useState(null);
  
  // State for dragging comments
  const [draggedCommentId, setDraggedCommentId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Clustering states
  const [clusters, setClusters] = useState([]);
  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [showingThread, setShowingThread] = useState(false);
  const [clusterCommentIds, setClusterCommentIds] = useState([]);
  const [draggedClusterIds, setDraggedClusterIds] = useState([]);
  const [hoveredClusterId, setHoveredClusterId] = useState(null);
  
  // User profile - in a real app, this would come from auth context
  const userProfile = {
    name: commentService.getCurrentUser()?.name || "Current User",
    avatar: "/path/to/avatar.jpg",
    id: commentService.getCurrentUser()?.uid || "user-1"
  };

  // Initialize the comment bubble manager with design ID
  const bubbleManager = CommentBubbleManager({
    designId,
    comments,
    selectedCommentId,
    expandedCommentId,
    onCommentSelect,
    onCommentExpand,
    onContentChange: handleContentChange,
    onTypeChange: handleTypeChange,
    onDelete: handleDeleteComment,
    onReactionChange: handleReactionChange,
    onReplyAdd: handleAddReply,
    zoom,
    localPan,
    userProfile
  });

  // Sync local pan with prop pan
  useEffect(() => {
    setLocalPan({ x: pan.x, y: pan.y });
  }, [pan]);

  // Update canvas dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        setCanvasDimensions({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Extract links from comments on update
  useEffect(() => {
    const extractLinks = () => {
      const newLinks = [];
      
      comments.forEach(comment => {
        if (comment.links && comment.links.length > 0) {
          comment.links.forEach(targetId => {
            const targetComment = comments.find(c => c.id === targetId);
            
            if (targetComment) {
              newLinks.push({
                id: `link-${comment.id}-${targetId}`,
                source: comment.id,
                target: targetId,
                sourceType: comment.type,
                targetType: targetComment.type
              });
            }
          });
        }
      });
      
      setLinks(newLinks);
    };
    
    extractLinks();
  }, [comments]);

  // Generate clusters when comments, zoom, or clustering settings change
  useEffect(() => {
    if (!clusteringEnabled) {
      setClusters([]);
      return;
    }
    
    const newClusters = clusterComments(comments, clusterThreshold, zoom);
    setClusters(newClusters);
    
    // If a selected comment is part of a cluster, select that cluster
    if (selectedCommentId) {
      const commentToClusterMap = createCommentToClusterMap(newClusters);
      const clusterId = commentToClusterMap.get(selectedCommentId);
      
      if (clusterId) {
        const cluster = newClusters.find(c => c.id === clusterId);
        
        if (cluster && !isSingletonCluster(cluster)) {
          setSelectedClusterId(clusterId);
          setClusterCommentIds(cluster.comments.map(c => c.id));
        } else {
          setSelectedClusterId(null);
          setClusterCommentIds([]);
        }
      }
    }
  }, [comments, zoom, clusteringEnabled, clusterThreshold, selectedCommentId]);

  // Filter visible comments (don't show comments that are part of non-singleton clusters)
  const visibleComments = useMemo(() => {
    if (!clusteringEnabled) return comments;
    
    const commentToClusterMap = createCommentToClusterMap(clusters);
    
    return comments.filter(comment => {
      const clusterId = commentToClusterMap.get(comment.id);
      
      // If no cluster, or showing this specific cluster's thread, or it's a singleton, show the comment
      if (!clusterId || 
          (showingThread && clusterCommentIds.includes(comment.id)) || 
          (clusters.find(c => c.id === clusterId)?.comments.length === 1)) {
        return true;
      }
      
      return false;
    });
  }, [comments, clusters, clusteringEnabled, showingThread, clusterCommentIds]);
  
  // Find full comments from IDs for thread view
  const threadComments = useMemo(() => {
    return clusterCommentIds.map(id => comments.find(c => c.id === id)).filter(Boolean);
  }, [comments, clusterCommentIds]);
  
  // Calculate thread position (average of all comments in thread)
  const threadPosition = useMemo(() => {
    if (threadComments.length === 0) return { x: 0, y: 0 };
    
    const sum = threadComments.reduce((acc, comment) => {
      return {
        x: acc.x + comment.position.x,
        y: acc.y + comment.position.y
      };
    }, { x: 0, y: 0 });
    
    return {
      x: sum.x / threadComments.length,
      y: sum.y / threadComments.length
    };
  }, [threadComments]);

  // Update document-level event listeners for dragging
  useEffect(() => {
    if (draggedCommentId || draggedClusterIds.length > 0) {
      const handleMouseMove = (e) => {
        if (!draggedCommentId && draggedClusterIds.length === 0) return;
        
        // Get mouse position relative to canvas
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate new position accounting for the initial drag offset
        const newPosition = {
          x: (mouseX - dragOffset.x - localPan.x) / zoom,
          y: (mouseY - dragOffset.y - localPan.y) / zoom
        };
        
        if (draggedCommentId) {
          // Single comment drag
          setComments(prevComments => 
            prevComments.map(comment => 
              comment.id === draggedCommentId 
                ? { ...comment, position: newPosition } 
                : comment
            )
          );
          
          // Update comment position in Firebase
          const comment = comments.find(c => c.id === draggedCommentId);
          if (comment) {
            const updatedComment = { ...comment, position: newPosition };
            commentService.saveComment(updatedComment);
          }
        } else if (draggedClusterIds.length > 0) {
          // Cluster drag - we need to maintain relative positions between comments
          
          // First, find the current positions of all comments in the cluster
          const currentPositions = {};
          comments.forEach(comment => {
            if (draggedClusterIds.includes(comment.id)) {
              currentPositions[comment.id] = { ...comment.position };
            }
          });
          
          // Calculate the cluster center (average position)
          let totalX = 0, totalY = 0;
          const clusterComments = draggedClusterIds.map(id => {
            const comment = comments.find(c => c.id === id);
            if (comment) {
              totalX += comment.position.x;
              totalY += comment.position.y;
            }
            return comment;
          }).filter(Boolean);
          
          const centerX = totalX / clusterComments.length;
          const centerY = totalY / clusterComments.length;
          
          // Calculate the displacement from old center to new position
          const dx = newPosition.x - centerX;
          const dy = newPosition.y - centerY;
          
          // Update all comments in the cluster
          const updatedComments = [];
          setComments(prevComments => 
            prevComments.map(comment => {
              if (draggedClusterIds.includes(comment.id)) {
                // Move each comment by the same displacement
                const updatedComment = {
                  ...comment,
                  position: {
                    x: comment.position.x + dx,
                    y: comment.position.y + dy
                  }
                };
                updatedComments.push(updatedComment);
                return updatedComment;
              }
              return comment;
            })
          );
          
          // Update all comments in Firebase
          updatedComments.forEach(comment => {
            commentService.saveComment(comment);
          });
        }
      };
      
      const handleMouseUp = () => {
        setDraggedCommentId(null);
        setDraggedClusterIds([]);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedCommentId, draggedClusterIds, dragOffset, zoom, localPan, setComments, comments]);

  // Handle canvas panning with mouse drag
  const handleMouseDown = (e) => {
    // Only use middle button (wheel) or right button for panning
    if (e.button === 1 || e.button === 2) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // Update local pan state
    setLocalPan(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Start dragging a comment
  const handleCommentDragStart = (e, commentId) => {
    e.stopPropagation();
    
    if (e.button !== 0) return; // Only left mouse button
    
    // Find the comment
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    // Get mouse position relative to canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate the offset from the mouse to the comment position
    const commentX = comment.position.x * zoom + localPan.x;
    const commentY = comment.position.y * zoom + localPan.y;
    
    setDraggedCommentId(commentId);
    setDragOffset({
      x: mouseX - commentX,
      y: mouseY - commentY
    });
    
    // Select the comment
    onCommentSelect(commentId);
  };

  // Canvas mouse event handling
  const handleCanvasClick = (e) => {
    if (linkingMode) {
      // If in linking mode, clicking on empty canvas cancels linking
      handleCancelLinking();
      return;
    }
    
    if (mode === 'comment') {
      // Handle comment placement
      const rect = canvasRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      
      // Convert screen coordinates to canvas coordinates
      const x = (screenX - localPan.x) / zoom;
      const y = (screenY - localPan.y) / zoom;
      
      // Create a new comment in Firebase
      createNewComment(x, y);
    }
  };
  
  // Handle double-click to create comment regardless of mode
  const handleCanvasDoubleClick = (e) => {
    // Don't create comment if in linking mode
    if (linkingMode) return;
    
    // Only create comment if clicking directly on the canvas or image
    if (e.target !== canvasRef.current && 
        !e.target.classList.contains('whiteboard-image') &&
        !e.target.classList.contains('canvas-wrapper')) {
      return;
    }
    
    // Get screen coordinates
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    
    // Convert to canvas coordinates
    const x = (screenX - localPan.x) / zoom;
    const y = (screenY - localPan.y) / zoom;
    
    // Create a new comment in Firebase
    createNewComment(x, y);
    
    // Prevent default browser behavior
    e.preventDefault();
  };
  
  // Create a new comment and save it to Firebase
  const createNewComment = async (x, y) => {
    // Create a new comment object
    const newComment = {
      designId: designId, // Important: Add the design ID
      position: { x, y },
      type: 'technical', // Default type
      text: '',
      reactions: { agreed: 0, disagreed: 0 },
      replies: [],
      links: [],
      points: 1
    };
    
    // Save to Firebase first
    const savedComment = await commentService.saveComment(newComment);
    
    if (savedComment && savedComment.id) {
      // Add to local state after successful Firebase save
      setComments(prev => [...prev, savedComment]);
      
      // Select and expand the new comment
      onCommentSelect(savedComment.id);
      onCommentExpand(savedComment.id);
    }
  };
  
  // Handle content change
  async function handleContentChange(commentId, newContent) {
    // Update Firebase first
    await commentService.updateCommentContent(commentId, newContent);
    
    // Then update local state
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, text: newContent } 
          : comment
      )
    );
  }
  
  // Handle type change
  async function handleTypeChange(commentId, newType) {
    // Update Firebase first
    await commentService.updateCommentType(commentId, newType);
    
    // Then update local state
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, type: newType } 
          : comment
      )
    );
  }
  
  // Handle comment deletion
  async function handleDeleteComment(commentId) {
    // Remove from Firebase first
    await commentService.deleteComment(commentId);
    
    // Remove links to/from this comment
    setComments(prevComments => {
      // First create a new array without the deleted comment
      const filteredComments = prevComments.filter(comment => comment.id !== commentId);
      
      // Then update any comments that had links to the deleted comment
      return filteredComments.map(comment => {
        if (comment.links && comment.links.includes(commentId)) {
          return {
            ...comment,
            links: comment.links.filter(id => id !== commentId)
          };
        }
        return comment;
      });
    });
    
    // Clear selection if deleted comment was selected
    if (selectedCommentId === commentId) {
      onCommentSelect(null);
    }
    if (expandedCommentId === commentId) {
      onCommentExpand(null);
    }
  }
  
  // Handle reaction change
  async function handleReactionChange(commentId, reactionData) {
    // Update Firebase first
    await commentService.updateCommentReactions(
      commentId, 
      reactionData.reactions, 
      reactionData.userReacted,
      userProfile.id
    );
    
    // Then update local state
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              reactions: reactionData.reactions,
              userReacted: reactionData.userReacted  
            } 
          : comment
      )
    );
  }
  
  // Handle reply adding
  async function handleAddReply(commentId, reply, updatedReplies) {
    // Add to Firebase first
    await commentService.addReply(commentId, reply);
    
    // Then update local state
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: updatedReplies } 
          : comment
      )
    );
  }
  
  // Handle cluster selection
  const handleClusterSelect = (commentIds) => {
    setClusterCommentIds(commentIds);
    setShowingThread(true);
    
    // Inform parent about first comment selection
    if (commentIds.length > 0) {
      onCommentSelect(commentIds[0]);
    }
  };
  
  // Handle cluster drag start
  const handleClusterDragStart = (e, commentIds, clusterPosition) => {
    e.stopPropagation();
    
    if (e.button !== 0) return; // Only left mouse button
    
    // Get mouse position relative to canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate the offset from the mouse to the cluster position
    const clusterX = clusterPosition.x * zoom + localPan.x;
    const clusterY = clusterPosition.y * zoom + localPan.y;
    
    setDraggedClusterIds(commentIds);
    setDragOffset({
      x: mouseX - clusterX,
      y: mouseY - clusterY
    });
    
    // Select the first comment in the cluster
    if (commentIds.length > 0) {
      onCommentSelect(commentIds[0]);
    }
  };

  // Handle cluster hover
  const handleClusterHover = (commentIds) => {
    if (commentIds) {
      // We're hovering over a cluster
      setHoveredClusterId(commentIds.join('-'));
    } else {
      // We've left the cluster
      setHoveredClusterId(null);
    }
  };

  // Close thread view
  const handleCloseThread = () => {
    setShowingThread(false);
    setClusterCommentIds([]);
    onCommentSelect(null);
  };
  
  // Handle editing a comment from thread view
  const handleEditCommentFromThread = (commentId) => {
    setShowingThread(false);
    onCommentSelect(commentId);
    onCommentExpand(commentId);
    if (onCommentEdit) {
      onCommentEdit(commentId);
    }
  };
  
  // Start linking mode
  const handleStartLinking = (commentId) => {
    setLinkingMode(true);
    setLinkingSourceId(commentId);
    
    // Close any open comment bubble
    onCommentExpand(null);
  };
  
  // Cancel linking mode
  const handleCancelLinking = () => {
    setLinkingMode(false);
    setLinkingSourceId(null);
  };
  
  // Create a link between comments
  const handleCreateLink = async (sourceId, targetId) => {
    // Get the source comment
    const sourceComment = comments.find(c => c.id === sourceId);
    if (!sourceComment) return;
    
    // Add link to target if it doesn't already exist
    const links = sourceComment.links || [];
    if (!links.includes(targetId)) {
      const updatedComment = {
        ...sourceComment,
        links: [...links, targetId]
      };
      
      // Save to Firebase first
      await commentService.saveComment(updatedComment);
      
      // Then update local state
      setComments(prevComments => {
        return prevComments.map(comment => {
          if (comment.id === sourceId) {
            return updatedComment;
          }
          return comment;
        });
      });
    }
    
    // Exit linking mode after creating the link
    setLinkingMode(false);
    setLinkingSourceId(null);
  };
  
  // Remove a link between comments
  const handleRemoveLink = async (sourceId, targetId) => {
    // Get the source comment
    const sourceComment = comments.find(c => c.id === sourceId);
    if (!sourceComment || !sourceComment.links) return;
    
    // Remove link to target
    const updatedComment = {
      ...sourceComment,
      links: sourceComment.links.filter(id => id !== targetId)
    };
    
    // Save to Firebase first
    await commentService.saveComment(updatedComment);
    
    // Then update local state
    setComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id === sourceId) {
          return updatedComment;
        }
        return comment;
      });
    });
  };

  // Render link lines between comments
  const renderLinks = () => {
    // Don't render links if links are turned off
    if (!showLinks) return null;
    
    return links.map(link => {
      const sourceComment = comments.find(c => c.id === link.source);
      const targetComment = comments.find(c => c.id === link.target);
      
      if (!sourceComment || !targetComment) return null;
      
      // Skip links for comments that aren't visible due to clustering
      const commentToClusterMap = createCommentToClusterMap(clusters);
      const sourceClusterId = commentToClusterMap.get(sourceComment.id);
      const targetClusterId = commentToClusterMap.get(targetComment.id);
      
      // If either comment is in a non-singleton cluster that's not currently expanded, don't show link
      if (clusteringEnabled) {
        // For source comment
        if (sourceClusterId) {
          const sourceCluster = clusters.find(c => c.id === sourceClusterId);
          if (sourceCluster && sourceCluster.comments.length > 1) {
            // Skip if not in the current thread
            if (!showingThread || !clusterCommentIds.includes(sourceComment.id)) {
              return null;
            }
          }
        }
        
        // For target comment
        if (targetClusterId) {
          const targetCluster = clusters.find(c => c.id === targetClusterId);
          if (targetCluster && targetCluster.comments.length > 1) {
            // Skip if not in the current thread
            if (!showingThread || !clusterCommentIds.includes(targetComment.id)) {
              return null;
            }
          }
        }
      }
      
      // Calculate screen coordinates for source and target
      const sourceX = sourceComment.position.x * zoom + localPan.x;
      const sourceY = sourceComment.position.y * zoom + localPan.y;
      const targetX = targetComment.position.x * zoom + localPan.x;
      const targetY = targetComment.position.y * zoom + localPan.y;
      
      // Determine line color based on link type
      let strokeColor = "#777";
      if (sourceComment.type === targetComment.type) {
        // Same type links
        switch (sourceComment.type.toLowerCase()) {
          case 'technical': strokeColor = "#ff4136"; break;
          case 'conceptual': strokeColor = "#0074D9"; break;
          case 'details': strokeColor = "#2ECC40"; break;
          default: strokeColor = "#777";
        }
      } else {
        // Different type links
        strokeColor = "#9B59B6"; // Purple for mixed links
      }
      
      return (
        <svg 
          key={link.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2
          }}
        >
          <line
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
            stroke={strokeColor}
            strokeWidth={2}
            strokeDasharray="4"
            className="link-line"
          />
        </svg>
      );
    });
  };

  return (
    <div 
      ref={canvasRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : (mode === 'comment' ? 'crosshair' : 'default')
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={e => e.target === canvasRef.current && handleCanvasClick(e)}
      onDoubleClick={handleCanvasDoubleClick}
      onContextMenu={e => e.preventDefault()} // Prevent right-click menu
    >
      {/* Comment tags */}
      {visibleComments.map(comment => (
        <div
          key={comment.id}
          style={{
            position: 'absolute',
            left: `${comment.position.x * zoom + localPan.x}px`,
            top: `${comment.position.y * zoom + localPan.y}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'auto', // Enable events for comments
            cursor: draggedCommentId === comment.id ? 'grabbing' : 'grab',
            zIndex: 5
          }}
          data-tag-id={comment.id}
          onMouseDown={(e) => handleCommentDragStart(e, comment.id)}
          onClick={(e) => bubbleManager.handleCommentClick(e, comment.id)}
          onDoubleClick={(e) => bubbleManager.handleCommentDoubleClick(e, comment.id)}
          onMouseEnter={() => bubbleManager.handleCommentTagEnter(comment.id)}
          onMouseLeave={() => bubbleManager.handleCommentTagLeave(comment.id)}
        >
          <CommentTag
            comment={comment}
            isSelected={selectedCommentId === comment.id}
            onLinkClick={() => handleStartLinking(comment.id)}
            userProfile={userProfile}
            showLinkButton={showLinks}
          />
        </div>
      ))}
      
      {/* Non-singleton Clusters */}
      {clusteringEnabled && clusters.map(cluster => {
        // Only render clusters with multiple comments
        if (cluster.comments.length <= 1) return null;
        
        const clusterCommentIds = cluster.comments.map(c => c.id);
        const clusterId = clusterCommentIds.join('-');
        
        return (
          <CommentCluster
            key={cluster.id}
            comments={cluster.comments}
            position={cluster.position}
            zoom={zoom}
            pan={localPan}
            onSelect={handleClusterSelect}
            onHover={handleClusterHover}
            onDragStart={handleClusterDragStart}
            isSelected={selectedClusterId === cluster.id}
            isHovered={hoveredClusterId === clusterId}
          />
        );
      })}
      
      {/* Render links */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        {renderLinks()}
      </div>
      
      {/* Thread view for selected cluster */}
      {showingThread && threadComments.length > 0 && (
        <CommentThread
          comments={threadComments}
          position={threadPosition}
          zoom={zoom}
          pan={localPan}
          onClose={handleCloseThread}
          onEdit={handleEditCommentFromThread}
          onDelete={handleDeleteComment}
          onReactionChange={handleReactionChange}
          userProfile={userProfile}
        />
      )}
      
      {/* Render hover and expanded comment bubbles */}
      {bubbleManager.renderHoverBubbles()}
      {bubbleManager.renderExpandedBubble()}
      
      {/* Comment linking overlay when in linking mode */}
      {linkingMode && linkingSourceId && (
        <CommentLinking
          comments={comments}
          sourceCommentId={linkingSourceId}
          onLinkCreate={handleCreateLink}
          onLinkRemove={handleRemoveLink}
          onCancel={handleCancelLinking}
          zoomLevel={zoom}
          panOffset={localPan}
        />
      )}
      {/* Link visibility indicator */}
      {!showLinks && (
        <div className="link-visibility-indicator">
          Links are hidden. Click "Show Links" in the toolbar to display them.
        </div>
      )}
    </div>
  );
};

export default WhiteboardCanvas;