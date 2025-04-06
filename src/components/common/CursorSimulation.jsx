// src/components/testing/CursorSimulation.jsx
import React, { useState, useEffect, useRef } from 'react';

const CURSOR_COLORS = {
  self: '#FF5733', // Orange-red for your cursor
  guest: '#3498DB', // Blue for simulated guest cursor
};

const CursorSimulation = ({ children }) => {
  const containerRef = useRef(null);
  const [selfCursor, setSelfCursor] = useState({ x: 0, y: 0, visible: false });
  const [guestCursor, setGuestCursor] = useState({ x: 200, y: 200, visible: true });
  const [isControllingGuest, setIsControllingGuest] = useState(false);
  const [guestPath, setGuestPath] = useState([]);
  const [isPlayingGuestPath, setIsPlayingGuestPath] = useState(false);
  const [pathPlaybackIndex, setPathPlaybackIndex] = useState(0);
  const [recordingPath, setRecordingPath] = useState(false);
  
  // Track mouse position
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isControllingGuest) {
      setGuestCursor({ x, y, visible: true });
      
      // Record path if recording is active
      if (recordingPath) {
        setGuestPath(prev => [...prev, { x, y, timestamp: Date.now() }]);
      }
    } else {
      setSelfCursor({ x, y, visible: true });
    }
  };
  
  // Handle mouse enter/leave
  const handleMouseEnter = () => {
    setSelfCursor(prev => ({ ...prev, visible: true }));
  };
  
  const handleMouseLeave = () => {
    setSelfCursor(prev => ({ ...prev, visible: false }));
  };
  
  // Toggle between controlling self or guest cursor
  const toggleCursorControl = () => {
    // Stop any active path playback or recording when switching control
    setIsPlayingGuestPath(false);
    setRecordingPath(false);
    setIsControllingGuest(prev => !prev);
  };
  
  // Start/stop recording guest cursor path
  const toggleRecording = () => {
    if (!recordingPath) {
      // Start new recording
      setGuestPath([]);
      setRecordingPath(true);
    } else {
      // Stop recording
      setRecordingPath(false);
    }
  };
  
  // Play back recorded path
  const playGuestPath = () => {
    if (guestPath.length === 0) return;
    
    setIsPlayingGuestPath(true);
    setPathPlaybackIndex(0);
  };
  
  // Stop path playback
  const stopGuestPath = () => {
    setIsPlayingGuestPath(false);
  };
  
  // Path playback effect
  useEffect(() => {
    if (!isPlayingGuestPath || guestPath.length === 0) return;
    
    let lastTimestamp = null;
    let playbackTimer = null;
    
    const playNext = () => {
      if (pathPlaybackIndex >= guestPath.length) {
        setIsPlayingGuestPath(false);
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
  
  // Add some predefined paths
  const useCirclePath = () => {
    const centerX = 400;
    const centerY = 300;
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
  };
  
  const useZigzagPath = () => {
    const startX = 200;
    const startY = 200;
    const newPath = [];
    
    // Create a zigzag path with timestamps
    for (let i = 0; i < 40; i++) {
      newPath.push({
        x: startX + (i * 10),
        y: startY + (i % 2 === 0 ? 0 : 100),
        timestamp: Date.now() + (i * 50) // 50ms between points
      });
    }
    
    setGuestPath(newPath);
  };
  
  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        cursor: isControllingGuest ? 'none' : undefined
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Self cursor */}
      {selfCursor.visible && !isControllingGuest && (
        <div 
          style={{
            position: 'absolute',
            left: selfCursor.x,
            top: selfCursor.y,
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: CURSOR_COLORS.self,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        />
      )}
      
      {/* Guest cursor */}
      {guestCursor.visible && (
        <div 
          style={{
            position: 'absolute',
            left: guestCursor.x,
            top: guestCursor.y,
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: CURSOR_COLORS.guest,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: '0 0 0 2px white',
            transition: isControllingGuest ? 'none' : 'transform 0.1s ease-out'
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
      
      {/* Controls overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #ddd',
          padding: 15,
          borderRadius: 8,
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }}>
          Cursor Simulation Controls
        </div>
        
        <button 
          onClick={toggleCursorControl}
          style={{
            padding: '8px 12px',
            backgroundColor: isControllingGuest ? CURSOR_COLORS.guest : CURSOR_COLORS.self,
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          {isControllingGuest ? 'Control Your Cursor' : 'Control Guest Cursor'}
        </button>
        
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={toggleRecording}
            disabled={!isControllingGuest || isPlayingGuestPath}
            style={{
              flex: 1,
              padding: '6px 10px',
              backgroundColor: recordingPath ? '#e74c3c' : '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: isControllingGuest ? 'pointer' : 'not-allowed',
              opacity: isControllingGuest ? 1 : 0.6
            }}
          >
            {recordingPath ? 'Stop Recording' : 'Record Path'}
          </button>
          
          <button 
            onClick={isPlayingGuestPath ? stopGuestPath : playGuestPath}
            disabled={guestPath.length === 0 || recordingPath}
            style={{
              flex: 1,
              padding: '6px 10px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: guestPath.length > 0 ? 'pointer' : 'not-allowed',
              opacity: guestPath.length > 0 ? 1 : 0.6
            }}
          >
            {isPlayingGuestPath ? 'Stop Playback' : 'Play Path'}
          </button>
        </div>
        
        <div style={{ fontSize: 12, marginTop: 5 }}>Preset Paths:</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={useCirclePath}
            style={{
              flex: 1,
              padding: '4px 8px',
              backgroundColor: '#9b59b6',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 12
            }}
          >
            Circle
          </button>
          
          <button 
            onClick={useZigzagPath}
            style={{
              flex: 1,
              padding: '4px 8px',
              backgroundColor: '#f39c12',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 12
            }}
          >
            Zigzag
          </button>
        </div>
        
        <div style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
          {isControllingGuest ? 'You are controlling the guest cursor' : 'You are controlling your cursor'}
          <br />
          {recordingPath && 'Recording in progress...'}
          {isPlayingGuestPath && 'Playing guest path...'}
        </div>
      </div>
    </div>
  );
};

export default CursorSimulation;