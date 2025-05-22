// src/components/whiteboard/AnnotationLayer.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import annotationService from '../../services/AnnotationService';

/**
 * AnnotationLayer component for drawing on the whiteboard
 * Enhanced with real-time collaboration and user attribution
 */
const AnnotationLayer = ({ 
  enabled = false, 
  zoom = 1, 
  pan = { x: 0, y: 0 }, 
  initialColor = '#ff0000', 
  initialStrokeWidth = 3,
  userProfile,
  designId,
  onSave,
  onClear,
  onAnnotationAdded
}) => {
  // Canvas state
  const canvasRef = useRef(null);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [strokeColor, setStrokeColor] = useState(initialColor);
  const [strokeWidth, setStrokeWidth] = useState(initialStrokeWidth);
  const [annotations, setAnnotations] = useState([]);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [otherUsersAnnotations, setOtherUsersAnnotations] = useState([]);
  
  // Available colors
  const colors = [
    '#ff0000', // Red
    '#0000ff', // Blue
    '#00cc00', // Green
    '#ffcc00', // Yellow
    '#ff6600', // Orange
    '#9900cc', // Purple
    '#000000', // Black
  ];
  
  // Load annotations from Firebase on component mount
  useEffect(() => {
    if (!designId || !userProfile?.id) return;
    
    const loadAnnotations = async () => {
      try {
        console.log('Loading annotations for design:', designId);
        const allAnnotations = await annotationService.getAnnotations(designId);
        
        console.log('Loaded annotations:', allAnnotations.length);
        
        if (allAnnotations && Array.isArray(allAnnotations) && allAnnotations.length > 0) {
          const userAnnotations = allAnnotations.filter(
            anno => anno.userId === userProfile.id
          );
          
          const othersAnnotations = allAnnotations.filter(
            anno => anno.userId !== userProfile.id
          );
          
          console.log(`User annotations: ${userAnnotations.length}, Other users: ${othersAnnotations.length}`);
          
          setAnnotations(userAnnotations);
          setOtherUsersAnnotations(othersAnnotations);
        } else {
          setAnnotations([]);
          setOtherUsersAnnotations([]);
        }
      } catch (error) {
        console.error('Error loading annotations:', error);
        setAnnotations([]);
        setOtherUsersAnnotations([]);
      }
    };
    
    loadAnnotations();
    
    // Listen for real-time changes
    const unsubscribe = annotationService.listenForAnnotationChanges(designId, (updatedAnnotations) => {
      console.log('Real-time annotation update:', updatedAnnotations.length);
      
      if (updatedAnnotations && Array.isArray(updatedAnnotations) && updatedAnnotations.length > 0) {
        const userAnnotations = updatedAnnotations.filter(
          anno => anno.userId === userProfile.id
        );
        
        const othersAnnotations = updatedAnnotations.filter(
          anno => anno.userId !== userProfile.id
        );
        
        setAnnotations(userAnnotations);
        setOtherUsersAnnotations(othersAnnotations);
      } else {
        setAnnotations([]);
        setOtherUsersAnnotations([]);
      }
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [designId, userProfile?.id]);
  
  // Set up canvas and draw annotations
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Always redraw annotations when canvas setup changes
    drawAllAnnotations();
  }, [enabled, zoom, pan, annotations, otherUsersAnnotations]);
  
  // Draw all annotations
  const drawAllAnnotations = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Don't draw if annotation mode is not enabled
    if (!enabled) return;
    
    // Save the current state
    ctx.save();
    
    // Apply transformations
    ctx.setTransform(zoom, 0, 0, zoom, pan.x, pan.y);
    
    console.log(`Drawing ${annotations.length} user annotations and ${otherUsersAnnotations.length} other user annotations`);
    
    // Draw user's annotations
    annotations.forEach((annotation, index) => {
      console.log(`Drawing user annotation ${index}:`, annotation.id, 'points:', annotation.points?.length);
      drawStroke(ctx, annotation, false);
    });
    
    // Draw other users' annotations
    otherUsersAnnotations.forEach((annotation, index) => {
      console.log(`Drawing other user annotation ${index}:`, annotation.id, 'by:', annotation.userName, 'points:', annotation.points?.length);
      drawStroke(ctx, annotation, true);
    });
    
    // Restore the state
    ctx.restore();
  };
  
  // Draw a single stroke
  const drawStroke = (ctx, stroke, isOtherUser = false) => {
    if (!stroke.points || stroke.points.length < 1) {
      console.log('Skipping stroke - no points:', stroke.id);
      return;
    }
    
    console.log(`Drawing stroke ${stroke.id} with ${stroke.points.length} points, color: ${stroke.color}`);
    
    ctx.save();
    
    if (stroke.points.length === 1) {
      // Single point - draw a circle
      ctx.beginPath();
      ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / (2 * zoom), 0, Math.PI * 2);
      ctx.fillStyle = stroke.color;
      ctx.fill();
    } else {
      // Multiple points - draw a line
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width / zoom;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Add dashed style for other users' annotations
      if (isOtherUser) {
        ctx.setLineDash([5, 3]);
      }
      
      ctx.stroke();
    }
    
    // Add user name for other users with their consistent color
    if (isOtherUser && stroke.userName) {
      const lastPoint = stroke.points[stroke.points.length - 1];
      
      // Use the user's consistent color for their indicator
      const userColor = stroke.userColor || annotationService.getUserColor(stroke.userId);
      
      ctx.beginPath();
      ctx.fillStyle = userColor;
      ctx.arc(lastPoint.x, lastPoint.y, 6 / zoom, 0, Math.PI * 2);
      ctx.fill();
      
      // Add a white border for better visibility
      ctx.beginPath();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1 / zoom;
      ctx.arc(lastPoint.x, lastPoint.y, 6 / zoom, 0, Math.PI * 2);
      ctx.stroke();
      
      // User name with background
      ctx.font = `${10 / zoom}px Arial`;
      const textWidth = ctx.measureText(stroke.userName).width;
      
      // Draw background for text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(
        lastPoint.x + (8 / zoom), 
        lastPoint.y - (6 / zoom), 
        textWidth + (4 / zoom), 
        (12 / zoom)
      );
      
      // Draw text
      ctx.fillStyle = '#333';
      ctx.fillText(stroke.userName, lastPoint.x + (10 / zoom), lastPoint.y + (3 / zoom));
    }
    
    ctx.restore();
  };
  
  // Get mouse position relative to canvas
  const getMousePosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  };
  
  // Handle mouse down - start drawing
  const handleMouseDown = (e) => {
    if (!enabled || e.button !== 0) return;
    
    setIsMousePressed(true);
    
    const pos = getMousePosition(e);
    
    // Start a new stroke
    const newStroke = {
      id: `annotation-${Date.now()}-${userProfile.id}`,
      userId: userProfile.id,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      color: strokeColor,
      width: strokeWidth,
      points: [pos],
      timestamp: new Date().toISOString()
    };
    
    setCurrentStroke(newStroke);
    
    // Draw initial point
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.setTransform(zoom, 0, 0, zoom, pan.x, pan.y);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, strokeWidth / (2 * zoom), 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.fill();
    ctx.restore();
  };
  
  // Handle mouse move - continue drawing if mouse is pressed
  const handleMouseMove = (e) => {
    if (!enabled || !isMousePressed || !currentStroke) return;
    
    const pos = getMousePosition(e);
    
    // Add point to current stroke
    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, pos]
    };
    
    setCurrentStroke(updatedStroke);
    
    // Draw line segment
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const prevPoint = currentStroke.points[currentStroke.points.length - 1];
    
    ctx.save();
    ctx.setTransform(zoom, 0, 0, zoom, pan.x, pan.y);
    ctx.beginPath();
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth / zoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  };
  
  // Handle mouse up - finish drawing and save
  const handleMouseUp = async () => {
    if (!enabled || !isMousePressed || !currentStroke) return;
    
    setIsMousePressed(false);
    
    try {
      // Save the annotation using AnnotationService
      await annotationService.addAnnotation(designId, currentStroke, userProfile);
      
      console.log('Annotation saved successfully:', currentStroke.id);
      
      // Update local state
      setAnnotations(prev => [...prev, currentStroke]);
      
      // Notify parent components
      if (onAnnotationAdded) {
        onAnnotationAdded(currentStroke);
      }
      
      if (onSave) {
        onSave([...annotations, currentStroke]);
      }
      
    } catch (error) {
      console.error('Error saving annotation:', error);
    }
    
    // Reset current stroke
    setCurrentStroke(null);
  };
  
  // Handle mouse leave - finish drawing if in progress
  const handleMouseLeave = () => {
    if (isMousePressed) {
      handleMouseUp();
    }
  };
  
  // Handle color change
  const handleColorChange = (color) => {
    setStrokeColor(color);
  };
  
  // Handle stroke width change
  const handleStrokeWidthChange = (width) => {
    setStrokeWidth(width);
  };
  
  // Handle clearing annotations
  const handleClearAnnotations = async () => {
    if (!designId || !userProfile?.id) return;
    
    try {
      // Use the improved clear method for current user only
      await annotationService.clearUserAnnotations(designId, userProfile.id);
      
      // Clear local state
      setAnnotations([]);
      setCurrentStroke(null);
      setIsMousePressed(false);
      
      // Redraw canvas
      drawAllAnnotations();
      
      console.log('Cleared user annotations');
      
      if (onClear) {
        onClear();
      }
    } catch (error) {
      console.error('Error clearing annotations:', error);
    }
  };
  
  // Global mouse event listeners
  useEffect(() => {
    if (!isMousePressed || !enabled) return;
    
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isMousePressed, enabled, currentStroke]);
  
  return (
    <>
      {enabled && (
        <div className="annotation-layer-container">
          {/* Annotation badge */}
          <div className="annotation-badge">
            Annotation Mode
            <span className="annotation-user">
              ({userProfile?.name || 'Anonymous'})
            </span>
          </div>
          
          {/* Controls */}
          <div className="annotation-controls">
            {/* Color picker */}
            <div className="color-picker">
              {colors.map(color => (
                <button
                  key={color}
                  className={`color-button ${color === strokeColor ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  aria-label={`Select ${color} color`}
                />
              ))}
            </div>
            
            {/* Stroke width control */}
            <div className="stroke-width-control">
              <button
                className="stroke-width-button"
                onClick={() => handleStrokeWidthChange(Math.max(1, strokeWidth - 1))}
                disabled={strokeWidth <= 1}
                aria-label="Decrease stroke width"
              >
                -
              </button>
              
              <div 
                className="stroke-width-preview"
                style={{ 
                  width: '40px', 
                  height: `${strokeWidth}px`, 
                  backgroundColor: strokeColor 
                }}
              />
              
              <button
                className="stroke-width-button"
                onClick={() => handleStrokeWidthChange(Math.min(15, strokeWidth + 1))}
                disabled={strokeWidth >= 15}
                aria-label="Increase stroke width"
              >
                +
              </button>
            </div>
            
            {/* Clear button */}
            <button
              className="annotation-clear-button"
              onClick={handleClearAnnotations}
              aria-label="Clear my annotations"
            >
              Clear Mine
            </button>
          </div>
        </div>
      )}
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={`annotation-canvas ${enabled ? 'active' : ''}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: enabled ? 40 : -1,
          pointerEvents: enabled ? 'auto' : 'none',
          cursor: enabled ? 'crosshair' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </>
  );
};

export default AnnotationLayer;