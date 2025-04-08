// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import critiqueService from '../pages/CritiqueService';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [followedCommunities, setFollowedCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add this to force refreshes
  
  // Mock user data - in a real app, this would come from auth context or API
  const userData = {
    username: 'lijune.choi20',
    posts: 0,
    followers: 10,
    badges: 20,
    achievements: 10
  };

  // Mock followers data
  const followers = [
    { id: 1, name: 'User 1', avatar: null },
    { id: 2, name: 'User 2', avatar: null },
    { id: 3, name: 'User 3', avatar: null },
    { id: 4, name: 'User 4', avatar: null },
    { id: 5, name: 'User 5', avatar: null },
    { id: 6, name: 'User 6', avatar: null }
  ];
  
  // Mock achievements data
  const achievements = [
    { id: 1, name: 'First Post', img: '/assets/images/asset-badge.png', description: 'Created your first post', date: 'Apr 1, 2025' },
    { id: 2, name: 'Community Builder', img: '/assets/images/asset-badge.png', description: 'Created a community', date: 'Apr 2, 2025' },
    { id: 3, name: 'Helpful Feedback', img: '/assets/images/asset-badge.png', description: 'Received 10 likes on feedback', date: 'Apr 3, 2025' },
    { id: 4, name: 'Design Expert', img: '/assets/images/asset-badge.png', description: 'Provided critique on 5 posts', date: 'Apr 4, 2025' }
  ];

  // Function to refresh data
  const refreshUserData = async () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const username = userData.username;
        
        // 1. Fetch user's posts using the dedicated service method
        const userPostsData = await critiqueService.getUserPosts(username);
        setUserPosts(userPostsData);
        
        // Update post count in userData
        userData.posts = userPostsData.length;
        
        // 2. Fetch communities created by the user
        const userCommunitiesData = await critiqueService.getUserCreatedCommunities(username);
        setUserCommunities(userCommunitiesData);
        
        // 3. Fetch communities followed by the user
        const followedCommunitiesData = await critiqueService.getUserFollowedCommunities(username);
        setFollowedCommunities(followedCommunitiesData);
        
        console.log('Fetched followed communities:', followedCommunitiesData);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    // Set up an event listener for focus/visibility change
    // This will refresh the data when the user returns to this tab/window
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUserData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshTrigger]); // Add refreshTrigger to the dependency array
  
  // Handler to navigate to a community
  const navigateToCommunity = (communityName) => {
    navigate(`/critique-room/${communityName}`);
  };
  
  // Handler to navigate to a post
  const navigateToPost = (postId) => {
    navigate(`/critique-room?postId=${postId}`);
  };
  
  // Handler to unfollow a community
  const unfollowCommunity = async (communityId) => {
    try {
      const username = userData.username;
      await critiqueService.unfollowCommunity(username, communityId);
      
      // Refresh the data to reflect the change
      refreshUserData();
    } catch (error) {
      console.error('Error unfollowing community:', error);
    }
  };
  
  // Handler to follow a community
  const followCommunity = async (communityId) => {
    try {
      const username = userData.username;
      await critiqueService.followCommunity(username, communityId);
      
      // Refresh the data to reflect the change
      refreshUserData();
    } catch (error) {
      console.error('Error following community:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="profile-posts">
            <div className="section-header">
              <h3 className="section-subheading">Your Posts</h3>
              <button 
                onClick={refreshUserData} 
                className="refresh-btn" 
                title="Refresh posts"
              >
                ↻ Refresh
              </button>
            </div>
            {userPosts.length === 0 ? (
              <div className="empty-state">
                <p>You haven't created any posts yet.</p>
                <button 
                  className="action-button"
                  onClick={() => navigate('/create-critique-post')}
                >
                  Create Your First Post
                </button>
              </div>
            ) : (
              userPosts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-meta">
                      <span className="post-author">{post.community}</span>
                      <span className="post-date">{post.date}</span>
                    </div>
                    <button 
                      className="enter-critique-btn"
                      onClick={() => navigate(`/whiteboard/${post.id}`)}
                    >
                      Enter Critique
                    </button>
                  </div>
                  
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-content">{post.description}</p>
                  
                  {post.image ? (
                    <img src={post.image} alt="Post" className="post-image" />
                  ) : (
                    <div className="post-image-placeholder"></div>
                  )}
                  
                  <div className="post-actions">
                    <button className="action-button">Likes</button>
                    <button className="action-button">Comments</button>
                    <button className="action-button">Share</button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
        
      case 'communities':
        return (
          <div className="profile-communities">
            <div className="section-header">
              <h3 className="section-subheading">Communities You Created</h3>
              <button 
                onClick={refreshUserData} 
                className="refresh-btn" 
                title="Refresh communities"
              >
                ↻ Refresh
              </button>
            </div>
            {userCommunities.length === 0 ? (
              <div className="empty-state">
                <p>You haven't created any communities yet.</p>
                <button 
                  className="action-button"
                  onClick={() => navigate('/create-community')}
                >
                  Create Community
                </button>
              </div>
            ) : (
              <div className="communities-grid">
                {userCommunities.map(community => (
                  <div key={community.id} className="community-card" onClick={() => navigateToCommunity(community.name)}>
                    <h4>{community.name}</h4>
                    <p className="community-description">{community.description}</p>
                    <div className="community-stats">
                      <span>{community.stats?.members || 0} members</span>
                    </div>
                    <button className="manage-btn">Manage</button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="section-header">
              <h3 className="section-subheading">Communities You Follow</h3>
              <span className="count-badge">{followedCommunities.length}</span>
            </div>
            {followedCommunities.length === 0 ? (
              <div className="empty-state">
                <p>You're not following any communities yet.</p>
                <button 
                  className="action-button"
                  onClick={() => navigate('/explore')}
                >
                  Explore Communities
                </button>
              </div>
            ) : (
              <div className="communities-grid">
                {followedCommunities.map(community => (
                  <div key={community.id} className="community-card">
                    <div className="community-header">
                      <h4>{community.name}</h4>
                      <button 
                        className="unfollow-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          unfollowCommunity(community.id);
                        }}
                      >
                        Unfollow
                      </button>
                    </div>
                    <p className="community-description">{community.description}</p>
                    <button 
                      className="visit-btn"
                      onClick={() => navigateToCommunity(community.name)}
                    >
                      Visit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'followers':
        return (
          <div className="profile-followers">
            <div className="section-header">
              <h3 className="section-subheading">Your Followers</h3>
              <span className="count-badge">{followers.length}</span>
            </div>
            {followers.length === 0 ? (
              <div className="empty-state">
                <p>You don't have any followers yet.</p>
                <button 
                  className="action-button"
                  onClick={() => navigate('/explore')}
                >
                  Explore Communities to Connect
                </button>
              </div>
            ) : (
              <div className="followers-grid">
                {followers.map(follower => (
                  <div key={follower.id} className="follower-card">
                    <div className="follower-avatar-container">
                      {follower.avatar ? (
                        <img src={follower.avatar} alt={follower.name} className="follower-avatar-img" />
                      ) : (
                        <div className="follower-avatar-placeholder">
                          {follower.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="follower-info">
                      <h4 className="follower-name">{follower.name}</h4>
                      <div className="follower-actions">
                        <button className="follow-btn">Follow Back</button>
                        <button className="view-profile-btn">View Profile</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'achievements':
        return (
          <div className="profile-achievements">
            <div className="section-header">
              <h3 className="section-subheading">Your Achievements</h3>
              <span className="count-badge">{achievements.length}</span>
            </div>
            {achievements.length === 0 ? (
              <div className="empty-state">
                <p>You haven't earned any achievements yet.</p>
                <button 
                  className="action-button"
                  onClick={() => navigate('/create-critique-post')}
                >
                  Start Creating Content
                </button>
              </div>
            ) : (
              <div className="achievements-list">
                {achievements.map(achievement => (
                  <div key={achievement.id} className="achievement-card">
                    <div className="achievement-icon">       
                                    <img 
                          src={achievement.img} 
                          alt={achievement.name} 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            borderRadius: '100%',
                            objectFit: 'contain' 
                          }} 
                        />
                    </div>
                    <div className="achievement-info">
                      <h4 className="achievement-name">{achievement.name}</h4>
                      <p className="achievement-description">{achievement.description}</p>
                      <div className="achievement-date">Earned on {achievement.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="achievement-stats">
              <div className="stat-box">
                <div className="stat-value">{achievements.length}</div>
                <div className="stat-label">Earned</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{20 - achievements.length}</div>
                <div className="stat-label">Available</div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="profile-posts">
            <p>Select a tab to view content</p>
          </div>
        );
    }
  };

  return (
    <div className="layout">
      <Navbar />
      <div className="content-wrapper">
        <div className="sidebar-container">
          <Sidebar />
        </div>
        <div className="main-content">
          <div className="profile-container">
            <div className="profile-header">
              <div className="back-button">
                <Link to="/">
                  <button className="circle-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </Link>
              </div>
              <div className="username">{userData.username}</div>
              <button className="share-button">Share</button>
            </div>

            <div className="profile-stats">
              <div className="stat-group">
                <div className="stat-value">{userData.posts}</div>
                <div className="stat-label">Posts</div>
              </div>
              <div className="stat-group">
                <div className="stat-value">{userData.followers}</div>
                <div className="stat-label">Followers</div>
              </div>
              <div className="stat-group">
                <div className="stat-value">{userData.badges}</div>
                <div className="stat-label">Badges</div>
              </div>
              <div className="stat-group">
                <div className="stat-value">{userData.achievements}</div>
                <div className="stat-label">Achievements</div>
              </div>
            </div>

            <div className="profile-tabs">
              <button 
                className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                Posts
              </button>
              <button 
                className={`tab-button ${activeTab === 'communities' ? 'active' : ''}`}
                onClick={() => setActiveTab('communities')}
              >
                Communities
              </button>
              <button 
                className={`tab-button ${activeTab === 'followers' ? 'active' : ''}`}
                onClick={() => setActiveTab('followers')}
              >
                Followers
              </button>
              <button 
                className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
                onClick={() => setActiveTab('achievements')}
              >
                Achievements
              </button>
            </div>

            {loading ? (
              <div className="loading-indicator">Loading user data...</div>
            ) : (
              renderTabContent()
            )}
          </div>

          {/* <div className="profile-sidebar">
            <section className="achievements-section">
              <div className="sidebar-header">
                <h2 className="section-title">TOP ACHIEVEMENTS</h2>
                <button 
                  className="view-all-btn" 
                  onClick={() => setActiveTab('achievements')}
                >
                  View All
                </button>
              </div>
              <div className="achievements-grid">
                {achievements.slice(0, 8).map((achievement, index) => (
                  <div key={index} className="achievement-item">
                    <div className="achievement-circle">{achievement.icon}</div>
                    <div className="achievement-name">{achievement.name}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="followers-section">
              <div className="sidebar-header">
                <h2 className="section-title">RECENT FOLLOWERS</h2>
                <button 
                  className="view-all-btn"
                  onClick={() => setActiveTab('followers')}
                >
                  View All
                </button>
              </div>
              <ul className="followers-list">
                {followers.slice(0, 4).map(follower => (
                  <li key={follower.id} className="follower-item">
                    <div className="follower-avatar">
                      {follower.name.charAt(0)}
                    </div>
                    <div className="follower-name">{follower.name}</div>
                  </li>
                ))}
              </ul>
            </section>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;