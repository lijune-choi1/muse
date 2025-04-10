// src/components/whiteboard/CommentThread.jsx
import React, { useState } from 'react';

const CommentThread = ({ 
  comments, 
  position, 
  zoom, 
  pan, 
  onClose, 
  onEdit, 
  onDelete,
  onReactionChange,
  userProfile
}) => {
  const [activeCommentIndex, setActiveCommentIndex] = useState(0);
  
  if (!comments || comments.length === 0) return null;
  
  // Sort comments by type and then by creation date
  const sortedComments = [...comments].sort((a, b) => {
    // First by type
    if (a.type !== b.type) {
      const typeOrder = { technical: 1, conceptual: 2, details: 3 };
      return typeOrder[a.type.toLowerCase()] - typeOrder[b.type.toLowerCase()];
    }
    // Then by creation date (assuming there's a timestamp field, or fallback to id)
    return a.timestamp ? new Date(a.timestamp) - new Date(b.timestamp) : a.id.localeCompare(b.id);
  });
  
  const currentComment = sortedComments[activeCommentIndex];
  
  // Get type-based styling
  const getTypeStyle = (type) => {
    switch (type.toLowerCase()) {
      case 'technical':
        return { color: '#ff4136', borderColor: '#ff4136' };
      case 'conceptual':
        return { color: '#0074D9', borderColor: '#0074D9' };
      case 'details':
        return { color: '#2ECC40', borderColor: '#2ECC40' };
      default:
        return { color: '#777777', borderColor: '#777777' };
    }
  };
  
  const typeStyle = getTypeStyle(currentComment.type);
  
  // Handle user reactions
  const handleReaction = (type) => {
    // Copy current reactions or initialize
    const currentReactions = currentComment.reactions || { agreed: 0, disagreed: 0 };
    const updatedReactions = { ...currentReactions };
    
    // Check if user already reacted
    const previousReaction = currentComment.userReacted;
    
    // If user clicked same reaction, remove it
    if (previousReaction === type) {
      updatedReactions[type]--;
      onReactionChange(currentComment.id, { 
        reactions: updatedReactions,
        userReacted: null 
      });
    } 
    // If user clicked different reaction
    else {
      // Remove previous reaction if exists
      if (previousReaction) {
        updatedReactions[previousReaction]--;
      }
      // Add new reaction
      updatedReactions[type]++;
      onReactionChange(currentComment.id, { 
        reactions: updatedReactions,
        userReacted: type 
      });
    }
  };
  
  return (
    <div 
      className="comment-thread-container"
      style={{
        position: 'absolute',
        left: `${position.x * zoom + pan.x + 15}px`,
        top: `${position.y * zoom + pan.y}px`,
        transform: 'translateY(-50%)',
        width: '280px',
        backgroundColor: 'white',
        borderLeft: `4px solid ${typeStyle.borderColor}`,
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        zIndex: 100,
        overflow: 'hidden'
      }}
    >
      {/* Thread header with pagination */}
      <div 
        className="thread-header"
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f9f9f9'
        }}
      >
        <div 
          className="thread-pagination"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px'
          }}
        >
          <button 
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              opacity: activeCommentIndex === 0 ? 0.5 : 1,
              fontSize: '18px'
            }}
            onClick={() => setActiveCommentIndex(prev => Math.max(0, prev - 1))}
            disabled={activeCommentIndex === 0}
          >
            ←
          </button>
          
          <span>
            {activeCommentIndex + 1} / {sortedComments.length}
          </span>
          
          <button 
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              opacity: activeCommentIndex === sortedComments.length - 1 ? 0.5 : 1,
              fontSize: '18px'
            }}
            onClick={() => setActiveCommentIndex(prev => Math.min(sortedComments.length - 1, prev + 1))}
            disabled={activeCommentIndex === sortedComments.length - 1}
          >
            →
          </button>
        </div>
        
        <div className="thread-actions">
          <button 
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              marginLeft: '8px'
            }}
            onClick={() => onClose()}
          >
            ✕
          </button>
        </div>
      </div>
      
      {/* Comment content */}
      <div 
        className="thread-comment"
        style={{
          padding: '12px'
        }}
      >
        <div 
          className="comment-type-label"
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: typeStyle.color,
            textTransform: 'uppercase',
            marginBottom: '4px'
          }}
        >
          {currentComment.type}
        </div>
        
        <div 
          className="comment-content"
          style={{
            fontSize: '14px',
            lineHeight: '1.4',
            marginBottom: '12px'
          }}
        >
          {currentComment.text}
        </div>
        
        <div
          className="comment-footer"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #eee',
            paddingTop: '8px',
            marginTop: '8px',
            fontSize: '12px',
            color: '#777'
          }}
        >
          <div className="comment-author">
            {currentComment.author || 'Anonymous'}
          </div>
          
          <div 
            className="comment-actions"
            style={{
              display: 'flex',
              gap: '12px'
            }}
          >
            {/* Edit button (only for user's own comments) */}
            {(!currentComment.guestCreated || currentComment.author === userProfile.name) && (
              <button
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#0074D9',
                  fontSize: '12px'
                }}
                onClick={() => onEdit(currentComment.id)}
              >
                Edit
              </button>
            )}
            
            {/* Delete button (only for user's own comments) */}
            {(!currentComment.guestCreated || currentComment.author === userProfile.name) && (
              <button
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#ff4136',
                  fontSize: '12px'
                }}
                onClick={() => onDelete(currentComment.id)}
              >
                Delete
              </button>
            )}
          </div>
        </div>
        
        {/* Reactions */}
        <div
          className="comment-reactions"
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '10px'
          }}
        >
          <button
            className={`reaction-button ${currentComment.userReacted === 'agreed' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '12px',
              background: currentComment.userReacted === 'agreed' ? '#e6f7ff' : 'white',
              color: currentComment.userReacted === 'agreed' ? '#0074D9' : '#666',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            onClick={() => handleReaction('agreed')}
          >
            👍 {currentComment.reactions?.agreed || 0}
          </button>
          
          <button
            className={`reaction-button ${currentComment.userReacted === 'disagreed' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '12px',
              background: currentComment.userReacted === 'disagreed' ? '#fff0f0' : 'white',
              color: currentComment.userReacted === 'disagreed' ? '#ff4136' : '#666',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            onClick={() => handleReaction('disagreed')}
          >
            👎 {currentComment.reactions?.disagreed || 0}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentThread;