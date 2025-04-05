// src/components/common/CommentCategoryModal.jsx
import React from 'react';
import './CommentCategoryModal.css';

const CommentCategoryModal = ({ onSelect, onCancel }) => {
  const categories = [
    { id: 'technical', name: 'Technical', color: '#ff4136', description: 'Code, architecture, and technical implementation issues' },
    { id: 'conceptual', name: 'Conceptual', color: '#0074D9', description: 'High-level design concepts and ideas' },
    { id: 'details', name: 'Details', color: '#2ECC40', description: 'Specifics about implementation details and edge cases' }
  ];

  return (
    <div className="comment-category-modal">
      <div className="category-modal-header">
        <h3>Select Comment Category</h3>
        <button className="category-modal-close" onClick={onCancel}>✕</button>
      </div>

      <div className="category-options">
        {categories.map(category => (
          <div 
            key={category.id}
            className="category-option"
            onClick={() => onSelect(category.id)}
          >
            <div className="category-color-dot" style={{ backgroundColor: category.color }}></div>
            <div className="category-details">
              <h4>{category.name}</h4>
              <p>{category.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="category-modal-footer">
        <button 
          className="category-modal-cancel" 
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CommentCategoryModal;