// PanControls.jsx
// Optional: render pan toggles or directions (if needed)

import React from 'react';

const PanControls = ({ onPanLeft, onPanRight, onPanUp, onPanDown }) => {
  return (
    <div className="pan-controls">
      <button onClick={onPanUp}>↑</button>
      <div>
        <button onClick={onPanLeft}>←</button>
        <button onClick={onPanRight}>→</button>
      </div>
      <button onClick={onPanDown}>↓</button>
    </div>
  );
};

export default PanControls;
