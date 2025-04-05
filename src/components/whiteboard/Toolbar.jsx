// src/components/whiteboard/ToolBar.jsx
import React from 'react';

const ToolBar = ({ currentMode, setMode }) => {
  return (
    <div className="toolbar-container">
      <button 
        className={`toolbar-button ${currentMode === 'comment' ? 'active' : ''}`}
        onClick={() => setMode('comment')}
      >
        Comment Mode
      </button>
      
      <button 
        className={`toolbar-button ${currentMode === 'draw' ? 'active' : ''}`}
        onClick={() => setMode('draw')}
      >
        Draw Mode
      </button>
      
      <button 
        className={`toolbar-button ${currentMode === 'stamp' ? 'active' : ''}`}
        onClick={() => setMode('stamp')}
      >
        Stamp Mode
      </button>
    </div>
  );
};

export default ToolBar;