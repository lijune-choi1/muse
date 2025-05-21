// src/components/whiteboard/CursorManager.jsx
import React, { useState, useEffect } from 'react';
import UserCursor from './UserCursor';
import { db } from '../../services/firebase'; // or whatever you're exporting

import { collection, doc, onSnapshot, setDoc, updateDoc, deleteField, serverTimestamp, query, where } from 'firebase/firestore';

const CursorManager = ({ 
  designId, 
  currentUser, 
  canvasRef, 
  enabled = true 
}) => {
  const [cursors, setCursors] = useState({});
  const [localPosition, setLocalPosition] = useState({ x: 0, y: 0 });
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  // Set colors for different users
  const cursorColors = [
    '#4285F4', // Google Blue
    '#EA4335', // Google Red
    '#FBBC05', // Google Yellow
    '#34A853', // Google Green
    '#9C27B0', // Purple
    '#00BCD4', // Cyan
    '#FF9800', // Orange
    '#795548', // Brown
  ];
  
  // Generate a stable color based on user ID
  const getUserColor = (userId) => {
    if (!userId) return cursorColors[0];
    
    // Calculate a numeric hash of the user ID
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Use absolute value and modulo to get color index
    const colorIndex = Math.abs(hash) % cursorColors.length;
    return cursorColors[colorIndex];
  };

  // Subscribe to cursor updates from Firestore
  useEffect(() => {
    if (!enabled || !designId || !currentUser?.uid) return;
    
    // Create a reference to the cursors collection for this design
    const cursorsRef = collection(db, 'designs', designId, 'cursors');
    
    // Subscribe to all cursors except our own
    const otherCursorsQuery = query(cursorsRef, where('userId', '!=', currentUser.uid));
    
    const unsubscribe = onSnapshot(otherCursorsQuery, (snapshot) => {
      const cursorData = {};
      
      snapshot.forEach(doc => {
        // Ignore stale cursor data (older than 5 minutes)
        const cursorInfo = doc.data();
        const timestamp = cursorInfo.timestamp?.toDate?.() || new Date();
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        
        if (timestamp > fiveMinutesAgo) {
          cursorData[doc.id] = {
            ...cursorInfo,
            color: getUserColor(cursorInfo.userId)
          };
        }
      });
      
      setCursors(cursorData);
      
      if (isFirstLoad) {
        setIsFirstLoad(false);
      }
    }, (error) => {
      console.error("Error fetching cursors:", error);
    });
    
    return () => unsubscribe();
  }, [designId, currentUser?.uid, enabled, isFirstLoad]);

  // Update cursor position on mouse move
  useEffect(() => {
    if (!enabled || !designId || !currentUser?.uid || !canvasRef?.current) return;
    
    let throttleTimeout = null;
    let lastPosition = { x: 0, y: 0 };
    
    const handleMouseMove = (e) => {
      if (throttleTimeout) return;
      
      // Calculate position relative to canvas
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Only update if position changed significantly
      const distance = Math.sqrt(
        Math.pow(x - lastPosition.x, 2) + 
        Math.pow(y - lastPosition.y, 2)
      );
      
      if (distance > 5) {
        lastPosition = { x, y };
        setLocalPosition({ x, y });
        
        // Update cursor position in Firestore (throttled)
        const cursorRef = doc(db, 'designs', designId, 'cursors', currentUser.uid);
        setDoc(cursorRef, {
          position: { x, y },
          userId: currentUser.uid,
          name: currentUser.displayName || currentUser.email || 'Anonymous',
          avatar: currentUser.photoURL || null,
          timestamp: serverTimestamp(),
          isTyping: isTyping
        }, { merge: true });
        
        // Throttle updates to reduce Firestore writes
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 50); // 50ms throttle (20 updates per second max)
      }
    };
    
    // Handle mouse leaving the canvas
    const handleMouseLeave = () => {
      const cursorRef = doc(db, 'designs', designId, 'cursors', currentUser.uid);
      updateDoc(cursorRef, {
        isActive: false,
        timestamp: serverTimestamp()
      });
    };
    
    // Handle mouse entering the canvas
    const handleMouseEnter = () => {
      const cursorRef = doc(db, 'designs', designId, 'cursors', currentUser.uid);
      updateDoc(cursorRef, {
        isActive: true,
        timestamp: serverTimestamp()
      });
    };
    
    // Add event listeners
    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('mouseleave', handleMouseLeave);
    canvasRef.current.addEventListener('mouseenter', handleMouseEnter);
    
    // Set initial cursor on component mount
    const initCursor = async () => {
      const cursorRef = doc(db, 'designs', designId, 'cursors', currentUser.uid);
      await setDoc(cursorRef, {
        position: { x: 0, y: 0 },
        userId: currentUser.uid,
        name: currentUser.displayName || currentUser.email || 'Anonymous',
        avatar: currentUser.photoURL || null,
        timestamp: serverTimestamp(),
        isActive: true,
        isTyping: false
      }, { merge: true });
    };
    
    initCursor();
    
    // Cleanup
    return () => {
      canvasRef.current?.removeEventListener('mousemove', handleMouseMove);
      canvasRef.current?.removeEventListener('mouseleave', handleMouseLeave);
      canvasRef.current?.removeEventListener('mouseenter', handleMouseEnter);
      
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
      
      // Remove cursor when component unmounts
      if (designId && currentUser?.uid) {
        const cursorRef = doc(db, 'designs', designId, 'cursors', currentUser.uid);
        updateDoc(cursorRef, {
          isActive: deleteField(),
          timestamp: serverTimestamp()
        }).catch(error => {
          console.error("Error removing cursor:", error);
        });
      }
    };
  }, [designId, currentUser, canvasRef, enabled, isTyping]);

  // Update typing status
  useEffect(() => {
    if (!enabled || !designId || !currentUser?.uid) return;
    
    // Update typing status in Firestore whenever it changes
    const cursorRef = doc(db, 'designs', designId, 'cursors', currentUser.uid);
    updateDoc(cursorRef, {
      isTyping: isTyping,
      timestamp: serverTimestamp()
    }).catch(error => {
      console.error("Error updating typing status:", error);
    });
  }, [isTyping, designId, currentUser?.uid, enabled]);

  // Set typing status when user is editing a comment
  const setTypingStatus = (isUserTyping) => {
    setIsTyping(isUserTyping);
  };

  // Render all other users' cursors
  return (
    <>
      {Object.entries(cursors).map(([userId, cursorData]) => (
        <UserCursor
          key={userId}
          position={cursorData.position}
          user={{
            name: cursorData.name,
            avatar: cursorData.avatar,
            id: cursorData.userId
          }}
          color={cursorData.color}
          isActive={cursorData.isActive !== false}
          isTyping={cursorData.isTyping === true}
        />
      ))}
    </>
  );
};

export default CursorManager;