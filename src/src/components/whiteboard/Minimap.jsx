// Minimap.jsx
// Renders a small overview map of the whiteboard

import React from 'react';

const Minimap = ({ zoomLevel, pan }) => {
  return (
    <div className="minimap">
      <div className="minimap-viewport" style={{ transform: `scale(${zoomLevel}) translate(${-pan.x}px, ${-pan.y}px)` }}>
        {/* simplified view of board */}
        <div className="minimap-preview-box">View</div>
      </div>
    </div>
  );
};

export default Minimap;