// src/components/common/StampSelector.jsx
import React from 'react';
import './StampSelector.css';

const StampSelector = ({ 
  stampIcons, 
  selectedStampIcon, 
  setSelectedStampIcon 
}) => {
  return (
    <div className="stamp-selector">
      <span className="stamp-selector-label">Choose Stamp:</span>
      <div className="stamp-icons">
        {stampIcons.map(icon => (
          <div
            key={icon}
            className={`stamp-option ${icon === selectedStampIcon ? 'active' : ''}`}
            onClick={() => setSelectedStampIcon(icon)}
          >
            {icon}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StampSelector;