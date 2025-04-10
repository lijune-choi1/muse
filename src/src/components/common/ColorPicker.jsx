// src/components/common/ColorPicker.jsx
import React from 'react';
import './ColorPicker.css';


const ColorPicker = ({ 
  colors, 
  selectedColor, 
  setSelectedColor, 
  markerWidth, 
  setMarkerWidth 
}) => {
  return (
    <div className="color-picker">
      <span className="color-picker-label">Color:</span>
      {colors.map(color => (
        <div
          key={color}
          className={`color-option ${color === selectedColor ? 'active' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => setSelectedColor(color)}
        />
      ))}
      <div className="marker-width-container">
        <span className="width-label">Width: {markerWidth}</span>
        <input
          type="range"
          min="1"
          max="10"
          value={markerWidth}
          onChange={(e) => setMarkerWidth(parseInt(e.target.value))}
          className="marker-width-slider"
        />
      </div>
    </div>
  );
};

export default ColorPicker;