// src/components/layout/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import critiqueService from '../../pages/CritiqueService';

// Default hardcoded communities to show if CritiqueService fails
const DEFAULT_COMMUNITIES = {
  followed: [
    {
      id: 1,
      name: 'r/ijuneneedshelp',
      description: 'Community board for Iijune to get feedback for design'
    },
    {
      id: 2,
      name: 'r/Graphic4ever',
      description: 'A community for graphic designers to share and critique professional work'
    }
  ],
  owned: []
};

const Sidebar = () => {
  const [followedCommunities, setFollowedCommunities] = useState(DEFAULT_COMMUNITIES.followed);
  const [ownedCommunities, setOwnedCommunities] = useState(DEFAULT_COMMUNITIES.owned);
  const [isLoading, setIsLoading] = useState(true);

  // Current user - in a real app would come from auth context
  const currentUser = 'lijune.choi20';

  useEffect(() => {
    // Function to load communities
    const loadCommunities = async () => {
      try {
        setIsLoading(true);
        
        // Try to import CritiqueService
        try {
          // Fetch followed communities
          const followedCommunities = await critiqueService.getFollowedCommunities(currentUser);
          if (followedCommunities && followedCommunities.length > 0) {
            setFollowedCommunities(followedCommunities);
          }

          // Fetch owned communities
          const ownedCommunities = await critiqueService.getOwnedCommunities(currentUser);
          if (ownedCommunities && ownedCommunities.length > 0) {
            setOwnedCommunities(ownedCommunities);
          }
        } catch (importError) {
          console.error("Error importing communities:", importError);
          // Fallback to default communities
          setFollowedCommunities(DEFAULT_COMMUNITIES.followed);
          setOwnedCommunities(DEFAULT_COMMUNITIES.owned);
        }
      } catch (error) {
        console.error("Error loading communities:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCommunities();
  }, []);

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li className="sidebar-item">
            <Link to="/" className="sidebar-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Home
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/explore" className="sidebar-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Explore
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/leaderboard" className="sidebar-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Featured
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar-section">
        <div className="sidebar-create-community">
          <Link to="/create-critique-room" className="sidebar-link sidebar-create-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Community
          </Link>
        </div>

        {/* Owned Communities Section */}
        {ownedCommunities.length > 0 && (
          <>
            <h2 className="sidebar-heading">MY COMMUNITIES</h2>
            <ul>
              {ownedCommunities.map((community) => (
                <li key={community.id || community.name} className="sidebar-item">
                  <Link 
                    to={`/community/${community.name?.replace('r/', '') || community.id}`} 
                    className="sidebar-link"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {community.name || `Community #${community.id}`}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Followed Communities Section */}
        {followedCommunities.length > 0 && (
          <>
            <h2 className="sidebar-heading">FOLLOWED COMMUNITIES</h2>
            <ul>
              {followedCommunities.map((community) => (
                <li key={community.id || community.name} className="sidebar-item">
                  <Link 
                    to={`/community/${community.name?.replace('r/', '') || community.id}`} 
                    className="sidebar-link"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {community.name || `Community #${community.id}`}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="sidebar-section">
        <h2 className="sidebar-heading">RESOURCES</h2>
        <ul>
          <li className="sidebar-item">
            <Link to="/about" className="sidebar-link">About</Link>
          </li>
          <li className="sidebar-item">
            <Link to="/settings" className="sidebar-link">Settings</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;