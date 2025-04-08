// src/pages/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CritiqueCard from '../components/common/CritiqueCard';
import critiqueService from './CritiqueService';
import './Leaderboard.css';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [topCommunities, setTopCommunities] = useState([]);
  const [activeTab, setActiveTab] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedData = async () => {
      try {
        setLoading(true);
        
        // Get posts from localStorage
        const allPosts = JSON.parse(localStorage.getItem('critiquePosts') || '[]');
        
        // Get whiteboard stats for each post to determine most critiqued posts
        const postsWithStats = await Promise.all(
          allPosts.map(async (post) => {
            try {
              const stats = await critiqueService.getWhiteboardStats(post.id);
              const commentCount = stats.technical + stats.conceptual + stats.details;
              return { 
                ...post, 
                commentCount,
                pointsTotal: stats.total
              };
            } catch (error) {
              console.error(`Error getting stats for post ${post.id}:`, error);
              return { ...post, commentCount: 0, pointsTotal: 0 };
            }
          })
        );
        
        // Sort posts by comment count and take top 6
        const sortedByComments = [...postsWithStats].sort((a, b) => b.commentCount - a.commentCount);
        setFeaturedPosts(sortedByComments.slice(0, 6));
        
        // Simulate top users data
        setTopUsers([
          { id: 1, name: 'DesignPro', points: 320, avatar: '/api/placeholder/40/40' },
          { id: 2, name: 'ArtCritic', points: 285, avatar: '/api/placeholder/40/40' },
          { id: 3, name: 'CreativeGenius', points: 240, avatar: '/api/placeholder/40/40' },
          { id: 4, name: 'FeedbackMaster', points: 220, avatar: '/api/placeholder/40/40' },
          { id: 5, name: 'PixelPerfect', points: 180, avatar: '/api/placeholder/40/40' }
        ]);
        
        // Get unique communities and count posts
        const communityCount = {};
        allPosts.forEach(post => {
          if (post.community) {
            communityCount[post.community] = (communityCount[post.community] || 0) + 1;
          }
        });
        
        // Create sorted community array
        const communities = Object.entries(communityCount)
          .map(([name, postCount]) => ({ name, postCount }))
          .sort((a, b) => b.postCount - a.postCount);
        
        setTopCommunities(communities.slice(0, 5));
      } catch (error) {
        console.error('Error loading leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFeaturedData();
  }, []);

  const renderFeaturedTab = () => (
    <div className="featured-content">
      <div className="featured-header">
        <h2>Urgent Critique</h2>
        <p>Posts that need attention as soon as possible</p>
      </div>
      
      <div className="featured-posts-grid">
        {featuredPosts.length > 0 ? (
          featuredPosts.map(post => (
            <CritiqueCard
              key={post.id}
              id={post.id}
              community={post.community}
              date={post.date}
              title={post.title}
              description={post.description}
              editNumber={post.editNumber}
              status={post.status}
              image={post.image || `/api/placeholder/${600 + (post.id % 10)}/${400 + (post.id % 20)}`}
              onEditClick={() => navigate(`/whiteboard/${post.id}`)}
            />
          ))
        ) : (
          <div className="no-data-message">
            <p>No featured posts yet. Start critiquing to see posts here!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="users-content">
      <div className="users-header">
        <h2>Top Contributors</h2>
        <p>Users with the most valuable feedback</p>
      </div>
      
      <div className="users-list">
        {topUsers.map((user, index) => (
          <div key={user.id} className="user-card">
            <div className="user-rank">{index + 1}</div>
            <div className="user-avatar">
              <img src={user.avatar} alt={user.name} />
            </div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-stats">
                <span className="points-badge">{user.points} points</span>
              </div>
            </div>
            <div className="user-badge">
              {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '✨'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCommunitiesTab = () => (
    <div className="communities-content">
      <div className="communities-header">
        <h2>Active Communities</h2>
        <p>Most active design critique communities</p>
      </div>
      
      <div className="communities-list">
        {topCommunities.map((community, index) => (
          <div key={community.name} className="community-card-2">
            <div className="community-rank">{index + 1}</div>
            <div className="community-info">
              <div className="community-name">{community.name}</div>
              <div className="community-stats">
                <span>{community.postCount} posts</span>
              </div>
            </div>
            <button 
              className="visit-btn-2"
              onClick={() => navigate(`/community/${community.name.replace('r/', '')}`)}
            >
              Visit
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="leaderboard-container">
      {/* <div className="leaderboard-hero">
        <h1>Featured Content</h1>
        <p>Discover top posts, active users, and thriving communities</p>
      </div> */}
      
      <div className="leaderboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'featured' ? 'active' : ''}`}
          onClick={() => setActiveTab('featured')}
        >
          Featured Posts
        </button>
      
        <button 
          className={`tab-button ${activeTab === 'communities' ? 'active' : ''}`}
          onClick={() => setActiveTab('communities')}
        >
          Communities
        </button>
      </div>
      
      <div className="leaderboard-content">
        {loading ? (
          <div className="loading-spinner">Loading featured content...</div>
        ) : (
          <>
            {activeTab === 'featured' && renderFeaturedTab()}
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'communities' && renderCommunitiesTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;