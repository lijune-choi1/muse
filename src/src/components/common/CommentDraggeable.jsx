import React, { useState, useRef, useEffect } from 'react';

const CommentDraggable = ({ 
  children, 
  position, 
  onPositionChange, 
  zoomLevel, 
  panOffset, 
  canvasRef, 
  isDraggable = true 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  
  // Add debugging
  useEffect(() => {
    if (isDraggable) {
      console.log("Draggable component is draggable");
    } else {
      console.log("Draggable component is NOT draggable");
    }
  }, [isDraggable]);
  
  const handleMouseDown = (e) => {
    if (!isDraggable) {
      console.log("Not draggable, ignoring mouse down");
      return;
    }
    
    console.log("Mouse down on draggable");
    e.stopPropagation();
    
    if (!canvasRef || !canvasRef.current) {
      console.error("Canvas ref is missing");
      return;
    }
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - canvasRect.left) / zoomLevel - panOffset.x;
    const mouseY = (e.clientY - canvasRect.top) / zoomLevel - panOffset.y;
    
    dragOffsetRef.current = {
      x: mouseX - position.x,
      y: mouseY - position.y
    };
    
    setIsDragging(true);
    
    // These are added to document to catch mouse events even if they leave the component
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    if (!canvasRef || !canvasRef.current) {
      console.error("Canvas ref is missing during mouse move");
      return;
    }
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - canvasRect.left) / zoomLevel - panOffset.x;
    const mouseY = (e.clientY - canvasRect.top) / zoomLevel - panOffset.y;
    
    const newPosition = {
      x: mouseX - dragOffsetRef.current.x,
      y: mouseY - dragOffsetRef.current.y
    };
    
    console.log("Dragging to position:", newPosition);
    onPositionChange(newPosition);
  };
  
  const handleMouseUp = () => {
    if (isDragging) {
      console.log("Mouse up, ending drag");
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  };
  
  useEffect(() => {
    // Clean up event listeners if component unmounts while dragging
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  const style = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: `translate(-50%, -50%) scale(${1/zoomLevel})`,
    cursor: isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
    zIndex: isDragging ? 20 : 15, // Higher z-index when dragging
    pointerEvents: 'auto', // Ensure pointer events are enabled
    userSelect: 'none', // Prevent text selection during drag
    touchAction: 'none' // Disable browser handling of touch events
  };
  
  return (
    <div 
      style={style} 
      onMouseDown={handleMouseDown}
      className={`draggable-element ${isDragging ? 'dragging' : ''}`}
    >
      {children}
    </div>
  );
};

export default CommentDraggable;