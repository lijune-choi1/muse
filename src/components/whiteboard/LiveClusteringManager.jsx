// src/components/whiteboard/LiveClusteringManager.jsx
// Dedicated component for managing real-time clustering and linking
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';
import firebase from '../../services/firebase';

const LiveClusteringManager = ({
  postId,
  comments,
  userProfile,
  clusteringEnabled,
  clusterThreshold,
  onClustersUpdate,
  onGlobalLinksUpdate,
  onClusteringConfigUpdate,
  enableRealTimeSync = true
}) => {
  const dbRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStatus, setSyncStatus] = useState('initializing');
  
  // Local state for managing clustering data
  const [localClusters, setLocalClusters] = useState([]);
  const [localGlobalLinks, setLocalGlobalLinks] = useState([]);
  const [lastClusterCalculation, setLastClusterCalculation] = useState(0);
  
  // Debounce timer for cluster recalculation
  const clusterCalculationTimer = useRef(null);

  // Initialize Firebase database reference
  useEffect(() => {
    if (!enableRealTimeSync) return;
    
    try {
      dbRef.current = getDatabase(firebase.app);
      setIsInitialized(true);
      setSyncStatus('connected');
      console.log('LiveClusteringManager: Firebase initialized');
    } catch (error) {
      console.error('LiveClusteringManager: Failed to initialize Firebase:', error);
      setSyncStatus('error');
    }
  }, [enableRealTimeSync]);

  // Calculate clusters based on proximity
  const calculateClusters = useCallback((commentsArray, threshold) => {
    if (!Array.isArray(commentsArray) || commentsArray.length === 0) {
      return [];
    }

    const clusters = [];
    const processed = new Set();
    
    commentsArray.forEach((comment) => {
      if (processed.has(comment.id) || !comment.position) return;
      
      const cluster = {
        id: `cluster_${comment.id}`,
        commentIds: [comment.id],
        center: { ...comment.position },
        bounds: {
          minX: comment.position.x,
          maxX: comment.position.x,
          minY: comment.position.y,
          maxY: comment.position.y
        },
        createdAt: Date.now(),
        createdBy: userProfile?.id || 'unknown'
      };
      
      // Find nearby comments
      commentsArray.forEach((otherComment) => {
        if (otherComment.id === comment.id || processed.has(otherComment.id) || !otherComment.position) return;
        
        const distance = Math.sqrt(
          Math.pow(comment.position.x - otherComment.position.x, 2) +
          Math.pow(comment.position.y - otherComment.position.y, 2)
        );
        
        if (distance <= threshold) {
          cluster.commentIds.push(otherComment.id);
          processed.add(otherComment.id);
          
          // Update cluster bounds
          cluster.bounds.minX = Math.min(cluster.bounds.minX, otherComment.position.x);
          cluster.bounds.maxX = Math.max(cluster.bounds.maxX, otherComment.position.x);
          cluster.bounds.minY = Math.min(cluster.bounds.minY, otherComment.position.y);
          cluster.bounds.maxY = Math.max(cluster.bounds.maxY, otherComment.position.y);
        }
      });
      
      // Update cluster center
      if (cluster.commentIds.length > 1) {
        cluster.center = {
          x: (cluster.bounds.minX + cluster.bounds.maxX) / 2,
          y: (cluster.bounds.minY + cluster.bounds.maxY) / 2
        };
      }
      
      processed.add(comment.id);
      
      // Only add clusters with multiple comments
      if (cluster.commentIds.length > 1) {
        clusters.push(cluster);
      }
    });
    
    return clusters;
  }, [userProfile]);

  // Extract global links from comments
  const extractGlobalLinks = useCallback((commentsArray) => {
    const globalLinks = [];
    const processedPairs = new Set();
    
    commentsArray.forEach((comment) => {
      if (!comment.links || !Array.isArray(comment.links)) return;
      
      comment.links.forEach((linkedCommentId) => {
        const linkedComment = commentsArray.find(c => c.id === linkedCommentId);
        if (!linkedComment) return;
        
        // Create a unique identifier for this link pair
        const pairId = [comment.id, linkedCommentId].sort().join('-');
        if (processedPairs.has(pairId)) return;
        
        processedPairs.add(pairId);
        
        globalLinks.push({
          id: `link_${pairId}`,
          sourceId: comment.id,
          targetId: linkedCommentId,
          sourcePosition: comment.position,
          targetPosition: linkedComment.position,
          createdAt: Date.now(),
          createdBy: userProfile?.id || 'unknown'
        });
      });
    });
    
    return globalLinks;
  }, [userProfile]);

  // Debounced cluster calculation
  const debouncedClusterCalculation = useCallback((commentsArray, threshold) => {
    if (clusterCalculationTimer.current) {
      clearTimeout(clusterCalculationTimer.current);
    }
    
    clusterCalculationTimer.current = setTimeout(() => {
      if (!clusteringEnabled) {
        setLocalClusters([]);
        onClustersUpdate([]);
        return;
      }
      
      console.log('LiveClusteringManager: Calculating clusters for', commentsArray.length, 'comments');
      
      const newClusters = calculateClusters(commentsArray, threshold);
      const newGlobalLinks = extractGlobalLinks(commentsArray);
      
      setLocalClusters(newClusters);
      setLocalGlobalLinks(newGlobalLinks);
      setLastClusterCalculation(Date.now());
      
      // Update parent components
      onClustersUpdate(newClusters);
      onGlobalLinksUpdate(newGlobalLinks);
      
      // Sync to Firebase if enabled
      if (enableRealTimeSync && dbRef.current && postId) {
        syncClustersToFirebase(newClusters);
        syncGlobalLinksToFirebase(newGlobalLinks);
      }
    }, 300); // 300ms debounce
  }, [clusteringEnabled, calculateClusters, extractGlobalLinks, onClustersUpdate, onGlobalLinksUpdate, enableRealTimeSync, postId]);

  // Sync clusters to Firebase
  const syncClustersToFirebase = useCallback(async (clusters) => {
    if (!dbRef.current || !postId) return;
    
    try {
      const clustersRef = ref(dbRef.current, `whiteboards/${postId}/clusters`);
      const clustersData = {};
      
      clusters.forEach((cluster, index) => {
        clustersData[cluster.id || `cluster_${index}`] = cluster;
      });
      
      await set(clustersRef, clustersData);
      console.log('LiveClusteringManager: Synced', clusters.length, 'clusters to Firebase');
      setSyncStatus('synced');
      
    } catch (error) {
      console.error('LiveClusteringManager: Failed to sync clusters:', error);
      setSyncStatus('error');
    }
  }, [postId]);

  // Sync global links to Firebase
  const syncGlobalLinksToFirebase = useCallback(async (links) => {
    if (!dbRef.current || !postId) return;
    
    try {
      const linksRef = ref(dbRef.current, `whiteboards/${postId}/globalLinks`);
      const linksData = {};
      
      links.forEach((link, index) => {
        linksData[link.id || `link_${index}`] = link;
      });
      
      await set(linksRef, linksData);
      console.log('LiveClusteringManager: Synced', links.length, 'global links to Firebase');
      
    } catch (error) {
      console.error('LiveClusteringManager: Failed to sync global links:', error);
      setSyncStatus('error');
    }
  }, [postId]);

  // Sync clustering configuration to Firebase
  const syncClusteringConfig = useCallback(async (enabled, threshold) => {
    if (!dbRef.current || !postId) return;
    
    try {
      const configRef = ref(dbRef.current, `whiteboards/${postId}/clustering`);
      const config = {
        enabled,
        threshold,
        lastUpdated: Date.now(),
        updatedBy: userProfile?.id || 'unknown'
      };
      
      await set(configRef, config);
      console.log('LiveClusteringManager: Synced clustering config:', config);
      
    } catch (error) {
      console.error('LiveClusteringManager: Failed to sync clustering config:', error);
    }
  }, [postId, userProfile]);

  // Listen for clustering configuration changes from Firebase
  useEffect(() => {
    if (!isInitialized || !postId || !enableRealTimeSync) return;

    const clusteringConfigRef = ref(dbRef.current, `whiteboards/${postId}/clustering`);
    
    const unsubscribe = onValue(clusteringConfigRef, (snapshot) => {
      if (snapshot.exists()) {
        const config = snapshot.val();
        console.log('LiveClusteringManager: Received clustering config update:', config);
        onClusteringConfigUpdate(config);
      }
    }, (error) => {
      console.error('LiveClusteringManager: Error listening to clustering config:', error);
    });

    return () => unsubscribe();
  }, [isInitialized, postId, enableRealTimeSync, onClusteringConfigUpdate]);

  // Listen for clusters changes from Firebase
  useEffect(() => {
    if (!isInitialized || !postId || !enableRealTimeSync) return;

    const clustersRef = ref(dbRef.current, `whiteboards/${postId}/clusters`);
    
    const unsubscribe = onValue(clustersRef, (snapshot) => {
      if (snapshot.exists()) {
        const clustersData = snapshot.val();
        const clustersArray = Object.values(clustersData);
        console.log('LiveClusteringManager: Received clusters update:', clustersArray.length, 'clusters');
        
        setLocalClusters(clustersArray);
        onClustersUpdate(clustersArray);
        setSyncStatus('synced');
      } else {
        setLocalClusters([]);
        onClustersUpdate([]);
      }
    }, (error) => {
      console.error('LiveClusteringManager: Error listening to clusters:', error);
      setSyncStatus('error');
    });

    return () => unsubscribe();
  }, [isInitialized, postId, enableRealTimeSync, onClustersUpdate]);

  // Listen for global links changes from Firebase
  useEffect(() => {
    if (!isInitialized || !postId || !enableRealTimeSync) return;

    const linksRef = ref(dbRef.current, `whiteboards/${postId}/globalLinks`);
    
    const unsubscribe = onValue(linksRef, (snapshot) => {
      if (snapshot.exists()) {
        const linksData = snapshot.val();
        const linksArray = Object.values(linksData);
        console.log('LiveClusteringManager: Received global links update:', linksArray.length, 'links');
        
        setLocalGlobalLinks(linksArray);
        onGlobalLinksUpdate(linksArray);
      } else {
        setLocalGlobalLinks([]);
        onGlobalLinksUpdate([]);
      }
    }, (error) => {
      console.error('LiveClusteringManager: Error listening to global links:', error);
    });

    return () => unsubscribe();
  }, [isInitialized, postId, enableRealTimeSync, onGlobalLinksUpdate]);

  // Recalculate clusters when comments, clustering settings, or threshold change
  useEffect(() => {
    if (!Array.isArray(comments)) return;
    
    console.log('LiveClusteringManager: Comments or settings changed, recalculating clusters');
    debouncedClusterCalculation(comments, clusterThreshold);
    
    // Cleanup timer on unmount
    return () => {
      if (clusterCalculationTimer.current) {
        clearTimeout(clusterCalculationTimer.current);
      }
    };
  }, [comments, clusterThreshold, debouncedClusterCalculation]);

  // Sync clustering configuration when settings change
  useEffect(() => {
    if (!isInitialized || !enableRealTimeSync) return;
    
    console.log('LiveClusteringManager: Syncing clustering config changes');
    syncClusteringConfig(clusteringEnabled, clusterThreshold);
  }, [clusteringEnabled, clusterThreshold, isInitialized, enableRealTimeSync, syncClusteringConfig]);

  // Exposed methods for external use
  const exposedMethods = {
    // Force recalculation of clusters
    recalculateClusters: () => {
      if (Array.isArray(comments)) {
        debouncedClusterCalculation(comments, clusterThreshold);
      }
    },
    
    // Get current clustering statistics
    getClusteringStats: () => ({
      clustersCount: localClusters.length,
      globalLinksCount: localGlobalLinks.length,
      lastCalculation: lastClusterCalculation,
      syncStatus,
      isEnabled: clusteringEnabled
    }),
    
    // Add a new link between comments
    addGlobalLink: async (sourceCommentId, targetCommentId) => {
      if (!comments || !Array.isArray(comments)) return;
      
      const sourceComment = comments.find(c => c.id === sourceCommentId);
      const targetComment = comments.find(c => c.id === targetCommentId);
      
      if (!sourceComment || !targetComment) {
        console.warn('LiveClusteringManager: Source or target comment not found for linking');
        return;
      }
      
      const newLink = {
        id: `link_${sourceCommentId}_${targetCommentId}`,
        sourceId: sourceCommentId,
        targetId: targetCommentId,
        sourcePosition: sourceComment.position,
        targetPosition: targetComment.position,
        createdAt: Date.now(),
        createdBy: userProfile?.id || 'unknown'
      };
      
      const updatedLinks = [...localGlobalLinks, newLink];
      setLocalGlobalLinks(updatedLinks);
      onGlobalLinksUpdate(updatedLinks);
      
      if (enableRealTimeSync) {
        await syncGlobalLinksToFirebase(updatedLinks);
      }
    },
    
    // Remove a link between comments
    removeGlobalLink: async (sourceCommentId, targetCommentId) => {
      const updatedLinks = localGlobalLinks.filter(link => 
        !((link.sourceId === sourceCommentId && link.targetId === targetCommentId) ||
          (link.sourceId === targetCommentId && link.targetId === sourceCommentId))
      );
      
      setLocalGlobalLinks(updatedLinks);
      onGlobalLinksUpdate(updatedLinks);
      
      if (enableRealTimeSync) {
        await syncGlobalLinksToFirebase(updatedLinks);
      }
    }
  };

  // Status indicator component (optional)
  const StatusIndicator = () => {
    if (!enableRealTimeSync) return null;
    
    const statusColors = {
      initializing: '#ff9800',
      connected: '#4caf50',
      synced: '#2196f3',
      error: '#f44336'
    };
    
    return (
      <div style={{
        position: 'fixed',
        top: '60px',
        right: '20px',
        background: statusColors[syncStatus] || '#666',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'white',
          animation: syncStatus === 'synced' ? 'pulse 2s infinite' : 'none'
        }}></div>
        LiveClustering: {syncStatus}
        {clusteringEnabled && (
          <span style={{ marginLeft: '4px', fontSize: '10px' }}>
            {localClusters.length}c • {localGlobalLinks.length}l
          </span>
        )}
      </div>
    );
  };

  // Export methods via callback
  useEffect(() => {
    if (typeof onClustersUpdate === 'function') {
      // Attach exposed methods to a global reference for external access
      window.liveClusteringManager = exposedMethods;
    }
    
    return () => {
      if (window.liveClusteringManager) {
        delete window.liveClusteringManager;
      }
    };
  }, [exposedMethods, onClustersUpdate]);

  // This component primarily manages data and doesn't render visible UI
  // except for the optional status indicator
  return enableRealTimeSync ? <StatusIndicator /> : null;
};

export default LiveClusteringManager;