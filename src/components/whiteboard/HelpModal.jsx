// src/components/whiteboard/HelpModal.jsx
import React from 'react';
import './HelpModal.css';

/**
 * Help modal that explains whiteboard features
 */
const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={e => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2 className="help-modal-title">Whiteboard Help</h2>
          <button 
            className="help-modal-close" 
            onClick={onClose}
            aria-label="Close help"
          >
            ×
          </button>
        </div>
        
        <div className="help-modal-body">
          <div className="help-section">
            <h3>Basic Navigation</h3>
            <ul>
              <li><strong>Pan:</strong> Right-click and drag or use middle mouse button</li>
              <li><strong>Zoom:</strong> Use zoom controls in bottom right or mouse wheel</li>
              <li><strong>Reset View:</strong> Click the "↺" button in zoom controls</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h3>Comment System</h3>
            <p>The comment system allows you to place comments directly on the whiteboard:</p>
            <ul>
              <li><strong>Add Comment:</strong> Select "Comment Mode" from the left toolbar and click on the whiteboard</li>
              <li><strong>Select Comment:</strong> Click on a comment to select and edit it</li>
              <li><strong>Types of Comments:</strong> Technical (red), Conceptual (blue), and Details (green)</li>
              <li><strong>Comment Clustering:</strong> Comments close together will cluster for better organization - click on a cluster to see all comments</li>
              <li><strong>Comment Linking:</strong> Connect related comments by clicking the link button on a comment and then clicking another comment</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h3>Comment Tracker</h3>
            <p>The sidebar on the right shows all comments and provides filtering:</p>
            <ul>
              <li><strong>Filter by Type:</strong> Use the tabs to filter by comment type</li>
              <li><strong>Search:</strong> Find comments containing specific text</li>
              <li><strong>Collapse/Expand:</strong> Use the toggle button on the left side of the tracker to collapse or expand it</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h3>Annotation Mode</h3>
            <p>Draw directly on the whiteboard to highlight or mark areas:</p>
            <ul>
              <li><strong>Access:</strong> Select "Annotate Mode" from the left toolbar</li>
              <li><strong>Colors:</strong> Choose from available colors in the annotation controls</li>
              <li><strong>Stroke Width:</strong> Adjust the thickness of your drawing</li>
              <li><strong>Clear:</strong> Clear your annotations using the Clear button</li>
            </ul>
            <p><em>Note: Other users' annotations will appear with their name and a dashed line style.</em></p>
          </div>
          
          <div className="help-section">
            <h3>Real-Time Collaboration</h3>
            <p>Work together with others in real-time:</p>
            <ul>
              <li><strong>Cursor Tracking:</strong> See other users' cursors as they move around the whiteboard</li>
              <li><strong>Live Comments:</strong> Comments appear as others add them</li>
              <li><strong>Live Annotations:</strong> See annotations from other users as they draw</li>
              <li><strong>Comment Linking:</strong> Watch as others create connections between comments</li>
            </ul>
            <p>The indicator at the bottom of the screen shows how many users are currently active.</p>
          </div>
          
          <div className="help-section">
            <h3>Keyboard Shortcuts</h3>
            <table className="shortcuts-table">
              <tbody>
                <tr>
                  <td><kbd>Space</kbd> + drag</td>
                  <td>Pan the whiteboard</td>
                </tr>
                <tr>
                  <td><kbd>+</kbd> / <kbd>-</kbd></td>
                  <td>Zoom in / out</td>
                </tr>
                <tr>
                  <td><kbd>0</kbd></td>
                  <td>Reset zoom to 100%</td>
                </tr>
                <tr>
                  <td><kbd>C</kbd></td>
                  <td>Switch to Comment Mode</td>
                </tr>
                <tr>
                  <td><kbd>A</kbd></td>
                  <td>Switch to Annotation Mode</td>
                </tr>
                <tr>
                  <td><kbd>S</kbd></td>
                  <td>Switch to Select Mode</td>
                </tr>
                <tr>
                  <td><kbd>Esc</kbd></td>
                  <td>Cancel current action or deselect</td>
                </tr>
                <tr>
                  <td><kbd>Del</kbd></td>
                  <td>Delete selected comment</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="help-modal-footer">
          <button className="help-modal-button" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;