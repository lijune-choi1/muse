// src/pages/Explore.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Explore.css';
import critiqueService from '../services/CritiqueService'; // Direct import for CritiqueService

// Default hardcoded communities to show if service fails
const DEFAULT_COMMUNITIES = [
  {
    id: 1,
    name: 'r/ijuneneedshelp',
    description: 'Community board for Iijune to get feedback for design',
    createdDate: 'Mar 13, 2024',
    visibility: 'Public',
    stats: {
      members: 20,
      online: 10
    }
  },
  {
    id: 2,
    name: 'r/Graphic4ever',
    description: 'A community for graphic designers to share and critique professional work',
    createdDate: 'Jan 15, 2024',
    visibility: 'Public',
    stats: {
      members: 50,
      online: 25
    }
  }
];

const Explore = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        
        try {
          // Get all communities from service
          const allCommunities = await critiqueService.getAllCommunities();
          
          // Filter to only show public communities
          const publicCommunities = allCommunities.filter(
            community => community.visibility === 'Public'
          );
          
          if (publicCommunities && publicCommunities.length > 0) {
            setCommunities(publicCommunities);
          } else {
            // Fallback to default communities if no public communities found
            setCommunities(DEFAULT_COMMUNITIES.filter(c => c.visibility === 'Public'));
          }
        } catch (serviceError) {
          console.error("Error using CritiqueService:", serviceError);
          // Fallback to default communities (only public ones)
          setCommunities(DEFAULT_COMMUNITIES.filter(c => c.visibility === 'Public'));
        }
      } catch (error) {
        console.error('Error fetching communities:', error);
        setCommunities(DEFAULT_COMMUNITIES.filter(c => c.visibility === 'Public'));
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  // Current user - in a real app would come from auth context
  const currentUser = {
    name: window.currentUserName || localStorage.getItem('currentUserName') || 'Current User',
    id: localStorage.getItem('userId') || null
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      await critiqueService.followCommunity(currentUser.name, communityId);
      alert(`Joined community successfully`);
      
      // Refresh the communities to update the UI
      const allCommunities = await critiqueService.getAllCommunities();
      const publicCommunities = allCommunities.filter(
        community => community.visibility === 'Public'
      );
      setCommunities(publicCommunities);
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
      ) : communities.length > 0 ? (
        <>
          <p>Discover and join public communities</p>
          <div className="c-communities-grid">
            {communities.map(community => (
              <div key={community.id} className="c-community-card">
                <div className="community-card-header">
                  <h2>{community.name}</h2>
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