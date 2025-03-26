// src/components/common/ToolBar.jsx
import React from 'react';
import './Toolbar.css';


const ToolBar = ({ currentTool, setCurrentTool }) => {
  return (
    <div className="bottom-toolbar">
      <div className="tool-buttons">
        <button 
          className={`tool-btn ${currentTool === 'select' ? 'active' : ''}`}
          onClick={() => setCurrentTool('select')}
        >
          <span className="tool-icon">☝️</span>
          <span>Select</span>
        </button>
        <button 
          className={`tool-btn ${currentTool === 'stamp' ? 'active' : ''}`}
          onClick={() => setCurrentTool('stamp')}
        >
          <span className="tool-icon">📌</span>
          <span>Stamp</span>
        </button>
        {/* <button 
          className={`tool-btn ${currentTool === 'marker' ? 'active' : ''}`}
          onClick={() => setCurrentTool('marker')}
        >
          <span className="tool-icon">✏️</span>
          <span>Marker</span>
        </button> */}
      </div>
    </div>
  );
};

export default ToolBar;