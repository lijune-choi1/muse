// src/pages/CommunityPage.jsx (updated)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import critiqueService from '../services/CritiqueService';
import CritiqueCard from '../components/common/CritiqueCard';
import './CommunityPage.css';

const CommunityPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  // Current user info from localStorage/window
  const currentUserName = localStorage.getItem('currentUserName') || window.currentUserName;

  // Format the community name to include 'r/' prefix if not present
  const formattedName = name && !name.startsWith('r/') ? `r/${name}` : name;

  useEffect(() => {
    const loadCommunityData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get community information
        const communityData = await critiqueService.getCommunityByName(formattedName);
        
        if (!communityData) {
          setError(`Community "${formattedName}" not found.`);
          setLoading(false);
          return;
        }
        
        setCommunity(communityData);
        
        // Check if current user is the creator of this community
        if (currentUserName) {
          // Creator check
          const isCreator = 
            communityData.creatorUsername === currentUserName;
          
          setIsCreator(isCreator);
          
          // Following check
          try {
            const following = await critiqueService.isUserFollowingCommunity(
              currentUserName,
              communityData.id
            );
            setIsFollowing(following);
          } catch (err) {
            console.error('Error checking if user follows community:', err);
          }
        }
        
        // Get posts for this community
        const communityPosts = await critiqueService.getAllPosts(formattedName);
        setPosts(communityPosts || []);
      } catch (err) {
        console.error('Error loading community data:', err);
        setError('Failed to load community data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (name) {
      loadCommunityData();
    }
  }, [name, formattedName, currentUserName]);

  const handleCreatePost = () => {
    navigate(`/create-post/${name}`);
  };
  
  const handleEditCommunity = () => {
    // Remove 'r/' prefix for the URL if present
    const simplifiedName = name.replace('r/', '');
    console.log(`Navigating to edit community: /edit-community/${simplifiedName}`);
    // Actually navigate to the edit page
    navigate(`/edit-community/${simplifiedName}`);
  };
  
  const handleJoinCommunity = async () => {
    try {
      if (!currentUserName) {
        alert("Please log in to join communities");
        return;
      }
      
      if (isFollowing) {
        await critiqueService.unfollowCommunity(currentUserName, community.id);
        setIsFollowing(false);
        alert(`Left ${community.name}`);
      } else {
        await critiqueService.followCommunity(currentUserName, community.id);
        setIsFollowing(true);
        alert(`Joined ${community.name}`);
      }
    } catch (error) {
      console.error('Error joining/leaving community:', error);
      alert("Failed to join/leave community. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading community data...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Oops!</h2>
        <p>{error}</p>
        <button 
          className="primary-button"
          onClick={() => navigate('/')}
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="community-page">
      <div className="critique-room-header">
        <div className="critique-room-title-container">
          <Link to="/">
            <button className="circle-button">
              ←
            </button>
          </Link>
          <h1 className="critique-room-title">{community?.name}</h1>
        </div>
        <div className="critique-room-actions">
          {isCreator && (
            <button
              className="secondary-button"
              onClick={handleEditCommunity}
            >
              Edit Community
            </button>
          )}
          <button
            className={`join-button ${isFollowing ? 'following' : ''}`}
            onClick={handleJoinCommunity}
          >
            {isFollowing ? 'Leave' : 'Join'}
          </button>
          <button
            className="primary-button"
            onClick={handleCreatePost}
          >
            New Post
          </button>
        </div>
      </div>

      <div className="critique-content-container">
        <div className="critique-posts-section">
          {/* Posts Tab */}
          {posts.length > 0 ? (
            <div className="posts-grid">
              {posts.map(post => (
                <CritiqueCard 
                  key={post.id}
                  id={post.id}
                  community={post.communityName}
                  date={post.date}
                  title={post.title}
                  description={post.description}
                  editNumber={post.editNumber}
                  status={post.status}
                  image={post.imageUrl}
                  author={post.authorName}
                />
              ))}
            </div>
          ) : (
            <div className="empty-community-message">
              <p>No posts in this community yet. Be the first to create one!</p>
              <button 
                className="primary-button"
                onClick={handleCreatePost}
              >
                Create the First Post
              </button>
            </div>
          )}
        </div>
        
        <div className="community-sidebar-container">
          <div className="community-header">
            <h2 className="community-name">{community?.name}</h2>
          </div>
          
          <p className="community-description">{community?.description}</p>
          
          <div className="community-meta">
            <div>Created {new Date(community?.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</div>
            <div>{community?.visibility || 'Public'}</div>
          </div>
          
          <div className="community-stats">
            <div className="stat-group">
              <div className="stat-value">{community?.stats?.members || 0}</div>
              <div className="stat-label">Members</div>
            </div>
            <div className="stat-group">
              <div className="stat-value">{community?.stats?.online || 0}</div>
              <div className="stat-label">Online</div>
            </div>
          </div>
          
          <div className="community-section">
            <h3 className="section-title">COMMUNITY GUIDELINES</h3>
            <div className="guidelines-list">
              {community?.guidelines && community.guidelines.length > 0 ? (
                community.guidelines.map((guideline, index) => (
                  <div key={index} className="guideline-item">{guideline}</div>
                ))
              ) : (
                <div className="guideline-item">No specific guidelines for this community.</div>
              )}
            </div>
          </div>
          
          <div className="community-section">
            <h3 className="section-title">RULES</h3>
            <ol className="rules-list">
              {community?.rules && community.rules.length > 0 ? (
                community.rules.map((rule, index) => (
                  <li key={index} className="rule-item">{rule}</li>
                ))
              ) : (
                <li className="rule-item">No specific rules have been established for this community yet.</li>
              )}
            </ol>
          </div>
          
          <div className="community-section">
            <h3 className="section-title">Moderators</h3>
            <div className="moderators-list">
              {community?.moderators && community.moderators.length > 0 ? (
                community.moderators.map((mod, index) => (
                  <div key={index} className="moderator-item">
                    <div className="moderator-avatar"></div>
                    <div className="moderator-name">{typeof mod === 'string' ? mod : mod.name || mod}</div>
                  </div>
                ))
              ) : (
                <div className="moderator-item">
                  <div className="moderator-avatar"></div>
                  <div className="moderator-name">{community?.creatorUsername || 'Admin'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;