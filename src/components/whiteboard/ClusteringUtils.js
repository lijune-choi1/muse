// src/utils/ClusteringUtils.js

/**
 * Groups comments into clusters based on their proximity
 * @param {Array} comments - Array of comment objects with position data
 * @param {Number} threshold - Distance threshold for clustering (in pixels)
 * @param {Number} zoom - Current zoom level
 * @returns {Array} Array of cluster objects
 */
export const clusterComments = (comments, threshold = 30, zoom = 1) => {
  if (!comments || comments.length === 0) return [];
  
  // Adjusted threshold based on zoom level (closer when zoomed in)
  const adjustedThreshold = threshold / zoom;
  
  // Initialize clusters array
  const clusters = [];
  
  // Track which comments have been assigned to clusters
  const assignedComments = new Set();
  
  // First pass: create initial clusters
  comments.forEach((comment, index) => {
    // Skip if already assigned to a cluster
    if (assignedComments.has(comment.id)) return;
    
    // Create a new cluster with this comment
    const cluster = {
      id: `cluster-${Date.now()}-${index}`,
      comments: [comment],
      position: { ...comment.position } // Start with this comment's position
    };
    
    // Mark as assigned
    assignedComments.add(comment.id);
    
    // Look for nearby comments to add to this cluster
    comments.forEach(otherComment => {
      // Skip if it's the same comment or already in a cluster
      if (otherComment.id === comment.id || assignedComments.has(otherComment.id)) return;
      
      // Calculate distance between comments
      const distance = calculateDistance(comment.position, otherComment.position);
      
      // If within threshold, add to cluster
      if (distance <= adjustedThreshold) {
        cluster.comments.push(otherComment);
        assignedComments.add(otherComment.id);
        
        // Update cluster position (average of all comments)
        cluster.position = calculateAveragePosition(cluster.comments);
      }
    });
    
    // Only add clusters with multiple comments
    if (cluster.comments.length > 1) {
      clusters.push(cluster);
    }
  });
  
  // Second pass: add singleton clusters for comments not assigned to any cluster
  comments.forEach(comment => {
    if (!assignedComments.has(comment.id)) {
      clusters.push({
        id: `singleton-${comment.id}`,
        comments: [comment],
        position: { ...comment.position }
      });
      assignedComments.add(comment.id);
    }
  });
  
  return clusters;
};

/**
 * Calculates the Euclidean distance between two points
 */
export const calculateDistance = (point1, point2) => {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculates the average position of multiple points
 */
export const calculateAveragePosition = (comments) => {
  if (!comments || comments.length === 0) return { x: 0, y: 0 };
  
  const sum = comments.reduce((acc, comment) => {
    return {
      x: acc.x + comment.position.x,
      y: acc.y + comment.position.y
    };
  }, { x: 0, y: 0 });
  
  return {
    x: sum.x / comments.length,
    y: sum.y / comments.length
  };
};

/**
 * Creates a mapping of comment IDs to their clusters
 * to quickly determine which cluster a comment belongs to
 */
export const createCommentToClusterMap = (clusters) => {
  const map = new Map();
  
  clusters.forEach(cluster => {
    cluster.comments.forEach(comment => {
      map.set(comment.id, cluster.id);
    });
  });
  
  return map;
};

/**
 * Determines if a cluster is singleton (just one comment)
 */
export const isSingletonCluster = (cluster) => {
  return cluster && cluster.comments && cluster.comments.length === 1;
};