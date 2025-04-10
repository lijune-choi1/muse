// src/components/whiteboard/WhiteboardCanvas.jsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import CommentTag from '../common/CommentTag';
import CommentLinking from '../common/CommentLinking';
import CommentCluster from './CommentCluster';
import CommentThread from './CommentThread';
import commentService from '../common/CommentService';
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
  // Collaboration props
  collaborationEnabled = false,
  useCollaborativeComments = false,
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
  
  // Collaboration states
  const [localCursor, setLocalCursor] = useState({ x: 0, y: 0, visible: false });
  const [guestCursor, setGuestCursor] = useState({ x: 300, y: 200, visible: collaborationEnabled });
  const [guestActivity, setGuestActivity] = useState(null);
  const [isGuestPresent, setIsGuestPresent] = useState(false);

  // For simulating guest interactions
  const [guestCommentBeingEdited, setGuestCommentBeingEdited] = useState(null);
  const [guestPath, setGuestPath] = useState([]);
  const [isPlayingGuestPath, setIsPlayingGuestPath] = useState(false);
  const [pathPlaybackIndex, setPathPlaybackIndex] = useState(0);
  
  // Clustering states
  const [clusters, setClusters] = useState([]);
  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [showingThread, setShowingThread] = useState(false);
  const [clusterCommentIds, setClusterCommentIds] = useState([]);

    // Add these state variables to your component
  const [draggedClusterIds, setDraggedClusterIds] = useState([]);
  const [hoveredClusterId, setHoveredClusterId] = useState(null);

  
  // Mock user profile - in a real app, this would come from auth context
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
  
  // Initialize the comment bubble manager
  const bubbleManager = CommentBubbleManager({
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
    userProfile,
    guestProfile
  });

  // Initialize guest presence
  useEffect(() => {
    if (collaborationEnabled) {
      setIsGuestPresent(true);
      setGuestCursor({ x: 300, y: 200, visible: true });
      
      // Simulate a guest cursor path
      const centerX = canvasDimensions.width / 2 || 400;
      const centerY = canvasDimensions.height / 2 || 300;
      const radius = 150;
      const newPath = [];
      
      // Create a circular path with timestamps
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        newPath.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          timestamp: Date.now() + (i * 30) // 30ms between points
        });
      }
      
      setGuestPath(newPath);
    }
  }, [collaborationEnabled, canvasDimensions.width, canvasDimensions.height]);

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

  // Update the useEffect for document-level event listeners
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
        setComments(prevComments => 
          prevComments.map(comment => {
            if (draggedClusterIds.includes(comment.id)) {
              // Move each comment by the same displacement
              return {
                ...comment,
                position: {
                  x: comment.position.x + dx,
                  y: comment.position.y + dy
                }
              };
            }
            return comment;
          })
        );
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


  // Guest cursor simulation
  useEffect(() => {
    if (!collaborationEnabled || !isGuestPresent || guestPath.length === 0) return;
    
    // After 3 seconds, start moving the guest cursor along a path
    const timer = setTimeout(() => {
      setIsPlayingGuestPath(true);
      setPathPlaybackIndex(0);
      setGuestActivity('Guest is viewing the whiteboard...');
      
      setTimeout(() => {
        setGuestActivity(null);
      }, 3000);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [collaborationEnabled, isGuestPresent, guestPath]);
  
  // Guest cursor path playback
  useEffect(() => {
    if (!isPlayingGuestPath || guestPath.length === 0) return;
    
    let playbackTimer = null;
    
    const playNext = () => {
      if (pathPlaybackIndex >= guestPath.length) {
        setIsPlayingGuestPath(false);
        
        // After path is finished, simulate the guest adding a comment
        setTimeout(() => {
          if (Math.random() > 0.5) {
            simulateGuestAddingComment();
          } else {
            // Start the path again
            setIsPlayingGuestPath(true);
            setPathPlaybackIndex(0);
          }
        }, 2000);
        return;
      }
      
      // Update guest cursor position
      setGuestCursor({ 
        ...guestPath[pathPlaybackIndex],
        visible: true 
      });
      
      // Calculate delay until next position
      let delay = 16; // Default to ~60fps
      if (pathPlaybackIndex < guestPath.length - 1) {
        const currentTime = guestPath[pathPlaybackIndex].timestamp;
        const nextTime = guestPath[pathPlaybackIndex + 1].timestamp;
        delay = nextTime - currentTime;
      }
      
      // Schedule next position update
      setPathPlaybackIndex(prev => prev + 1);
      playbackTimer = setTimeout(playNext, delay);
    };
    
    // Start playback
    playNext();
    
    return () => {
      clearTimeout(playbackTimer);
    };
  }, [isPlayingGuestPath, pathPlaybackIndex, guestPath]);

  // Simulate guest adding a comment
  const simulateGuestAddingComment = () => {
    // Get the current guest cursor position
    const x = (guestCursor.x - localPan.x) / zoom;
    const y = (guestCursor.y - localPan.y) / zoom;
    
    setGuestActivity('Guest is adding a comment...');
    
    // After a short delay, create the comment
    setTimeout(() => {
      const newComment = {
        id: `guest-comment-${Date.now()}`,
        position: { x, y },
        type: ['technical', 'conceptual', 'details'][Math.floor(Math.random() * 3)],
        text: 'This area needs attention',
        reactions: { agreed: 0, disagreed: 0 },
        replies: [],
        links: [],
        points: 1,
        author: 'Guest User',
        guestCreated: true
      };
      
      setComments(prev => [...prev, newComment]);
      commentService.saveComment(newComment);
      
      setGuestCommentBeingEdited(newComment.id);
      setGuestActivity('Guest is editing their comment...');
      
      // After another delay, update the comment
      setTimeout(() => {
        setComments(prev => 
          prev.map(comment => 
            comment.id === newComment.id 
              ? { ...comment, text: 'I think we should review this part of the design in more detail.' } 
              : comment
          )
        );
        
        commentService.updateCommentContent(
          newComment.id, 
          'I think we should review this part of the design in more detail.'
        );
        
        setGuestActivity('Guest finished editing');
        setGuestCommentBeingEdited(null);
        
        // Clear status after a moment
        setTimeout(() => {
          setGuestActivity(null);
          
          // Return to path mode
          setTimeout(() => {
            setIsPlayingGuestPath(true);
            setPathPlaybackIndex(0);
          }, 2000);
        }, 2000);
      }, 4000);
    }, 2000);
  };

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
    // Update local cursor position for collaboration features
    if (collaborationEnabled && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setLocalCursor({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        visible: true
      });
    }
    
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // Update local pan state (properly through React state)
    setLocalPan(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseEnter = () => {
    if (collaborationEnabled) {
      setLocalCursor(prev => ({ ...prev, visible: true }));
    }
  };
  
  const handleMouseLeave = () => {
    if (collaborationEnabled) {
      setLocalCursor(prev => ({ ...prev, visible: false }));
    }
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
    
    // Simulate guest reaction to drag
    if (collaborationEnabled && isGuestPresent && comment.guestCreated) {
      setGuestActivity('Guest notices you moving their comment...');
      
      setTimeout(() => {
        setGuestActivity(null);
      }, 2000);
    }
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
      
      const newComment = {
        id: `comment-${Date.now()}`,
        position: { x, y },
        type: 'technical', // Default type
        text: '',
        reactions: { agreed: 0, disagreed: 0 },
        replies: [],
        links: [],
        points: 1
      };
      
      setComments(prev => [...prev, newComment]);
      commentService.saveComment(newComment);
      
      // Select and expand the new comment
      onCommentSelect(newComment.id);
      onCommentExpand(newComment.id);
      
      // Simulate guest reaction to new comment
      if (collaborationEnabled && isGuestPresent) {
        setGuestActivity('Guest sees your new comment...');
        
        // Move guest cursor to the new comment
        setGuestCursor({
          x: screenX + 50, // Offset to the right
          y: screenY - 30, // Offset upward
          visible: true
        });
        
        setTimeout(() => {
          setGuestActivity(null);
        }, 3000);
      }
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
    
    // Create a new comment
    const newComment = {
      id: `comment-${Date.now()}`,
      position: { x, y },
      type: 'technical', // Default type
      text: '',
      reactions: { agreed: 0, disagreed: 0 },
      replies: [],
      links: [],
      points: 1
    };
    
    setComments(prev => [...prev, newComment]);
    commentService.saveComment(newComment);
    
    // Select and expand the new comment
    onCommentSelect(newComment.id);
    onCommentExpand(newComment.id);
    
    // Prevent default browser behavior
    e.preventDefault();
  };
  
  // Handle content change
  function handleContentChange(commentId, newContent) {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, text: newContent } 
          : comment
      )
    );
    
    commentService.updateCommentContent(commentId, newContent);
    
    // Simulate guest reaction to content change
    if (collaborationEnabled && isGuestPresent) {
      const comment = comments.find(c => c.id === commentId);
      if (comment && comment.guestCreated) {
        setGuestActivity('Guest sees you editing their comment...');
        
        setTimeout(() => {
          setGuestActivity(null);
        }, 2000);
      }
    }
  }
  
  // Handle type change
  function handleTypeChange(commentId, newType) {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, type: newType } 
          : comment
      )
    );
    
    commentService.updateCommentType(commentId, newType);
  }
  
  // Handle comment deletion
  function handleDeleteComment(commentId) {
    // Check if it's a guest comment
    const isGuestComment = comments.find(c => c.id === commentId)?.guestCreated;
    
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
    
    commentService.deleteComment(commentId);
    
    // Clear selection if deleted comment was selected
    if (selectedCommentId === commentId) {
      onCommentSelect(null);
    }
    if (expandedCommentId === commentId) {
      onCommentExpand(null);
    }
    
    // Simulate guest reaction to deleting their comment
    if (collaborationEnabled && isGuestPresent && isGuestComment) {
      setGuestActivity('Guest noticed you deleted their comment!');
      
      setTimeout(() => {
        setGuestActivity(null);
      }, 3000);
    }
  }
  
  // Handle reaction change
  function handleReactionChange(commentId, reactionData) {
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
    
    commentService.updateCommentReactions(
      commentId, 
      reactionData.reactions, 
      reactionData.userReacted,
      userProfile.name // Use username as userId
    );
    
    // Simulate guest reacting to your reaction
    if (collaborationEnabled && isGuestPresent) {
      const comment = comments.find(c => c.id === commentId);
      if (comment && comment.guestCreated) {
        setTimeout(() => {
          setGuestActivity('Guest is reacting to your feedback...');
          
          setTimeout(() => {
            // Guest adds another reaction
            const newReactions = { ...reactionData.reactions };
            if (reactionData.userReacted === 'agreed') {
              // Guest also agrees
              newReactions.agreed++;
            } else {
              // Guest agrees even if you disagreed
              newReactions.agreed++;
            }
            
            setComments(prevComments => 
              prevComments.map(comment => 
                comment.id === commentId 
                  ? { 
                      ...comment, 
                      reactions: newReactions
                    } 
                  : comment
              )
            );
            
            setGuestActivity('Guest also reacted');
            
            setTimeout(() => {
              setGuestActivity(null);
            }, 2000);
          }, 2000);
        }, 1000);
      }
    }
  }
  
  // Handle reply adding
  function handleAddReply(commentId, reply, updatedReplies) {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: updatedReplies } 
          : comment
      )
    );
    
    commentService.addReply(commentId, reply);
    
    // Simulate guest replying to your reply
    if (collaborationEnabled && isGuestPresent) {
      const comment = comments.find(c => c.id === commentId);
      if (comment && comment.guestCreated) {
        setTimeout(() => {
          setGuestActivity('Guest is typing a reply...');
          
          setTimeout(() => {
            const guestReply = {
              id: `reply-guest-${Date.now()}`,
              author: 'Guest User',
              avatar: guestProfile.avatar,
              content: 'Thanks for your input! I\'ll take that into consideration.',
              timestamp: new Date().toISOString()
            };
            
            const updatedRepliesWithGuest = [...updatedReplies, guestReply];
            
            setComments(prevComments => 
              prevComments.map(comment => 
                comment.id === commentId 
                  ? { ...comment, replies: updatedRepliesWithGuest } 
                  : comment
              )
            );
            
            commentService.addReply(commentId, guestReply);
            
            setGuestActivity(null);
          }, 3000);
        }, 2000);
      }
    }
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
  
  // Add this function to handle cluster drag start
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
    x: clusterX - mouseX,
    y: clusterY - mouseY
  });
  
  // Select the first comment in the cluster
  if (commentIds.length > 0) {
    onCommentSelect(commentIds[0]);
  }
};

// Add a handler for cluster hover
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
  const handleCreateLink = (sourceId, targetId) => {
    setComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id === sourceId) {
          // Add link to target if it doesn't already exist
          const links = comment.links || [];
          if (!links.includes(targetId)) {
            return {
              ...comment,
              links: [...links, targetId]
            };
          }
        }
        return comment;
      });
    });
    
    // Exit linking mode after creating the link
    setLinkingMode(false);
    setLinkingSourceId(null);
  };
  
  // Remove a link between comments
  const handleRemoveLink = (sourceId, targetId) => {
    setComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id === sourceId && comment.links) {
          // Remove link to target
          return {
            ...comment,
            links: comment.links.filter(id => id !== targetId)
          };
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
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
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
          isBeingEdited={guestCommentBeingEdited === comment.id}
          onLinkClick={() => handleStartLinking(comment.id)}
          userProfile={comment.guestCreated ? guestProfile : userProfile}
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
    
    {/* Collaborative features */}
    {collaborationEnabled && (
      <>
        {/* Local user cursor */}
        {localCursor.visible && (
          <div 
            style={{
              position: 'absolute',
              left: localCursor.x,
              top: localCursor.y,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#FF5733', // Orange-red for local cursor
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 9999
            }}
          />
        )}
        
        {/* Guest cursor */}
        {guestCursor.visible && isGuestPresent && (
          <div 
            style={{
              position: 'absolute',
              left: guestCursor.x,
              top: guestCursor.y,
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: '#3498DB', // Blue for guest cursor
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 9999,
              boxShadow: '0 0 0 2px white',
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div style={{
              position: 'absolute',
              left: 20,
              top: 0,
              backgroundColor: 'rgba(52, 152, 219, 0.8)',
              padding: '3px 6px',
              borderRadius: 3,
              fontSize: 12,
              color: 'white',
              whiteSpace: 'nowrap'
            }}>
              Guest User
            </div>
          </div>
        )}
        
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
        
        {/* Guest presence indicator */}
        {isGuestPresent && (
          <div style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: 'rgba(52, 152, 219, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#2ecc71',
              marginRight: '8px',
              animation: 'pulse 2s infinite'
            }}></div>
            Guest User is online
          </div>
        )}
      </>
    )}
    
    {/* Link visibility indicator */}
    {!showLinks && (
      <div className="link-visibility-indicator">
        Links are hidden. Click "Show Links" in the toolbar to display them.
      </div>
    )}
    
    {/* CSS animations */}
    <style jsx>{`
      @keyframes pulse {
        0% { opacity: 0.4; }
        50% { opacity: 1; }
        100% { opacity: 0.4; }
      }
    `}</style>
  </div>
);
};

export default WhiteboardCanvas;