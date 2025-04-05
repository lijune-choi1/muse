// src/pages/Explore.jsx - without duplicate navigation elements
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Explore.css'; // Reuse Home.css styles

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
  const [communities, setCommunities] = useState(DEFAULT_COMMUNITIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        
        // Try to import CritiqueService dynamically
        try {
          const critiqueServiceModule = await import('../pages/CritiqueService');
          const critiqueService = critiqueServiceModule.default;
          
          const allCommunities = await critiqueService.getAllCommunities();
          if (allCommunities && allCommunities.length > 0) {
            setCommunities(allCommunities);
          }
        } catch (importError) {
          console.error("Error importing CritiqueService:", importError);
          // Fallback to default communities
          setCommunities(DEFAULT_COMMUNITIES);
        }
      } catch (error) {
        console.error('Error fetching communities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  // Current user - in a real app would come from auth context
  const currentUser = 'lijune.choi20';

  const handleJoinCommunity = async (communityId) => {
    try {
      // Try to import CritiqueService dynamically
      const critiqueServiceModule = await import('../pages/CritiqueService');
      const critiqueService = critiqueServiceModule.default;
      
      await critiqueService.followCommunity(currentUser, communityId);
      alert(`Joined community #${communityId}`);
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  return (
    // Removed the outer layout divs that included Navbar and Sidebar
    <div className="main-content">
      <h1 className="explore-title">Explore Communities</h1>
      
      {loading ? (
        <div>Loading communities...</div>
      ) : communities.length > 0 ? (
        <div className="communities-grid">
          {communities.map(community => (
            <div key={community.id} className="community-card">
              <div className="community-card-header">
                <h2>{community.name}</h2>
                <span className="community-members">{community.stats?.members || 0} members</span>
              </div>
              <p className="community-description">{community.description}</p>
              <div className="community-card-footer">
                <Link to={`/community/${community.name.replace('r/', '')}`} className="view-community-btn">
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
      ) : (
        <div className="no-communities-message">
          <p>No communities found. Be the first to create one!</p>
          <Link to="/create-critique-room" className="create-community-btn">
            Create Community
          </Link>
        </div>
      )}
    </div>
  );
};

export default Explore;