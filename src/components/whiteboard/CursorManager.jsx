// src/components/whiteboard/CursorManager.jsx
import React, { useState, useEffect, useRef } from 'react';
import firebase from '../../services/firebase'; // Import the firebase service module
import { getDatabase, ref, onValue, set, onDisconnect } from 'firebase/database';

// Get a reference to the database
const db = getDatabase(firebase.app);

/**
 * CursorManager component for real-time cursor tracking
 * Enhanced with comment activity tracking and linking visualization
 */
const CursorManager = ({ 
  designId, 
  currentUser, 
  canvasRef, 
  enabled = true,
  onUserCountChange
}) => {
  const [cursors, setCursors] = useState({});
  const [userActivities, setUserActivities] = useState({});
  const [linkingActivities, setLinkingActivities] = useState([]);
  const [commentActivities, setCommentActivities] = useState([]);
  const cursorUpdateInterval = useRef(null);
  
  // Basic colors for cursor dots
  const cursorColors = [
    '#4285F4', // Google Blue
    '#EA4335', // Google Red
    '#FBBC05', // Google Yellow
    '#34A853', // Google Green
    '#8549ba', // Purple
    '#f50057', // Pink
    '#00acc1', // Cyan
    '#ff6d00', // Orange
  ];
  
  // Generate a random color for a user based on their ID
  const getUserColor = (userId) => {
    if (!userId) return cursorColors[0];
    
    // Generate a deterministic index based on userId
    const charSum = userId.split('').reduce(
      (sum, char) => sum + char.charCodeAt(0), 0
    );
    
    return cursorColors[charSum % cursorColors.length];
  };
  
  // Set up real-time cursor tracking
  useEffect(() => {
    if (!enabled || !designId || !currentUser || !canvasRef.current) return;
    
    const userId = currentUser.uid || 'anonymous-user';
    const userName = currentUser.displayName || currentUser.email || 'Anonymous';
    const userColor = getUserColor(userId);
    
    // Reference to the cursors node in Firebase
    const cursorsRef = ref(db, `whiteboards/${designId}/cursors`);
    const userCursorRef = ref(db, `whiteboards/${designId}/cursors/${userId}`);
    const userActivityRef = ref(db, `whiteboards/${designId}/activity/${userId}`);
    const commentActivitiesRef = ref(db, `whiteboards/${designId}/commentActivity`);
    const linkingActivitiesRef = ref(db, `whiteboards/${designId}/linkingActivity`);
    
    // Set up cursor position update on mouse move
    const handleMouseMove = (e) => {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update cursor position in Firebase
      set(userCursorRef, {
        x,
        y,
        userId,
        userName,
        color: userColor,
        timestamp: Date.now()
      });
    };
    
    // Set up activity statuses for the current user
    const setupUserPresence = () => {
      // Set initial user activity
      set(userActivityRef, {
        userId,
        userName,
        status: 'active',
        color: userColor,
        lastActive: Date.now()
      });
      
      // Remove the user data when they disconnect
      onDisconnect(userCursorRef).remove();
      onDisconnect(userActivityRef).update({
        status: 'offline',
        lastActive: Date.now()
      });
    };
    
    // Listen for cursor updates from all users
    const cursorListener = onValue(cursorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const cursorsData = snapshot.val();
        
        // Filter out old cursor positions (older than 10 seconds)
        const now = Date.now();
        const filteredCursors = {};
        
        Object.entries(cursorsData).forEach(([key, cursor]) => {
          if (now - cursor.timestamp < 10000 && key !== userId) {
            filteredCursors[key] = cursor;
          }
        });
        
        setCursors(filteredCursors);
        
        // Update user count if callback provided
        if (onUserCountChange) {
          onUserCountChange(Object.keys(filteredCursors).length + 1); // +1 for current user
        }
      } else {
        setCursors({});
        if (onUserCountChange) onUserCountChange(1); // Just the current user
      }
    });
    
    // Listen for user activity updates
    const activityListener = onValue(
      ref(db, `whiteboards/${designId}/activity`),
      (snapshot) => {
        if (snapshot.exists()) {
          setUserActivities(snapshot.val());
        } else {
          setUserActivities({});
        }
      }
    );
    
    // Listen for comment activities
    const commentActivityListener = onValue(commentActivitiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const activities = snapshot.val();
        
        // Filter out old activities (older than 5 seconds)
        const now = Date.now();
        const recentActivities = Object.values(activities).filter(
          activity => now - activity.timestamp < 5000
        );
        
        setCommentActivities(recentActivities);
        
        // Auto-cleanup old activities after 5 seconds
        recentActivities.forEach(activity => {
          if (now - activity.timestamp > 4800) {
            const activityRef = ref(
              db, 
              `whiteboards/${designId}/commentActivity/${activity.id}`
            );
            set(activityRef, null);
          }
        });
      } else {
        setCommentActivities([]);
      }
    });
    
    // Listen for linking activities
    const linkingActivityListener = onValue(linkingActivitiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const activities = snapshot.val();
        
        // Filter out old activities (older than 5 seconds)
        const now = Date.now();
        const recentActivities = Object.values(activities).filter(
          activity => now - activity.timestamp < 5000
        );
        
        setLinkingActivities(recentActivities);
        
        // Auto-cleanup old activities after 5 seconds
        recentActivities.forEach(activity => {
          if (now - activity.timestamp > 4800) {
            const activityRef = ref(
              db, 
              `whiteboards/${designId}/linkingActivity/${activity.id}`
            );
            set(activityRef, null);
          }
        });
      } else {
        setLinkingActivities([]);
      }
    });
    
    // Set up event listeners
    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    
    // Set initial user presence
    setupUserPresence();
    
    // Set up heartbeat for the user's active status
    cursorUpdateInterval.current = setInterval(() => {
      set(userActivityRef, {
        userId,
        userName,
        status: 'active',
        color: userColor,
        lastActive: Date.now()
      });
    }, 5000);
    
    // Clean up
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      
      // Clean up Firebase listeners
      cursorListener();
      activityListener();
      commentActivityListener();
      linkingActivityListener();
      
      // Clear heartbeat interval
      if (cursorUpdateInterval.current) {
        clearInterval(cursorUpdateInterval.current);
      }
      
      // Remove user cursor on unmount
      set(userCursorRef, null);
    };
  }, [enabled, designId, currentUser, canvasRef, onUserCountChange]);
  
  /**
   * Registers a new comment activity for real-time tracking
   * @param {Object} comment - The comment being added/edited
   * @param {string} activityType - Type of activity ('add', 'edit', 'delete')
   */
  const registerCommentActivity = (comment, activityType) => {
    if (!enabled || !designId || !currentUser) return;
    
    const userId = currentUser.uid || 'anonymous-user';
    const userName = currentUser.displayName || currentUser.email || 'Anonymous';
    const userColor = getUserColor(userId);
    
    const activityId = `comment-activity-${Date.now()}-${userId}`;
    const activityRef = ref(
      db, 
      `whiteboards/${designId}/commentActivity/${activityId}`
    );
    
    set(activityRef, {
      id: activityId,
      userId,
      userName,
      userColor,
      commentId: comment.id,
      position: comment.position,
      activityType,
      timestamp: Date.now()
    });
  };
  
  /**
   * Registers a new linking activity for real-time tracking
   * @param {string} sourceCommentId - The ID of source comment
   * @param {string} targetCommentId - The ID of target comment
   * @param {Object} sourcePosition - The position of source comment
   * @param {Object} targetPosition - The position of target comment
   */
  const registerLinkingActivity = (
    sourceCommentId, 
    targetCommentId,
    sourcePosition,
    targetPosition
  ) => {
    if (!enabled || !designId || !currentUser) return;
    
    const userId = currentUser.uid || 'anonymous-user';
    const userName = currentUser.displayName || currentUser.email || 'Anonymous';
    const userColor = getUserColor(userId);
    
    const activityId = `link-activity-${Date.now()}-${userId}`;
    const activityRef = ref(
      db, 
      `whiteboards/${designId}/linkingActivity/${activityId}`
    );
    
    set(activityRef, {
      id: activityId,
      userId,
      userName,
      userColor,
      sourceCommentId,
      targetCommentId,
      sourcePosition,
      targetPosition,
      timestamp: Date.now()
    });
  };
  
  return (
    <>
      {/* Render other users' cursors */}
      {enabled && Object.entries(cursors).map(([userId, cursor]) => (
        <div key={userId} style={{ position: 'absolute', zIndex: 1000, pointerEvents: 'none' }}>
          {/* Cursor dot */}
          <div
            className="cursor-dot"
            style={{
              left: `${cursor.x}px`,
              top: `${cursor.y}px`,
              backgroundColor: cursor.color || getUserColor(userId)
            }}
          />
          
          {/* User name label */}
          <div
            className="cursor-label"
            style={{
              left: `${cursor.x}px`,
              top: `${cursor.y}px`,
              backgroundColor: cursor.color || getUserColor(userId)
            }}
          >
            {cursor.userName}
          </div>
        </div>
      ))}
      
      {/* Render comment activities */}
      {enabled && commentActivities.map(activity => (
        <div 
          key={activity.id}
          className="comment-activity-indicator"
          style={{
            position: 'absolute',
            left: `${activity.position.x}px`,
            top: `${activity.position.y}px`,
            zIndex: 45,
            pointerEvents: 'none'
          }}
        >
          <div className="activity-pulse" style={{ borderColor: activity.userColor }} />
          <div className="activity-label" style={{ backgroundColor: activity.userColor }}>
            {activity.activityType === 'add' ? 'Added comment' : 
             activity.activityType === 'edit' ? 'Edited comment' : 
             'Deleted comment'} by {activity.userName}
          </div>
        </div>
      ))}
      
      {/* Render linking activities */}
      {enabled && linkingActivities.map(activity => (
        <svg
          key={activity.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 40
          }}
        >
          <defs>
            <marker
              id={`arrow-${activity.id}`}
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                fill={activity.userColor}
              />
            </marker>
          </defs>
          
          <line
            x1={activity.sourcePosition.x}
            y1={activity.sourcePosition.y}
            x2={activity.targetPosition.x}
            y2={activity.targetPosition.y}
            stroke={activity.userColor}
            strokeWidth="2"
            strokeDasharray="4"
            markerEnd={`url(#arrow-${activity.id})`}
            className="linking-activity-line"
          />
          
          <text
            x={(activity.sourcePosition.x + activity.targetPosition.x) / 2}
            y={(activity.sourcePosition.y + activity.targetPosition.y) / 2 - 10}
            fill={activity.userColor}
            fontSize="12"
            textAnchor="middle"
            className="linking-activity-text"
          >
            {activity.userName} linked comments
          </text>
        </svg>
      ))}
    </>
  );
};

// Export main component and activity registration functions
export default CursorManager;

// Export activity registration functions for use in other components
export const useCommentActivityTracking = () => {
  const registerCommentActivity = (comment, activityType) => {
    // Find the CursorManager instance and call its method
    const event = new CustomEvent('register-comment-activity', {
      detail: { comment, activityType }
    });
    window.dispatchEvent(event);
  };
  
  const registerLinkingActivity = (
    sourceCommentId, 
    targetCommentId,
    sourcePosition,
    targetPosition
  ) => {
    // Find the CursorManager instance and call its method
    const event = new CustomEvent('register-linking-activity', {
      detail: { 
        sourceCommentId, 
        targetCommentId,
        sourcePosition,
        targetPosition
      }
    });
    window.dispatchEvent(event);
  };
  
  return { registerCommentActivity, registerLinkingActivity };
};