// src/pages/Explore.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Explore.css';
import critiqueService from '../services/CritiqueService';
import { useAuth } from '../contexts/AuthContext';

const Explore = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth(); // Get current user from auth context

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all communities from service
        const allCommunities = await critiqueService.getAllCommunities();
        
        if (currentUser) {
          // Get communities this user has created
          const userCreatedCommunities = await critiqueService.getUserCreatedCommunities(currentUser.displayName);
          const createdIds = userCreatedCommunities.map(c => c.id);
          
          // Filter to show:
          // 1. All public communities
          // 2. Private communities the user has created
          const filteredCommunities = allCommunities.filter(
            community => (
              community.visibility === 'Public' || 
              (community.visibility === 'Private' && createdIds.includes(community.id))
            )
          );
          
          setCommunities(filteredCommunities);
        } else {
          // If no user is logged in, only show public communities
          const publicCommunities = allCommunities.filter(
            community => community.visibility === 'Public'
          );
          setCommunities(publicCommunities);
        }
      } catch (error) {
        console.error('Error fetching communities:', error);
        setError('Failed to load communities. Please try again later.');
        setCommunities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [currentUser]); // Re-fetch when currentUser changes

  const handleJoinCommunity = async (communityId) => {
    if (!currentUser) {
      alert('Please sign in to join communities');
      // Optionally redirect to login page
      return;
    }
    
    try {
      await critiqueService.followCommunity(currentUser.displayName, communityId);
      alert(`Joined community successfully`);
      
      // Refresh the communities to update the UI
      const allCommunities = await critiqueService.getAllCommunities();
      const userCreatedCommunities = await critiqueService.getUserCreatedCommunities(currentUser.displayName);
      const createdIds = userCreatedCommunities.map(c => c.id);
      
      const filteredCommunities = allCommunities.filter(
        community => (
          community.visibility === 'Public' || 
          (community.visibility === 'Private' && createdIds.includes(community.id))
        )
      );
      
      setCommunities(filteredCommunities);
    } catch (error) {
      console.error('Error joining community:', error);
      alert('Failed to join community. Please try again.');
    }
  };

  return (
    <div>
      <h1 className="explore-title">Explore Communities</h1>
      
      {loading ? (
        <div className="communities-loading">Loading communities...</div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <Link to="/create-community" className="create-community-btn">
            Create Your First Community
          </Link>
        </div>
      ) : communities.length > 0 ? (
        <>
          <p>Discover and join public communities</p>
          <div className="c-communities-grid">
            {communities.map(community => (
              <div key={community.id} className="c-community-card">
                <div className="community-card-header">
                  <h2>
                    {community.name}
                    {community.visibility === 'Private' && (
                      <span className="community-privacy-badge" title="Private Community">🔒</span>
                    )}
                  </h2>
                  <span className="community-members">
                    {community.stats?.members || 0} members
                  </span>
                </div>
                <p className="community-description">{community.description}</p>
                <div className="community-card-footer">
                  <Link 
                    to={`/community/${community.name.replace('r/', '')}`} 
                    className="view-community-btn"
                  >
                    View
                  </Link>
                  <button 
                    className="join-community-btn"
                    onClick={() => handleJoinCommunity(community.id)}
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-communities-message">
          <p>No public communities found. Be the first to create one!</p>
          <Link to="/create-community" className="create-community-btn">
            Create Community
          </Link>
        </div>
      )}
      
      {/* Add "Create Community" button at the bottom for easy access */}
      {communities.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/create-community" className="create-community-btn">
            Create a New Community
          </Link>
        </div>
      )}
    </div>
  );
};

export default Explore;