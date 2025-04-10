// src/components/whiteboard/ZoomControls.jsx
import React from 'react';

const ZoomControls = ({ zoomLevel, onZoomIn, onZoomOut, onResetZoom }) => {
  return (
    <div className="zoom-controls">
      <button 
        className="zoom-button" 
        onClick={onZoomIn} 
        title="Zoom In"
      >
        +
      </button>
      <div className="zoom-value">
        {Math.round(zoomLevel * 100)}%
      </div>
      <button 
        className="zoom-button" 
        onClick={onZoomOut} 
        title="Zoom Out"
      >
        −
      </button>
      <button 
        className="zoom-button" 
        onClick={onResetZoom} 
        title="Reset Zoom"
      >
        ↺
      </button>
    </div>
  );
};

export default ZoomControls;