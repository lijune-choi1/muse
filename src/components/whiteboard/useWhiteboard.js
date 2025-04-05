import { useState } from 'react';

const useWhiteboardState = () => {
  // View state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Mode
  const [mode, setMode] = useState('select'); // 'select', 'stamp', etc.

  // Stamps
  const [stamps, setStamps] = useState([]);

  // Comments
  const [comments, setComments] = useState([]);

  // Comment selections
  const [selectedCommentId, setSelectedComment] = useState(null);
  const [editingCommentId, setEditingComment] = useState(null);
  const [expandedCommentId, setExpandedComment] = useState(null);
  const [hoveredCommentId, setHoveredComment] = useState(null);

  // Score
  const [score, setScore] = useState({
    technical: 0,
    conceptual: 0,
    details: 0,
    total: 0
  });

  // Stamp selection
  const [selectedStampId, setSelectedStamp] = useState(null);

  // Functions
  const zoomIn = () => setZoomLevel((z) => Math.min(z + 0.1, 3));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 0.1, 0.5));
  const resetZoom = () => setZoomLevel(1);

  const panBy = (dx, dy) => {
    setPan((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  };

  const addStamp = (stamp) => setStamps((prev) => [...prev, stamp]);
  const addComment = (comment) => setComments((prev) => [...prev, comment]);
  const selectStamp = (id) => setSelectedStamp(id);

  return {
    zoomLevel,
    setZoomLevel,
    pan,
    setPan,
    mode,
    setMode,
    stamps,
    setStamps,
    comments,
    setComments,
    selectedStampId,
    setSelectedStamp,
    selectedCommentId,
    setSelectedComment,
    editingCommentId,
    setEditingComment,
    expandedCommentId,
    setExpandedComment,
    hoveredCommentId,
    setHoveredComment,
    zoomIn,
    zoomOut,
    resetZoom,
    panBy,
    addStamp,
    addComment,
    selectStamp,
    score,
    setScore
  };
};

export default useWhiteboardState;
