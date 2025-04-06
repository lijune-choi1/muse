// src/components/common/CollaborativeComment.jsx
import React, { useState, useEffect, useRef } from 'react';

const CollaborativeComment = ({ 
  content, 
  onContentChange,
  simulateCollaboration = false
}) => {
  const [text, setText] = useState(content || '');
  const [guestTyping, setGuestTyping] = useState(false);
  const [guestCursorPosition, setGuestCursorPosition] = useState(null);
  const [guestSelectionRange, setGuestSelectionRange] = useState(null);
  const textareaRef = useRef(null);
  
  // Update local state when content prop changes
  useEffect(() => {
    setText(content || '');
  }, [content]);
  
  // Handle local text changes
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    if (onContentChange) {
      onContentChange(newText);
    }
    
    // Simulate collaborative typing when enabled
    if (simulateCollaboration && !guestTyping) {
      setTimeout(() => {
        simulateGuestTyping();
      }, 500 + Math.random() * 1000);
    }
  };
  
  // Simulate guest typing behavior
  const simulateGuestTyping = () => {
    // Only start if we're not already simulating typing
    if (guestTyping) return;
    
    setGuestTyping(true);
    
    // Set initial cursor position
    let cursorPos = text.length > 0 ? 
      Math.floor(Math.random() * text.length) : 
      0;
    
    setGuestCursorPosition(cursorPos);
    
    // Randomly choose between typing or selecting
    const action = Math.random() > 0.7 ? 'select' : 'type';
    
    if (action === 'select') {
      // Simulate text selection
      const selStart = cursorPos;
      const selEnd = Math.min(
        text.length,
        selStart + 1 + Math.floor(Math.random() * 10)
      );
      
      setGuestSelectionRange({
        start: selStart,
        end: selEnd
      });
      
      // After a brief delay, simulate an edit
      setTimeout(() => {
        // Insert text at the selection point
        const newText = text.slice(0, selStart) + 
          " [edited by Guest] " + 
          text.slice(selEnd);
        
        setText(newText);
        if (onContentChange) {
          onContentChange(newText);
        }
        
        // Move cursor to after the insertion
        setGuestCursorPosition(selStart + 19); // Length of " [edited by Guest] "
        setGuestSelectionRange(null);
        
        // End typing simulation
        setTimeout(() => {
          setGuestTyping(false);
          setGuestCursorPosition(null);
        }, 800);
      }, 1000);
    } else {
      // Simulate typing
      const typingDuration = 1500 + Math.random() * 1000;
      const textToType = " [Guest typed this] ";
      let charIndex = 0;
      
      const typeChar = () => {
        if (charIndex >= textToType.length) {
          // Finished typing
          setTimeout(() => {
            setGuestTyping(false);
            setGuestCursorPosition(null);
          }, 500);
          return;
        }
        
        // Insert the next character
        const newText = text.slice(0, cursorPos) + 
          textToType.slice(0, charIndex + 1) + 
          text.slice(cursorPos);
        
        setText(newText);
        if (onContentChange) {
          onContentChange(newText);
        }
        
        // Update cursor position
        cursorPos++;
        setGuestCursorPosition(cursorPos);
        
        // Schedule next character
        charIndex++;
        setTimeout(typeChar, typingDuration / textToType.length);
      };
      
      // Start typing
      typeChar();
    }
  };
  
  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        style={{
          width: '100%',
          minHeight: '100px',
          padding: '8px',
          fontSize: '14px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          resize: 'vertical'
        }}
        placeholder="Type your comment here..."
      />
      
      {/* Render guest cursor and selection if active */}
      {(guestCursorPosition !== null || guestSelectionRange !== null) && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
        >
          {/* This is a simplified approach - in a real implementation, you would
              calculate pixel positions based on character indices */}
          
          {guestSelectionRange && (
            <div 
              style={{
                position: 'absolute',
                top: '8px', // Match textarea padding
                left: `${8 + guestSelectionRange.start * 8}px`, // Rough character width estimate
                width: `${(guestSelectionRange.end - guestSelectionRange.start) * 8}px`,
                height: '18px', // Approximate line height
                backgroundColor: 'rgba(52, 152, 219, 0.3)', // Light blue selection
                pointerEvents: 'none'
              }}
            />
          )}
          
          {guestCursorPosition !== null && (
            <div
              style={{
                position: 'absolute',
                top: '8px', // Match textarea padding
                left: `${8 + guestCursorPosition * 8}px`, // Rough character width estimate
                width: '2px',
                height: '18px', // Approximate line height
                backgroundColor: '#3498db', // Blue cursor
                animation: 'blink 1s step-end infinite',
                pointerEvents: 'none'
              }}
            />
          )}
        </div>
      )}
      
      {/* Guest typing indicator */}
      {guestTyping && (
        <div 
          style={{
            position: 'absolute',
            top: '-25px',
            left: '0',
            backgroundColor: 'rgba(52, 152, 219, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            animation: 'fadeInOut 2s ease-in-out infinite'
          }}
        >
          Guest is typing...
        </div>
      )}
      
      {/* Add some CSS animations */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CollaborativeComment;