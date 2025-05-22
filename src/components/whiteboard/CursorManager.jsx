// src/components/whiteboard/CursorManager.jsx
import React, { useState, useEffect, useRef } from 'react';
import firebase from '../../services/firebase';
import { getDatabase, ref, onValue, set, onDisconnect, push } from 'firebase/database';
import UserCursor from './UserCursor';

/**
 * CursorManager component for real-time cursor tracking
 * Enhanced with comment activity tracking and linking visualization
 */
const CursorManager = ({ 
  designId, 
  currentUser, 
  canvasRef, 
  enabled = true,
  onUserCountChange,
  onRegisterMethods // New prop to pass methods back to parent
}) => {
  const [cursors, setCursors] = useState({});
  const [userActivities, setUserActivities] = useState({});
  const [linkingActivities, setLinkingActivities] = useState([]);
  const [commentActivities, setCommentActivities] = useState([]);
  const cursorUpdateInterval = useRef(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const dbRef = useRef(null);
  const isMouseOverCanvas = useRef(false);
  
  // Initialize database reference
  useEffect(() => {
    try {
      dbRef.current = getDatabase(firebase.app);
      console.log('Firebase database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase database:', error);
    }
  }, []);
  
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
  
  // Generate a deterministic color for a user based on their ID
  const getUserColor = (userId) => {
    if (!userId) return cursorColors[0];
    
    const charSum = userId.split('').reduce(
      (sum, char) => sum + char.charCodeAt(0), 0
    );
    
    return cursorColors[charSum % cursorColors.length];
  };
  
  /**
   * Registers a new comment activity for real-time tracking
   */
  const registerCommentActivity = (comment, activityType) => {
    if (!enabled || !designId || !currentUser || !dbRef.current) return;
    
    const userId = currentUser.uid || currentUser.id || 'anonymous-user';
    const userName = currentUser.displayName || currentUser.email || 'Anonymous';
    const userColor = getUserColor(userId);
    
    console.log('CursorManager - Registering comment activity:', { activityType, commentId: comment.id });
    
    const activityRef = push(ref(dbRef.current, `whiteboards/${designId}/commentActivity`));
    
    set(activityRef, {
      id: activityRef.key,
      userId,
      userName,
      userColor,
      commentId: comment.id,
      position: comment.position,
      activityType,
      timestamp: Date.now()
    }).then(() => {
      console.log('Comment activity registered successfully');
    }).catch(error => {
      console.error('Failed to register comment activity:', error);
    });
  };
  
  /**
   * Registers a new linking activity for real-time tracking
   */
  const registerLinkingActivity = (
    sourceCommentId, 
    targetCommentId,
    sourcePosition,
    targetPosition
  ) => {
    if (!enabled || !designId || !currentUser || !dbRef.current) return;
    
    const userId = currentUser.uid || currentUser.id || 'anonymous-user';
    const userName = currentUser.displayName || currentUser.email || 'Anonymous';
    const userColor = getUserColor(userId);
    
    console.log('CursorManager - Registering linking activity:', { sourceCommentId, targetCommentId });
    
    const activityRef = push(ref(dbRef.current, `whiteboards/${designId}/linkingActivity`));
    
    set(activityRef, {
      id: activityRef.key,
      userId,
      userName,
      userColor,
      sourceCommentId,
      targetCommentId,
      sourcePosition,
      targetPosition,
      timestamp: Date.now()
    }).then(() => {
      console.log('Linking activity registered successfully');
    }).catch(error => {
      console.error('Failed to register linking activity:', error);
    });
  };
  
  // Pass methods to parent component via callback
  useEffect(() => {
    if (onRegisterMethods) {
      onRegisterMethods({
        registerCommentActivity,
        registerLinkingActivity
      });
    }
  }, [onRegisterMethods]);
  
  // Throttled cursor update function
  const throttledCursorUpdate = useRef(null);
  
  // Set up real-time cursor tracking
  useEffect(() => {
    if (!enabled || !designId || !currentUser || !canvasRef.current || !dbRef.current) {
      console.log('CursorManager setup skipped:', {
        enabled,
        designId: !!designId,
        currentUser: !!currentUser,
        canvasRef: !!canvasRef.current,
        dbRef: !!dbRef.current
      });
      return;
    }
    
    const userId = currentUser.uid || currentUser.id || 'anonymous-user';
    const userName = currentUser.displayName || currentUser.email || 'Anonymous';
    const userColor = getUserColor(userId);
    
    console.log('Setting up cursor tracking for user:', { userId, userName, userColor });
    
    // Firebase references
    const cursorsRef = ref(dbRef.current, `whiteboards/${designId}/cursors`);
    const userCursorRef = ref(dbRef.current, `whiteboards/${designId}/cursors/${userId}`);
    const userActivityRef = ref(dbRef.current, `whiteboards/${designId}/activity/${userId}`);
    const commentActivitiesRef = ref(dbRef.current, `whiteboards/${designId}/commentActivity`);
    const linkingActivitiesRef = ref(dbRef.current, `whiteboards/${designId}/linkingActivity`);
    
    // Throttled cursor position update
    const updateCursorPosition = (x, y) => {
      if (!dbRef.current) return;
      
      // Only update if position actually changed significantly
      if (Math.abs(lastMousePosition.current.x - x) < 3 && 
          Math.abs(lastMousePosition.current.y - y) < 3) {
        return;
      }
      
      lastMousePosition.current = { x, y };
      
      const cursorData = {
        x,
        y,
        userId,
        userName,
        color: userColor,
        avatar: currentUser.photoURL || null,
        timestamp: Date.now(),
        isActive: true,
        isOnPage: true,
        isOverCanvas: isMouseOverCanvas.current
      };
      
      set(userCursorRef, cursorData).catch(error => {
        console.error('Failed to update cursor position:', error);
      });
    };
    
    // Throttle cursor updates to 30fps for better performance
    throttledCursorUpdate.current = (x, y) => {
      clearTimeout(throttledCursorUpdate.current.timeoutId);
      throttledCursorUpdate.current.timeoutId = setTimeout(() => {
        updateCursorPosition(x, y);
      }, 33); // ~30fps
    };
    
    // Set up cursor position update on mouse move
    const handleMouseMove = (e) => {
      if (!canvasRef.current || !dbRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      throttledCursorUpdate.current(x, y);
    };
    
    // Handle mouse enter/leave for activity tracking
    const handleMouseEnter = () => {
      isMouseOverCanvas.current = true;
      console.log('Mouse entered canvas');
      
      // Update cursor to show mouse is over canvas
      if (dbRef.current && lastMousePosition.current.x !== undefined) {
        set(userCursorRef, {
          x: lastMousePosition.current.x,
          y: lastMousePosition.current.y,
          userId,
          userName,
          color: userColor,
          avatar: currentUser.photoURL || null,
          timestamp: Date.now(),
          isActive: true,
          isOnPage: true,
          isOverCanvas: true
        }).catch(error => {
          console.error('Failed to update cursor on mouse enter:', error);
        });
      }
    };
    
    const handleMouseLeave = () => {
      isMouseOverCanvas.current = false;
      console.log('Mouse left canvas');
      
      // Keep cursor visible but mark as not over canvas
      if (dbRef.current && lastMousePosition.current.x !== undefined) {
        set(userCursorRef, {
          x: lastMousePosition.current.x,
          y: lastMousePosition.current.y,
          userId,
          userName,
          color: userColor,
          avatar: currentUser.photoURL || null,
          timestamp: Date.now(),
          isActive: true, // Still active on page
          isOnPage: true,
          isOverCanvas: false
        }).catch(error => {
          console.error('Failed to update cursor on mouse leave:', error);
        });
      }
    };
    
    // Set up user presence
    const setupUserPresence = async () => {
      try {
        await set(userActivityRef, {
          userId,
          userName,
          status: 'active',
          color: userColor,
          avatar: currentUser.photoURL || null,
          lastActive: Date.now()
        });
        
        // Set initial cursor presence (even without mouse movement)
        await set(userCursorRef, {
          x: 0, // Default position
          y: 0,
          userId,
          userName,
          color: userColor,
          avatar: currentUser.photoURL || null,
          timestamp: Date.now(),
          isActive: true,
          isOnPage: true,
          isOverCanvas: false
        });
        
        console.log('User presence set up successfully');
        
        // Set up disconnect handlers
        onDisconnect(userCursorRef).remove();
        onDisconnect(userActivityRef).update({
          status: 'offline',
          lastActive: Date.now()
        });
        
        console.log('Disconnect handlers set up');
      } catch (error) {
        console.error('Failed to set up user presence:', error);
      }
    };
    
    // Listen for cursor updates from all users with real-time updates
    const cursorListener = onValue(cursorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const cursorsData = snapshot.val();
        console.log('Real-time cursor update received. Active users:', Object.keys(cursorsData));
        
        // Show all other users' cursors regardless of last movement time
        // Only filter out the current user
        const filteredCursors = {};
        
        Object.entries(cursorsData).forEach(([key, cursor]) => {
          // Keep all cursors except current user's
          if (cursor && key !== userId) {
            filteredCursors[key] = cursor;
          }
        });
        
        console.log('Filtered active cursors:', Object.keys(filteredCursors));
        setCursors(filteredCursors);
        
        // Update user count based on all users (including current user)
        if (onUserCountChange) {
          const totalUsers = Object.keys(cursorsData).length;
          onUserCountChange(totalUsers);
          console.log('Total active users:', totalUsers);
        }
      } else {
        console.log('No cursor data found');
        setCursors({});
        if (onUserCountChange) onUserCountChange(1);
      }
    }, (error) => {
      console.error('Error listening to cursor updates:', error);
    });
    
    // Listen for user activity updates
    const activityListener = onValue(
      ref(dbRef.current, `whiteboards/${designId}/activity`),
      (snapshot) => {
        if (snapshot.exists()) {
          setUserActivities(snapshot.val());
        } else {
          setUserActivities({});
        }
      },
      (error) => {
        console.error('Error listening to activity updates:', error);
      }
    );
    
    // Listen for comment activities with real-time updates
    const commentActivityListener = onValue(commentActivitiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const activities = snapshot.val();
        console.log('Comment activities received:', Object.keys(activities));
        
        const now = Date.now();
        const recentActivities = Object.values(activities).filter(
          activity => now - activity.timestamp < 8000 // Show for 8 seconds
        );
        
        console.log('Recent comment activities:', recentActivities.length);
        setCommentActivities(recentActivities);
        
        // Clean up old activities
        Object.entries(activities).forEach(([key, activity]) => {
          if (now - activity.timestamp > 7000) {
            const activityRef = ref(dbRef.current, `whiteboards/${designId}/commentActivity/${key}`);
            set(activityRef, null).catch(console.error);
          }
        });
      } else {
        setCommentActivities([]);
      }
    }, (error) => {
      console.error('Error listening to comment activities:', error);
    });
    
    // Listen for linking activities with real-time updates
    const linkingActivityListener = onValue(linkingActivitiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const activities = snapshot.val();
        console.log('Linking activities received:', Object.keys(activities));
        
        const now = Date.now();
        const recentActivities = Object.values(activities).filter(
          activity => now - activity.timestamp < 8000 // Show for 8 seconds
        );
        
        console.log('Recent linking activities:', recentActivities.length);
        setLinkingActivities(recentActivities);
        
        // Clean up old activities
        Object.entries(activities).forEach(([key, activity]) => {
          if (now - activity.timestamp > 7000) {
            const activityRef = ref(dbRef.current, `whiteboards/${designId}/linkingActivity/${key}`);
            set(activityRef, null).catch(console.error);
          }
        });
      } else {
        setLinkingActivities([]);
      }
    }, (error) => {
      console.error('Error listening to linking activities:', error);
    });
    
    // Set up event listeners
    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    // Set initial user presence
    setupUserPresence();
    
    // Set up heartbeat for user's active status and cursor presence
    cursorUpdateInterval.current = setInterval(() => {
      if (dbRef.current) {
        // Update activity status
        set(userActivityRef, {
          userId,
          userName,
          status: 'active',
          color: userColor,
          avatar: currentUser.photoURL || null,
          lastActive: Date.now()
        }).catch(error => {
          console.error('Failed to update heartbeat:', error);
        });
        
        // Keep cursor visible with last known position
        if (lastMousePosition.current.x !== undefined) {
          set(userCursorRef, {
            x: lastMousePosition.current.x,
            y: lastMousePosition.current.y,
            userId,
            userName,
            color: userColor,
            avatar: currentUser.photoURL || null,
            timestamp: Date.now(),
            isActive: true, // Always keep active as long as user is on page
            isOnPage: true
          }).catch(error => {
            console.error('Failed to update cursor heartbeat:', error);
          });
        }
      }
    }, 5000); // Every 5 seconds
    
    // Cleanup function
    return () => {
      console.log('Cleaning up cursor manager');
      
      // Clear timeouts
      if (throttledCursorUpdate.current?.timeoutId) {
        clearTimeout(throttledCursorUpdate.current.timeoutId);
      }
      
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseenter', handleMouseEnter);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      
      // Clean up Firebase listeners
      if (cursorListener) cursorListener();
      if (activityListener) activityListener();
      if (commentActivityListener) commentActivityListener();
      if (linkingActivityListener) linkingActivityListener();
      
      // Clear heartbeat interval
      if (cursorUpdateInterval.current) {
        clearInterval(cursorUpdateInterval.current);
      }
      
      // Remove user cursor on unmount
      if (dbRef.current) {
        set(userCursorRef, null).catch(error => {
          console.error('Failed to remove user cursor:', error);
        });
      }
    };
  }, [enabled, designId, currentUser, canvasRef, onUserCountChange]);
  
  return (
    <>
      {/* Render other users' cursors using the UserCursor component */}
      {enabled && Object.entries(cursors).map(([userId, cursor]) => (
        <UserCursor
          key={userId}
          position={{ x: cursor.x, y: cursor.y }}
          user={{
            id: userId,
            name: cursor.userName,
            avatar: cursor.avatar
          }}
          color={cursor.color || getUserColor(userId)}
          isActive={cursor.isOnPage !== false} // Show as active if user is on page
          isTyping={false} // Could be enhanced to track typing status
        />
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
            pointerEvents: 'none',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div 
            style={{ 
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: `3px solid ${activity.userColor}`,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              color: activity.userColor,
              animation: 'pulse 2s infinite',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
          >
            {activity.activityType === 'add' ? '+' : 
             activity.activityType === 'edit' ? '✎' : '×'}
          </div>
          
          <div 
            style={{ 
              position: 'absolute',
              top: '35px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: activity.userColor,
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          >
            {activity.activityType === 'add' ? 'Added' : 
             activity.activityType === 'edit' ? 'Edited' : 
             'Deleted'} by {activity.userName}
          </div>
        </div>
      ))}
      
      {/* Render linking activities */}
      {enabled && linkingActivities.map(activity => (
        <div key={activity.id} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 40 }}>
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            <defs>
              <marker
                id={`arrow-${activity.id}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="3"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path
                  d="M 0 0 L 10 3 L 0 6 z"
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
              strokeWidth="3"
              strokeDasharray="8 4"
              markerEnd={`url(#arrow-${activity.id})`}
              style={{
                animation: 'dashAnimation 2s linear infinite'
              }}
            />
            
            <text
              x={(activity.sourcePosition.x + activity.targetPosition.x) / 2}
              y={(activity.sourcePosition.y + activity.targetPosition.y) / 2 - 15}
              fill={activity.userColor}
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              style={{
                textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
                animation: 'fadeIn 0.5s ease-out'
              }}
            >
              {activity.userName} linked comments
            </text>
          </svg>
        </div>
      ))}
      
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes dashAnimation {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 24; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

// Export main component
export default CursorManager;

// Export activity registration functions for use in other components
export const useCommentActivityTracking = () => {
  const registerCommentActivity = (comment, activityType) => {
    console.log('useCommentActivityTracking - registerCommentActivity called:', { comment: comment.id, activityType });
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
    console.log('useCommentActivityTracking - registerLinkingActivity called:', { sourceCommentId, targetCommentId });
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