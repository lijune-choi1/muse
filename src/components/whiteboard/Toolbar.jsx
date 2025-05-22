// src/components/whiteboard/ToolBar.jsx
import React from 'react';
import './Toolbar.css';

const ToolBar = ({ 
  currentMode, 
  setMode, 
  showLinks = true, 
  setShowLinks, 
  clusteringEnabled = true, 
  setClusteringEnabled,
  onHelpClick  // Added help button click handler
}) => {
  return (
    <div className="sidebar-toolbar">
      {/* Main mode buttons - vertical layout */}
      <button 
        className={`toolbar-button ${currentMode === 'select' ? 'active' : ''}`}
        onClick={() => setMode('select')}
        title="Select Mode"
      >
        <i className="icon-select">⊙</i>
      </button>
      
      
      <button 
        className={`toolbar-button ${currentMode === 'annotate' ? 'active' : ''}`}
        onClick={() => setMode('annotate')}
        title="Annotate Mode"
      >
        <i className="icon-annotate">✏️</i>
      </button>
      
      {/* Divider */}
      <div className="toolbar-divider"></div>
      
      {/* Comment settings - only visible when in comment or select mode */}
      {(currentMode === 'comment' || currentMode === 'select') && (
        <>
          <button
            className={`toolbar-button ${clusteringEnabled ? 'active' : ''}`}
            onClick={() => setClusteringEnabled(!clusteringEnabled)}
            title={clusteringEnabled ? "Disable Comment Grouping" : "Enable Comment Grouping"}
          >
            <i className="icon-group">⌘</i>
          </button>
          
          <button
            className={`toolbar-button ${showLinks ? 'active' : ''}`}
            onClick={() => setShowLinks(!showLinks)}
            title={showLinks ? "Hide Comment Links" : "Show Comment Links"}
          >
            <i className="icon-links">⟀</i>
          </button>
        </>
      )}
      
      {/* Divider */}
      <div className="toolbar-divider"></div>
      
      {/* Help button */}
      <button 
        className="toolbar-button"
        onClick={onHelpClick}  // Use the provided handler
        title="Help"
      >
        <i className="icon-help">?</i>
      </button>
    </div>
  );
};

export default ToolBar;