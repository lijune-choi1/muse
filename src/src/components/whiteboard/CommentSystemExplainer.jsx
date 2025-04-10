// src/components/common/CommentSystemExplainer.jsx
import React, { useState, useEffect } from 'react';

const CommentSystemExplainer = ({ onDismiss }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [closing, setClosing] = useState(false);

  // Steps to explain the comment system
  const steps = [
    { title: "Welcome to the Comment System", description: "Here's how to use comments in the whiteboard..." },
    { title: "Hover to Preview", description: "Hover over comment tags to quickly see their content." },
    { title: "Click to Expand", description: "Click on a comment to see reactions and replies." },
    { title: "Double-click to Edit", description: "Double-click on a comment tag to edit the comment." },
    { title: "Link Comments", description: "Use the link button to connect related comments." }
  ];

  // Auto-advance through steps
  useEffect(() => {
    if (closing) return;
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        // If we're at the last step, start closing animation
        if (prev >= steps.length - 1) {
          setClosing(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1000); // Change step every second
    
    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      setClosing(true);
      // Wait for closing animation to finish
      setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 500);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(dismissTimer);
    };
  }, [steps.length, onDismiss, closing]);

  // Handle manual dismiss
  const handleDismiss = () => {
    setClosing(true);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 500);
  };

  return (
    <div 
      className={`comment-system-explainer ${closing ? 'closing' : ''}`}
      onClick={handleDismiss}
    >
      <div className="explainer-content" onClick={e => e.stopPropagation()}>
        <div className="explainer-header">
          <h3>{steps[currentStep].title}</h3>
          <button className="close-button" onClick={handleDismiss}>✕</button>
        </div>
        
        <div className="explainer-steps">
          <div className="step-content">
            <p>{steps[currentStep].description}</p>
          </div>
          
          <div className="step-progress">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`step-dot ${index === currentStep ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .comment-system-explainer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 1;
          transition: opacity 0.5s ease;
        }
        
        .comment-system-explainer.closing {
          opacity: 0;
        }
        
        .explainer-content {
          background: white;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          transform: translateY(0);
          transition: transform 0.5s ease;
        }
        
        .comment-system-explainer.closing .explainer-content {
          transform: translateY(20px);
        }
        
        .explainer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 20px;
          background: #333;
          color: white;
        }
        
        .explainer-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }
        
        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }
        
        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .explainer-steps {
          padding: 20px;
        }
        
        .step-content {
          min-height: 60px;
          display: flex;
          align-items: center;
        }
        
        .step-content p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          color: #333;
        }
        
        .step-progress {
          display: flex;
          justify-content: center;
          margin-top: 20px;
          gap: 8px;
        }
        
        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ddd;
          transition: background 0.3s, transform 0.3s;
        }
        
        .step-dot.active {
          background: #333;
          transform: scale(1.3);
        }
      `}</style>
    </div>
  );
};

export default CommentSystemExplainer;