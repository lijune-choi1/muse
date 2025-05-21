// src/components/layout/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import critiqueService from '../../services/CritiqueService';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const [followedCommunities, setFollowedCommunities] = useState([]);
  const [ownedCommunities, setOwnedCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation(); // Get current location to detect navigation changes
  const { currentUser } = useAuth(); // Get current user from auth context

  // Function to load communities - extracted to be called multiple times
  const loadCommunities = async () => {
    // If no user is logged in, don't try to load communities
    if (!currentUser) {
      setFollowedCommunities([]);
      setOwnedCommunities([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Sidebar: Loading communities...');
      
      // Fetch created/owned communities first
      let userCreated = [];
      try {
        userCreated = await critiqueService.getUserCreatedCommunities(currentUser.displayName);
        console.log('Sidebar: User created communities:', userCreated);
        setOwnedCommunities(userCreated || []);
      } catch (createdError) {
        console.error('Sidebar: Error fetching created communities:', createdError);
        setOwnedCommunities([]);
      }

      // Fetch followed communities
      try {
        const userFollowed = await critiqueService.getUserFollowedCommunities(currentUser.displayName);
        console.log('Sidebar: User followed communities:', userFollowed);
        
        // Filter out communities that are already in the owned list to avoid duplicates
        const ownedIds = (userCreated || []).map(community => community.id);
        const filteredFollowed = (userFollowed || []).filter(
          community => !ownedIds.includes(community.id)
        );
        
        setFollowedCommunities(filteredFollowed);
      } catch (followedError) {
        console.error('Sidebar: Error fetching followed communities:', followedError);
        setFollowedCommunities([]);
      }
      
      // We should also fetch private communities the user has access to
      try {
        // Get all communities
        const allCommunities = await critiqueService.getAllCommunities();
        
        // Find private communities where the user is a member or moderator
        const ownedAndFollowedIds = [
          ...(ownedCommunities || []).map(c => c.id),
          ...(followedCommunities || []).map(c => c.id)
        ];
        
        const privateCommunities = allCommunities.filter(community => {
          // Include if:
          // 1. It's a private community
          // 2. User is a member (in members array) or moderator (in moderators array)
          // 3. It's not already in owned or followed communities
          return (
            community.visibility === 'Private' &&
            !ownedAndFollowedIds.includes(community.id) &&
            ((community.members && community.members.includes(currentUser.displayName)) ||
             (community.moderators && community.moderators.includes(currentUser.displayName)))
          );
        });
        
        if (privateCommunities.length > 0) {
          setFollowedCommunities(prev => [...prev, ...privateCommunities]);
        }
      } catch (error) {
        console.error('Sidebar: Error fetching private communities:', error);
      }
    } catch (error) {
      console.error("Sidebar: Error loading communities:", error);
      setError("Failed to load communities");
      setFollowedCommunities([]);
      setOwnedCommunities([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Run on initial load and whenever the location changes
  useEffect(() => {
    loadCommunities();
  }, [location.pathname]); // This will reload communities when navigation occurs

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
        {isLoading ? (
          <div className="sidebar-loading">Loading communities...</div>
        ) : (
          <>
            {ownedCommunities && ownedCommunities.length > 0 && (
              <>
                <h2 className="sidebar-heading">MY COMMUNITIES</h2>
                <ul>
                  {ownedCommunities.map((community) => (
                    <li key={community.id} className="sidebar-item">
                      <Link 
                        to={`/community/${community.name?.replace('r/', '')}`} 
                        className="sidebar-link"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {community.name}
                        {community.visibility === 'Private' && (
                          <span className="community-privacy-badge" title="Private Community">🔒</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Followed Communities Section */}
            {followedCommunities && followedCommunities.length > 0 && (
              <>
                <h2 className="sidebar-heading">JOINED COMMUNITIES</h2>
                <ul>
                  {followedCommunities.map((community) => (
                    <li key={community.id} className="sidebar-item">
                      <Link 
                        to={`/community/${community.name?.replace('r/', '')}`} 
                        className="sidebar-link"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {community.name}
                        {community.visibility === 'Private' && (
                          <span className="community-privacy-badge" title="Private Community">🔒</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Show message if no communities */}
            {(!followedCommunities || followedCommunities.length === 0) && 
             (!ownedCommunities || ownedCommunities.length === 0) && (
              <div className="sidebar-no-communities">
                <p>No communities yet</p>
                <Link to="/explore" className="sidebar-link">
                  Explore communities
                </Link>
              </div>
            )}
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