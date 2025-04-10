// src/components/whiteboard/ToolBar.jsx
import React from 'react';

const ToolBar = ({ 
  currentMode, 
  setMode, 
  showLinks = true, 
  setShowLinks, 
  clusteringEnabled = true, 
  setClusteringEnabled 
}) => {
  return (
    <div className="toolbar-container">
      {/* Comment Mode with its related controls */}
      <div className="mode-group">
        <button 
          className={`toolbar-button ${currentMode === 'comment' ? 'active' : ''}`}
          onClick={() => setMode('comment')}
        >
          Comment Mode
        </button>
        
        {/* Only show these controls when in comment mode */}
        {(currentMode === 'comment' || currentMode === 'select') && (
          <div className="mode-controls">
            <label className="control-option">
              <input
                type="checkbox"
                checked={clusteringEnabled}
                onChange={() => setClusteringEnabled(!clusteringEnabled)}
              />
              <span>Group</span>
            </label>
            
            <label className="control-option">
              <input
                type="checkbox"
                checked={showLinks}
                onChange={() => setShowLinks(!showLinks)}
              />
              <span>Links</span>
            </label>
          </div>
        )}
      </div>
      
      {/* Annotate mode (renamed from Draw) */}
      <button 
        className={`toolbar-button ${currentMode === 'annotate' ? 'active' : ''}`}
        onClick={() => setMode('annotate')}
      >
        Annotate Mode
      </button>
      
      {/* Help button */}
      <button 
        className="toolbar-button"
        onClick={() => {/* Trigger help/explainer */}}
      >
        Help
      </button>
    </div>
  );
};

export default ToolBar;