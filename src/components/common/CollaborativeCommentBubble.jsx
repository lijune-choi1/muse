// src/components/testing/CollaborativeCommentBubble.jsx
import React, { useState, useEffect } from 'react';
import CollaborativeComment from '../common/CollaborativeComment';

const CollaborativeCommentBubble = ({
  comment,
  onContentChange,
  onTypeChange,
  onDelete,
  onClose,
  onReactionChange,
  onReplyAdd,
  userProfile
}) => {
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [isCollaboratorPresent, setIsCollaboratorPresent] = useState(false);
  const [collaboratorStatus, setCollaboratorStatus] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [guestActivity, setGuestActivity] = useState(null);
  
  // Toggle collaboration simulation
  const toggleCollaboration = () => {
    if (!showCollaboration) {
      setShowCollaboration(true);
      
      // Show collaborator joined message
      setCollaboratorStatus('Guest User joined');
      setIsCollaboratorPresent(true);
      
      // After a moment, clear the status
      setTimeout(() => {
        setCollaboratorStatus(null);
      }, 3000);
    } else {
      // Show collaborator left message
      setCollaboratorStatus('Guest User left');
      
      setTimeout(() => {
        setCollaboratorStatus(null);
        setIsCollaboratorPresent(false);
        setShowCollaboration(false);
      }, 2000);
    }
  };
  
  // Handle comment type change
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    
    if (onTypeChange) {
      onTypeChange(comment.id, newType);
    }
    
    // Simulate guest reaction to type change
    if (isCollaboratorPresent) {
      setGuestActivity('Guest is seeing your changes...');
      
      setTimeout(() => {
        setGuestActivity(null);
      }, 2000);
    }
  };
  
  // Handle content change
  const handleContentChange = (newContent) => {
    if (onContentChange) {
      onContentChange(comment.id, newContent);
    }
  };
  
  // Handle reaction change
  const handleReaction = (type) => {
    const currentReactions = comment.reactions || { agreed: 0, disagreed: 0 };
    const userReacted = comment.userReacted || '';
    
    let newReactions = { ...currentReactions };
    let newUserReacted = userReacted;
    
    // Toggle reaction
    if (userReacted === type) {
      // Remove reaction
      newReactions[type]--;
      newUserReacted = '';
    } else {
      // Add/change reaction
      if (userReacted) {
        // Changed reaction
        newReactions[userReacted]--;
      }
      newReactions[type]++;
      newUserReacted = type;
    }
    
    if (onReactionChange) {
      onReactionChange(comment.id, {
        reactions: newReactions,
        userReacted: newUserReacted
      });
    }
    
    // Simulate collaborator reaction
    if (isCollaboratorPresent && Math.random() > 0.5) {
      setTimeout(() => {
        setGuestActivity('Guest is reacting...');
        
        setTimeout(() => {
          // Guest adds the same reaction
          const guestReactionType = Math.random() > 0.3 ? type : (type === 'agreed' ? 'disagreed' : 'agreed');
          const updatedReactions = { ...newReactions };
          updatedReactions[guestReactionType]++;
          
          if (onReactionChange) {
            onReactionChange(comment.id, {
              reactions: updatedReactions,
              userReacted: newUserReacted // Keep user's reaction unchanged
            });
          }
          
          setGuestActivity(`Guest ${guestReactionType === 'agreed' ? 'agrees' : 'disagrees'}`);
          
          setTimeout(() => {
            setGuestActivity(null);
          }, 2000);
        }, 1500);
      }, 1000);
    }
  };
  
  // Handle adding a reply
  const handleAddReply = () => {
    if (!replyText.trim()) return;
    
    const newReply = {
      id: `reply-${Date.now()}`,
      author: userProfile.name,
      text: replyText,
      timestamp: new Date().toISOString()
    };
    
    const updatedReplies = [...(comment.replies || []), newReply];
    
    if (onReplyAdd) {
      onReplyAdd(comment.id, newReply, updatedReplies);
    }
    
    setReplyText('');
    
    // Simulate guest reply
    if (isCollaboratorPresent && Math.random() > 0.3) {
      setTimeout(() => {
        setGuestActivity('Guest is typing a reply...');
        
        setTimeout(() => {
          const guestReply = {
            id: `reply-guest-${Date.now()}`,
            author: 'Guest User',
            text: 'I see your point. Let me add some more perspective here.',
            timestamp: new Date().toISOString()
          };
          
          const updatedRepliesWithGuest = [...updatedReplies, guestReply];
          
          if (onReplyAdd) {
            onReplyAdd(comment.id, guestReply, updatedRepliesWithGuest);
          }
          
          setGuestActivity(null);
        }, 3000);
      }, 2000);
    }
  };
  
  // Simulate random guest activities
  useEffect(() => {
    if (isCollaboratorPresent) {
      const interval = setInterval(() => {
        // 30% chance of random activity if not already showing activity
        if (!guestActivity && Math.random() < 0.3) {
          const activities = [
            'Guest is looking at the comment',
            'Guest is reviewing the thread',
            'Guest copied text to clipboard'
          ];
          const randomActivity = activities[Math.floor(Math.random() * activities.length)];
          setGuestActivity(randomActivity);
          
          setTimeout(() => {
            setGuestActivity(null);
          }, 2000);
        }
      }, 8000); // Check every 8 seconds
      
      return () => clearInterval(interval);
    }
  }, [isCollaboratorPresent, guestActivity]);
  
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
      width: '320px',
      maxWidth: '100%',
      position: 'relative',
      zIndex: 100
    }}>
      {/* Collaboration status indicator */}
      {(collaboratorStatus || guestActivity) && (
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '0',
          right: '0',
          backgroundColor: 'rgba(52, 152, 219, 0.9)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          textAlign: 'center',
          zIndex: 101
        }}>
          {collaboratorStatus || guestActivity}
        </div>
      )}
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
        borderBottom: '1px solid #eee',
        backgroundColor: comment.type === 'technical' ? '#ffeeee' :
                        comment.type === 'conceptual' ? '#eeeeff' :
                        comment.type === 'details' ? '#eeffee' : '#f5f5f5',
        borderRadius: '8px 8px 0 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Comment type selection */}
          <select 
            value={comment.type || 'technical'} 
            onChange={handleTypeChange}
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            <option value="technical">Technical</option>
            <option value="conceptual">Conceptual</option>
            <option value="details">Details</option>
          </select>
          
          {/* Collaboration toggle */}
          <button
            onClick={toggleCollaboration}
            style={{
              backgroundColor: isCollaboratorPresent ? '#3498db' : '#f1f1f1',
              color: isCollaboratorPresent ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span style={{ marginRight: '5px' }}>👥</span>
            {isCollaboratorPresent ? 'Collaborating' : 'Simulate Collab'}
          </button>
        </div>
        
        <div>
          {/* Close button */}
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#888'
            }}
          >
            ✕
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div style={{ padding: '12px' }}>
        {/* User info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '10px' 
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#ddd',
            marginRight: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#666'
          }}>
            {userProfile.name.charAt(0)}
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{userProfile.name}</span>
        </div>
        
        {/* Comment text */}
        <div style={{ marginBottom: '16px' }}>
          <CollaborativeComment
            content={comment.text}
            onContentChange={handleContentChange}
            simulateCollaboration={showCollaboration}
          />
        </div>
        
        {/* Reactions */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '16px' 
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => handleReaction('agreed')}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: comment.userReacted === 'agreed' ? '#e3f2fd' : 'white',
                cursor: 'pointer'
              }}
            >
              <span style={{ marginRight: '5px' }}>👍</span>
              <span>{comment.reactions?.agreed || 0}</span>
            </button>
            
            <button 
              onClick={() => handleReaction('disagreed')}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: comment.userReacted === 'disagreed' ? '#ffebee' : 'white',
                cursor: 'pointer'
              }}
            >
              <span style={{ marginRight: '5px' }}>👎</span>
              <span>{comment.reactions?.disagreed || 0}</span>
            </button>
          </div>
          
          {/* Delete button */}
          <button 
            onClick={() => onDelete(comment.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#e74c3c',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Delete
          </button>
        </div>
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div style={{ 
            marginBottom: '16px',
            maxHeight: '200px',
            overflowY: 'auto',
            borderTop: '1px solid #eee',
            paddingTop: '10px'
          }}>
            <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Replies</h4>
            
            {comment.replies.map(reply => (
              <div 
                key={reply.id}
                style={{
                  marginBottom: '10px',
                  padding: '8px',
                  backgroundColor: reply.author === 'Guest User' ? '#f0f7fb' : '#f9f9f9',
                  borderRadius: '4px'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  marginBottom: '4px' 
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: reply.author === 'Guest User' ? '#3498db' : '#ddd',
                    marginRight: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: reply.author === 'Guest User' ? 'white' : '#666'
                  }}>
                    {reply.author.charAt(0)}
                  </div>
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: '12px',
                    color: reply.author === 'Guest User' ? '#2980b9' : '#333'
                  }}>
                    {reply.author}
                  </span>
                </div>
                
                <div style={{ fontSize: '13px' }}>{reply.text}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add reply input */}
        <div style={{ 
          display: 'flex',
          marginBottom: '8px'
        }}>
          <input 
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddReply()}
            placeholder="Add a reply..."
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              marginRight: '8px'
            }}
          />
          
          <button 
            onClick={handleAddReply}
            disabled={!replyText.trim()}
            style={{
              padding: '8px 12px',
              backgroundColor: replyText.trim() ? '#3498db' : '#f1f1f1',
              color: replyText.trim() ? 'white' : '#999',
              border: 'none',
              borderRadius: '4px',
              cursor: replyText.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Reply
          </button>
        </div>
        
        {/* Collaboration indicator */}
        {isCollaboratorPresent && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#3498db'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#3498db',
              marginRight: '8px',
              animation: 'pulse 2s infinite'
            }}></div>
            Guest User is viewing this comment
          </div>
        )}
      </div>
      
      {/* Add some CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default CollaborativeCommentBubble;