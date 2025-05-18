// CommentBubble.jsx with proper user name display
import React, { useState, useEffect, useRef } from 'react';
import './CommentBubble.css';

// Simple SVG Icon component
const Icon = ({ type, size = 16, color = "currentColor" }) => {
  const icons = {
    check: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    ),
    x: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    ),
    edit: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    ),
    trash: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    ),
    message: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
    thumbsUp: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
      </svg>
    ),
    thumbsDown: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm10-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
      </svg>
    ),
    send: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    ),
    link: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
    )
  };

  return icons[type] || null;
};

const CommentBubble = ({ 
  comment, 
  onContentChange, 
  onBlur, 
  onTypeChange, 
  onDelete,
  onClose,
  onReactionChange,
  onReplyAdd,
  userProfile,
  displayMode = 'hover'
}) => {
  // Main state
  const [localDisplayMode, setLocalDisplayMode] = useState(displayMode);
  const [localComment, setLocalComment] = useState({
    ...comment,
    text: comment.content || comment.text || "",
    reactions: comment.reactions || { agreed: 0, disagreed: 0 },
    replies: comment.replies || []
  });
  
  const bubbleRef = useRef(null);
  
  // Update local display mode when prop changes
  useEffect(() => {
    setLocalDisplayMode(displayMode);
  }, [displayMode]);
  
  // Additional states
  const [userReacted, setUserReacted] = useState({ 
    agreed: comment.userReacted?.agreed || false, 
    disagreed: comment.userReacted?.disagreed || false 
  });
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");

  // Category colors and labels
  const categoryInfo = {
    'technical': {
      color: '#ff4136',
      label: 'Technical'
    },
    'conceptual': {
      color: '#0074D9',
      label: 'Conceptual'
    },
    'details': {
      color: '#2ECC40',
      label: 'Details'
    }
  };

  // Get current category info or default to technical
  const currentCategory = categoryInfo[localComment.type?.toLowerCase()] || categoryInfo.technical;

  // Handle double-click to edit
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setLocalDisplayMode('edit');
  };

  // Handle click on comment bubble
  const handleClick = (e) => {
    e.stopPropagation();
    if (localDisplayMode === 'hover') {
      setLocalDisplayMode('expanded');
    }
  };

  // Handle mouse enter on the bubble itself
  const handleBubbleMouseEnter = (e) => {
    // Keep the bubble visible when mouse enters it
    e.stopPropagation();
  };

  // Handle saving edits
  const handleSave = () => {
    onContentChange(localComment.id, localComment.text);
    onTypeChange(localComment.id, localComment.type);
    setLocalDisplayMode('expanded');
  };

  // Handle canceling edits
  const handleCancel = () => {
    setLocalComment({
      ...comment,
      text: comment.content || comment.text || ""
    });
    setLocalDisplayMode('expanded');
  };

  // Cycle through comment types on right-click
  const handleTypeChange = (e) => {
    e.preventDefault();
    const types = ['technical', 'conceptual', 'details'];
    const currentIndex = types.indexOf(localComment.type?.toLowerCase() || 'technical');
    const nextIndex = (currentIndex + 1) % types.length;
    
    setLocalComment(prev => ({
      ...prev,
      type: types[nextIndex]
    }));
  };
  
  // Handle reaction clicks (agree/disagree)
  const handleReaction = (type) => {
    // Toggle the reaction
    const newReacted = { ...userReacted };
    
    if (type === 'agreed') {
      newReacted.agreed = !newReacted.agreed;
      // If user disagrees and now agrees, remove disagree
      if (newReacted.agreed && newReacted.disagreed) {
        newReacted.disagreed = false;
      }
    } else if (type === 'disagreed') {
      newReacted.disagreed = !newReacted.disagreed;
      // If user agrees and now disagrees, remove agree
      if (newReacted.disagreed && newReacted.agreed) {
        newReacted.agreed = false;
      }
    }
    
    setUserReacted(newReacted);
    
    // Update reaction counts
    const newReactions = { ...localComment.reactions };
    
    // Calculate the deltas based on previous state change
    if (type === 'agreed') {
      newReactions.agreed = newReactions.agreed + (newReacted.agreed ? 1 : -1);
      if (newReacted.agreed && userReacted.disagreed) {
        newReactions.disagreed--;
      }
    } else if (type === 'disagreed') {
      newReactions.disagreed = newReactions.disagreed + (newReacted.disagreed ? 1 : -1);
      if (newReacted.disagreed && userReacted.agreed) {
        newReactions.agreed--;
      }
    }
    
    // Ensure counts don't go below 0
    newReactions.agreed = Math.max(0, newReactions.agreed);
    newReactions.disagreed = Math.max(0, newReactions.disagreed);
    
    // Update local state
    setLocalComment(prev => ({
      ...prev,
      reactions: newReactions
    }));
    
    // Call the onReactionChange callback if provided
    if (onReactionChange) {
      onReactionChange(localComment.id, {
        reactions: newReactions,
        userReacted: newReacted
      });
    }
  };
  
  // Handle adding a reply
  const handleAddReply = () => {
    if (!replyText.trim()) return;
    
    const newReply = {
      id: `reply-${Date.now()}`,
      author: userProfile?.name || "Anonymous",
      avatar: userProfile?.avatar || "/assets/images/default-avatar.png",
      content: replyText,
      timestamp: new Date().toISOString()
    };
    
    const updatedReplies = [...localComment.replies, newReply];
    
    setLocalComment(prev => ({
      ...prev,
      replies: updatedReplies
    }));
    
    // Clear input and show replies
    setReplyText("");
    setShowReplies(true);
    
    // Call the onReplyAdd callback if provided
    if (onReplyAdd) {
      onReplyAdd(localComment.id, newReply, updatedReplies);
    }
  };
  
  // Format timestamp for display
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000; // diff in seconds
    
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    
    return date.toLocaleDateString();
  };

  // Truncate text for hover view
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "No content";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // Determine user profile information - use the comment author name when available,
  // fallback to the current user's name, or use Anonymous as last resort
  
  // Get current user name from multiple sources
  const getCurrentUser = () => {
    // Check window global (set by our fixJaneDoe script)
    if (window.currentUserName) {
      return window.currentUserName;
    }
    
    // Check localStorage (set by CommentService)
    if (localStorage.getItem('currentUserName')) {
      return localStorage.getItem('currentUserName');
    }
    
    // Check Firebase auth if available 
    if (window.firebase?.auth?.currentUser?.displayName) {
      return window.firebase.auth.currentUser.displayName;
    }
    
    // Return userProfile name or default
    return userProfile?.name || "Current User";
  };
  
  // Never use Jane Doe!
  let commentAuthor = comment.author && comment.author !== "Jane Doe" 
    ? comment.author 
    : getCurrentUser();
    
  let userName = commentAuthor;
  
  const userAvatar = comment.avatar || userProfile?.avatar || "/assets/images/default-avatar.png";
  
  console.log("Current user name being displayed:", userName);
  
  // Check if comment has replies
  const hasReplies = localComment.replies && localComment.replies.length > 0;

  // Rendering based on display mode
  let bubbleContent;
  let bubbleClass = "comment-bubble";

  // Add the appropriate class based on display mode
  switch (localDisplayMode) {
    case 'hover':
      bubbleClass += " hover-state";
      break;
    case 'expanded':
      bubbleClass += " expanded";
      break;
    case 'edit':
      bubbleClass += " edit-mode";
      break;
    default:
      bubbleClass += " hover-state";
  }

  // Generate content based on display mode
  if (localDisplayMode === 'hover') {
    // Hover mode - show minimal info
    bubbleContent = (
      <>
        <div className="user-section">
          <img 
            src={userAvatar}
            alt={userName} 
            className="user-icon" 
          />
          <div 
            className={`comment-type-pill ${localComment.type}`} 
            style={{backgroundColor: currentCategory.color}}
          >
            {currentCategory.label}
          </div>
        </div>
        <div className="comment-text">{truncateText(localComment.text)}</div>
        <div className="hover-reactions">
          {localComment.reactions.agreed > 0 && (
            <span className="hover-reaction">
              <Icon type="thumbsUp" size={14} /> {localComment.reactions.agreed}
            </span>
          )}
          {localComment.reactions.disagreed > 0 && (
            <span className="hover-reaction">
              <Icon type="thumbsDown" size={14} /> {localComment.reactions.disagreed}
            </span>
          )}
          {hasReplies && (
            <span className="hover-reaction">
              <Icon type="message" size={14} /> {localComment.replies.length}
            </span>
          )}
        </div>
        <div className="hover-message">Click to expand</div>
      </>
    );
  } else if (localDisplayMode === 'edit') {
    // Edit mode
    bubbleContent = (
      <>
        <div className="comment-bubble-header">
          <div className="user-section">
            <img 
              src={userAvatar}
              alt={userName} 
              className="user-icon" 
            />
            <span>{userName}</span>
          </div>
          <div className="header-actions">
            <span className="header-title">Edit</span>
            <button 
              className="close-button"
              onClick={handleCancel}
            >
              <Icon type="x" size={16} />
            </button>
          </div>
        </div>
        <div className="comment-edit-container">
          <div 
            className="type-selector"
            onContextMenu={handleTypeChange}
            title="Right-click to cycle comment types"
          >
            <select 
              className="comment-type-select"
              value={localComment.type || "technical"}
              onChange={(e) => setLocalComment(prev => ({
                ...prev, 
                type: e.target.value.toLowerCase()
              }))}
              style={{ backgroundColor: currentCategory.color }}
            >
              <option value="technical">Technical</option>
              <option value="conceptual">Conceptual</option>
              <option value="details">Details</option>
            </select>
          </div>
          <textarea
            className="comment-textarea"
            value={localComment.text}
            onChange={(e) => setLocalComment(prev => ({
              ...prev, 
              text: e.target.value
            }))}
            autoFocus
            placeholder="Enter your comment..."
          />
          <div className="comment-edit-actions">
            <button 
              className="save-button"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </>
    );
  } else {
    // Expanded view mode
    bubbleContent = (
      <>
        {/* Show thread badge if comment has replies */}
        {hasReplies && (
          <div className="thread-badge">
            {localComment.replies.length}
          </div>
        )}
      
        <div 
          className="comment-bubble-header"
          onContextMenu={handleTypeChange}
        >
          <div className="user-section">
            <img 
              src={userAvatar}
              alt={userName} 
              className="user-icon" 
            />
            <span>{userName}</span>
          </div>
          <div 
            className={`comment-type-pill ${localComment.type}`} 
            style={{backgroundColor: currentCategory.color}}
            title="Right-click to cycle comment types"
          >
            {currentCategory.label}
          </div>
          <div className="header-actions">
            <button 
              className="edit-button"
              onClick={(e) => {
                e.stopPropagation();
                setLocalDisplayMode('edit');
              }}
              title="Edit comment"
            >
              <Icon type="edit" size={16} />
            </button>
            <button 
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(localComment.id);
              }}
              title="Delete comment"
            >
              <Icon type="trash" size={16} />
            </button>
            <button 
              className="close-button"
              onClick={(e) => {
                e.stopPropagation();
                if (onClose) onClose();
              }}
            >
              <Icon type="x" size={16} />
            </button>
          </div>
        </div>
        
        <div className="comment-content">
          {localComment.text || "No content provided"}
        </div>
        
        {/* Reaction buttons (Agree/Disagree) */}
        <div className="comment-reactions">
          <button 
            className={`reaction-button agreed ${userReacted.agreed ? 'active' : ''}`}
            onClick={() => handleReaction('agreed')}
          >
            <Icon type="thumbsUp" size={14} /> Agree
            {localComment.reactions.agreed > 0 && (
              <span className="reaction-count-comment">{localComment.reactions.agreed}</span>
            )}
          </button>
          
          <button 
            className={`reaction-button disagreed ${userReacted.disagreed ? 'active' : ''}`}
            onClick={() => handleReaction('disagreed')}
          >
            <Icon type="thumbsDown" size={14} /> Disagree
            {localComment.reactions.disagreed > 0 && (
              <span className="reaction-count-comment">{localComment.reactions.disagreed}</span>
            )}
          </button>
          
          <button 
            className="reaction-button reply"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? "Hide Replies" : (
              <>
                <Icon type="message" size={14} /> Reply
                {hasReplies && !showReplies && (
                  <span className="reaction-count-comment">{localComment.replies.length}</span>
                )}
              </>
            )}
          </button>
        </div>
        
        {/* Replies section */}
        <div className={`comment-replies ${showReplies ? 'expanded' : ''}`}>
          {/* Existing replies */}
          {localComment.replies && localComment.replies.map(reply => (
            <div key={reply.id} className="reply-item">
              <div className="reply-header">
                <img 
                  src={reply.avatar || userAvatar}
                  alt={reply.author} 
                  className="reply-avatar" 
                />
                <span className="reply-author">{reply.author}</span>
                <span className="reply-time">{formatTime(reply.timestamp)}</span>
              </div>
              <div className="reply-content">
                {reply.content}
              </div>
            </div>
          ))}
          
          {/* Reply input */}
          <div className="reply-input-container">
            <input
              type="text"
              className="reply-input"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Add a reply..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddReply()}
            />
            <button 
              className="reply-submit"
              onClick={handleAddReply}
            >
              <Icon type="send" size={14} />
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div 
      ref={bubbleRef}
      className={bubbleClass} 
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleBubbleMouseEnter}
    >
      {bubbleContent}
    </div>
  );
};

export default CommentBubble;