// src/components/whiteboard/AnnotationLayer.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';

const COLORS = {
  red: '#FF0000',
  green: '#00FF00',
  blue: '#0000FF',
  yellow: '#FFFF00',
  black: '#000000',
  white: '#FFFFFF',
  orange: '#FFA500',
  purple: '#800080',
  pink: '#FFC0CB',
  cyan: '#00FFFF',
  magenta: '#FF00FF',
  brown: '#A52A2A'
};

const TOOLS = {
  PEN: 'pen',
  MARKER: 'marker',
  HIGHLIGHTER: 'highlighter',
  ERASER: 'eraser'
};

const AnnotationLayer = ({ 
  enabled, 
  zoom, 
  pan, 
  initialColor = '#FF0000', 
  initialStrokeWidth = 3,
  onSave,
  onClear,
  userProfile = { name: 'You', id: 'local-user' }, // User profile with default values
  guestStrokes = [] // Strokes created by other users
}) => {
  const canvasRef = useRef(null);
  const [currentColor, setCurrentColor] = useState(initialColor);
  const [strokeWidth, setStrokeWidth] = useState(initialStrokeWidth);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [currentTool, setCurrentTool] = useState(TOOLS.PEN);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [visible, setVisible] = useState(enabled);
  
  // Handle visibility changes
  useEffect(() => {
    if (enabled) {
      // Show immediately when enabled
      setVisible(true);
    } else {
      // Hide with a slight delay when disabled (for transition effects)
      const timer = setTimeout(() => {
        setVisible(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [enabled]);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size to match parent
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redrawStrokes();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  // Redraw when zoom or pan changes
  useEffect(() => {
    redrawStrokes();
  }, [zoom, pan]);
  
  // Redraw all strokes
  const redrawStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Only draw if the layer is visible
    if (!visible) return;
    
    // First draw guest strokes
    if (guestStrokes && guestStrokes.length > 0) {
      guestStrokes.forEach(stroke => {
        drawStrokeWithUserIndicator(ctx, stroke, stroke.userId, stroke.userName);
      });
    }
    
    // Then draw local user strokes
    strokes.forEach(stroke => {
      drawStrokeWithUserIndicator(ctx, stroke, userProfile.id, userProfile.name);
    });
  }, [strokes, guestStrokes, zoom, pan, visible, userProfile]);
  
  // Draw a stroke with user indicator
  const drawStrokeWithUserIndicator = (ctx, stroke, userId, userName) => {
    if (!stroke || stroke.points.length < 2) return;
    
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width / zoom;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Set transparency based on tool
    if (stroke.tool === TOOLS.HIGHLIGHTER) {
      ctx.globalAlpha = 0.3;
    } else if (stroke.tool === TOOLS.MARKER) {
      ctx.globalAlpha = 0.8;
    } else {
      ctx.globalAlpha = 1.0;
    }
    
    // Start from the first point
    const startX = stroke.points[0].x * zoom + pan.x;
    const startY = stroke.points[0].y * zoom + pan.y;
    ctx.moveTo(startX, startY);
    
    // Draw lines to each subsequent point
    for (let i = 1; i < stroke.points.length; i++) {
      const x = stroke.points[i].x * zoom + pan.x;
      const y = stroke.points[i].y * zoom + pan.y;
      ctx.lineTo(x, y);
    }
    
    ctx.stroke();
    
    // Add user indicator at the start of the stroke
    // Only add if the stroke has more than 5 points (to avoid tiny strokes getting labels)
    if (stroke.points.length > 5) {
      const labelX = startX;
      const labelY = startY - 10; // Position label above the stroke start
      
      // Draw label background
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = userId === userProfile.id ? '#2C3E50' : '#E74C3C'; // Different colors for local vs guest
      ctx.fillRect(labelX - 5, labelY - 15, userName.length * 8 + 10, 20);
      
      // Draw label text
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.fillText(userName, labelX, labelY);
    }
    
    ctx.globalAlpha = 1.0; // Reset alpha
  };
  
  // Start drawing
  const handleMouseDown = (e) => {
    if (!enabled || !visible) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    setIsDrawing(true);
    setLastX(x);
    setLastY(y);
    setCurrentStroke([{ x, y }]);
  };
  
  // Draw
  const handleMouseMove = (e) => {
    if (!enabled || !isDrawing || !visible) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    // Draw on canvas
    ctx.beginPath();
    
    if (currentTool === TOOLS.ERASER) {
      ctx.strokeStyle = '#FFFFFF'; // White for eraser
      ctx.globalCompositeOperation = 'destination-out'; // Erase by making pixels transparent
    } else {
      ctx.strokeStyle = currentColor;
      ctx.globalCompositeOperation = 'source-over'; // Normal drawing
    }
    
    // Set opacity based on tool
    if (currentTool === TOOLS.HIGHLIGHTER) {
      ctx.globalAlpha = 0.3;
    } else if (currentTool === TOOLS.MARKER) {
      ctx.globalAlpha = 0.8;
    } else {
      ctx.globalAlpha = 1.0;
    }
    
    // Set width based on tool
    let toolWidth = strokeWidth;
    if (currentTool === TOOLS.MARKER) {
      toolWidth = strokeWidth * 2;
    } else if (currentTool === TOOLS.HIGHLIGHTER) {
      toolWidth = strokeWidth * 4;
    } else if (currentTool === TOOLS.ERASER) {
      toolWidth = strokeWidth * 3;
    }
    
    ctx.lineWidth = toolWidth / zoom;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Convert to screen coordinates for drawing
    const screenX1 = lastX * zoom + pan.x;
    const screenY1 = lastY * zoom + pan.y;
    const screenX2 = x * zoom + pan.x;
    const screenY2 = y * zoom + pan.y;
    
    ctx.moveTo(screenX1, screenY1);
    ctx.lineTo(screenX2, screenY2);
    ctx.stroke();
    
    // Reset composite operation and alpha
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
    
    setLastX(x);
    setLastY(y);
    setCurrentStroke(prev => [...prev, { x, y }]);
  };
  
  // End drawing
  const handleMouseUp = () => {
    if (!enabled || !isDrawing || !visible) return;
    
    setIsDrawing(false);
    
    // Save the stroke
    if (currentStroke.length > 1) {
      const newStroke = {
        points: currentStroke,
        color: currentTool === TOOLS.ERASER ? '#FFFFFF' : currentColor,
        width: 
          currentTool === TOOLS.MARKER ? strokeWidth * 2 : 
          currentTool === TOOLS.HIGHLIGHTER ? strokeWidth * 4 : 
          currentTool === TOOLS.ERASER ? strokeWidth * 3 : 
          strokeWidth,
        tool: currentTool,
        timestamp: new Date().toISOString(),
        userId: userProfile.id,
        userName: userProfile.name
      };
      
      const updatedStrokes = [...strokes, newStroke];
      setStrokes(updatedStrokes);
      setCurrentStroke([]);
      
      // Call save callback if provided
      if (onSave) {
        onSave(updatedStrokes);
      }
    }
  };
  
  // Handle mouse leaving canvas
  const handleMouseLeave = () => {
    handleMouseUp();
  };
  
  // Clear all strokes
  const clearAnnotations = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokes([]);
    setCurrentStroke([]);
    
    if (onClear) {
      onClear();
    }
  };
  
  // Undo last stroke
  const handleUndo = () => {
    if (strokes.length === 0) return;
    
    const newStrokes = [...strokes];
    newStrokes.pop();
    setStrokes(newStrokes);
    
    if (onSave) {
      onSave(newStrokes);
    }
    
    redrawStrokes();
  };

  // Color picker component
  const ColorPicker = () => {
    return (
      <div 
        style={{
          position: 'absolute',
          bottom: '130px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
          padding: '12px',
          zIndex: 102,
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '8px',
          width: '280px'
        }}
      >
        {Object.entries(COLORS).map(([name, color]) => (
          <button
            key={name}
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: color,
              border: color === currentColor ? '3px solid #333' : '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: 0
            }}
            onClick={() => {
              setCurrentColor(color);
              setIsColorPickerOpen(false);
            }}
            title={name}
          />
        ))}
      </div>
    );
  };
  
  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: enabled && visible ? 'auto' : 'none',
          cursor: enabled && visible ? 
            (currentTool === TOOLS.ERASER ? 'cell' : 'crosshair') 
            : 'default',
          zIndex: 4, // Above background image but below UI elements
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Show color picker if open */}
      {enabled && visible && isColorPickerOpen && <ColorPicker />}
      
      {/* Annotation Controls */}
      {enabled && visible && (
        <div
          className="annotation-controls"
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            padding: '10px 16px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            zIndex: 101
          }}
        >
          {/* Current color preview and picker button */}
          <button
            style={{
              width: '30px',
              height: '30px',
              backgroundColor: currentColor,
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginRight: '12px',
              cursor: 'pointer',
              padding: 0
            }}
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            title="Choose color"
          />
          
          {/* Drawing tools */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ToolButton 
              name="Pen" 
              icon="✏️" 
              isActive={currentTool === TOOLS.PEN} 
              onClick={() => setCurrentTool(TOOLS.PEN)} 
            />
            <ToolButton 
              name="Marker" 
              icon="🖌️" 
              isActive={currentTool === TOOLS.MARKER} 
              onClick={() => setCurrentTool(TOOLS.MARKER)} 
            />
            <ToolButton 
              name="Highlighter" 
              icon="🖍️" 
              isActive={currentTool === TOOLS.HIGHLIGHTER} 
              onClick={() => setCurrentTool(TOOLS.HIGHLIGHTER)} 
            />
            <ToolButton 
              name="Eraser" 
              icon="🧽" 
              isActive={currentTool === TOOLS.ERASER} 
              onClick={() => setCurrentTool(TOOLS.ERASER)} 
            />
            
            <div style={{ height: '20px', width: '1px', backgroundColor: '#ddd', margin: '0 8px' }} />
            
            {/* Stroke width controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                style={{ 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer', 
                  fontSize: '18px',
                  opacity: strokeWidth <= 1 ? 0.4 : 1
                }}
                onClick={() => setStrokeWidth(prev => Math.max(1, prev - 1))}
                disabled={strokeWidth <= 1}
                title="Decrease stroke width"
              >
                -
              </button>
              
              <div 
                style={{ 
                  width: `${strokeWidth * 4}px`, 
                  height: `${strokeWidth}px`, 
                  backgroundColor: 'black',
                  borderRadius: '2px'
                }}
              />
              
              <button
                style={{ 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer', 
                  fontSize: '18px',
                  opacity: strokeWidth >= 10 ? 0.4 : 1
                }}
                onClick={() => setStrokeWidth(prev => Math.min(10, prev + 1))}
                disabled={strokeWidth >= 10}
                title="Increase stroke width"
              >
                +
              </button>
            </div>
            
            <div style={{ height: '20px', width: '1px', backgroundColor: '#ddd', margin: '0 8px' }} />
            
            {/* Action buttons */}
            <button
              style={{
                background: 'none',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
                opacity: strokes.length === 0 ? 0.5 : 1
              }}
              onClick={handleUndo}
              disabled={strokes.length === 0}
              title="Undo last stroke"
            >
              Undo
            </button>
            
            <button
              style={{
                background: 'none',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
                opacity: strokes.length === 0 ? 0.5 : 1
              }}
              onClick={clearAnnotations}
              disabled={strokes.length === 0}
              title="Clear all annotations"
            >
              Clear
            </button>
          </div>
        </div>
      )}
      
      {/* Show annotation badge */}
      {enabled && visible && (
        <div 
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: '#ff4136',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '16px',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            zIndex: 101
          }}
        >
          Annotation Mode
        </div>
      )}
    </>
  );
};

// Tool button component
const ToolButton = ({ name, icon, isActive, onClick }) => {
  return (
    <button
      style={{
        width: '34px',
        height: '34px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isActive ? '#f0f0f0' : 'transparent',
        border: isActive ? '2px solid #333' : '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        padding: 0,
        fontSize: '18px'
      }}
      onClick={onClick}
      title={name}
    >
      {icon}
    </button>
  );
};

export default AnnotationLayer;