// src/components/whiteboard/CommentTracker.jsx
import React, { useState, useEffect } from 'react';
import './CommentTracker.css';

const CommentTracker = ({ 
  comments = [], 
  onCommentSelect, 
  selectedCommentId, 
  collapsed = false, 
  onToggleCollapse 
}) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  // Initialize with prop collapsed state
  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  // Calculate counts for each comment type
  const counts = comments.reduce((acc, comment) => {
    const type = comment.type?.toLowerCase() || 'other';
    acc[type] = (acc[type] || 0) + 1;
    acc.total++;
    return acc;
  }, { total: 0 });

  // Filter comments based on selected filter and search term
  const filteredComments = comments.filter(comment => {
    // Type filter
    if (filter !== 'all' && comment.type?.toLowerCase() !== filter) {
      return false;
    }

    // Search filter
    if (searchTerm && !comment.text?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Toggle collapsed state
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggleCollapse) {
      onToggleCollapse(newState);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle clicking on a comment
  const handleCommentClick = (commentId) => {
    if (onCommentSelect) {
      onCommentSelect(commentId);
    }
  };

  // Get color for comment type
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'technical':
        return '#ff4136'; // Red
      case 'conceptual':
        return '#0074D9'; // Blue
      case 'details':
        return '#2ECC40'; // Green
      default:
        return '#AAAAAA'; // Grey
    }
  };

  // Format timestamp if available
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    // Handle Firebase Timestamp objects
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
    
    // Handle date strings or timestamps
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
    
    return '';
  };

  return (
    <div className={`comment-tracker ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Collapse toggle button */}
      <button 
        className="collapse-toggle" 
        onClick={toggleCollapse}
        aria-label={isCollapsed ? "Expand comment tracker" : "Collapse comment tracker"}
      >
        {isCollapsed ? '»' : '«'}
      </button>
      
      {!isCollapsed && (
        <>
          <div className="tracker-header">
            <h2>Comments</h2>
            <div className="comment-count">
              <span className="count-number">{counts.total}</span>
              <span className="count-label">total</span>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`} 
              onClick={() => handleFilterChange('all')}
            >
              All
              <span className="tab-count">{counts.total}</span>
            </button>
            <button 
              className={`filter-tab ${filter === 'technical' ? 'active' : ''}`}
              onClick={() => handleFilterChange('technical')}
              style={{ borderBottom: `2px solid ${getTypeColor('technical')}` }}
            >
              Technical
              <span className="tab-count">{counts.technical || 0}</span>
            </button>
            <button 
              className={`filter-tab ${filter === 'conceptual' ? 'active' : ''}`}
              onClick={() => handleFilterChange('conceptual')}
              style={{ borderBottom: `2px solid ${getTypeColor('conceptual')}` }}
            >
              Conceptual
              <span className="tab-count">{counts.conceptual || 0}</span>
            </button>
            <button 
              className={`filter-tab ${filter === 'details' ? 'active' : ''}`}
              onClick={() => handleFilterChange('details')}
              style={{ borderBottom: `2px solid ${getTypeColor('details')}` }}
            >
              Details
              <span className="tab-count">{counts.details || 0}</span>
            </button>
          </div>
          
          {/* Search Input */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search" 
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          
          {/* Comments List */}
          <div className="comments-list">
            {filteredComments.length > 0 ? (
              filteredComments.map(comment => (
                <div 
                  key={comment.id} 
                  className={`comment-item ${selectedCommentId === comment.id ? 'selected' : ''}`}
                  onClick={() => handleCommentClick(comment.id)}
                >
                  <div 
                    className="comment-type-indicator" 
                    style={{ backgroundColor: getTypeColor(comment.type) }}
                  />
                  <div className="comment-content">
                    <div className="comment-text">{comment.text || '(No text)'}</div>
                    <div className="comment-meta">
                      <span className="comment-author">{comment.author || 'Anonymous'}</span>
                      {comment.createdAt && (
                        <span className="comment-time">{formatTimestamp(comment.createdAt)}</span>
                      )}
                    </div>
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="comment-replies-indicator">
                        {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-comments">
                {comments.length === 0 
                  ? 'No comments yet. Add one by clicking on the canvas.'
                  : 'No comments match your current filter.'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommentTracker;