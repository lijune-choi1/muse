// src/pages/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CritiqueCard from '../components/common/CritiqueCard';
import critiqueService from '../services/CritiqueService'; // Fixed import path
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
        
        // Fetch posts from CritiqueService instead of localStorage
        let allPosts = [];
        try {
          allPosts = await critiqueService.getAllPosts();
          if (!allPosts || allPosts.length === 0) {
            console.log('No posts found in CritiqueService, using demo data');
            // Fallback to demo data
            allPosts = [
              {
                id: 'post1',
                title: 'Poster Design Feedback',
                description: 'Need help with my typography layout',
                community: 'r/ijuneneedshelp',
                communityName: 'r/ijuneneedshelp',
                editNumber: 2,
                status: 'in-progress',
                author: 'DesignStudent',
                date: 'May 10, 2025'
              },
              {
                id: 'post2',
                title: 'Logo Design for Coffee Shop',
                description: 'Working on branding for a local coffee shop',
                community: 'r/Graphic4ever',
                communityName: 'r/Graphic4ever',
                editNumber: 1,
                status: 'just-started',
                author: 'BrandingPro',
                date: 'May 8, 2025'
              },
              {
                id: 'post3',
                title: 'UI Design for Mobile App',
                description: 'Feedback on color scheme and usability',
                community: 'r/ijuneneedshelp',
                communityName: 'r/ijuneneedshelp',
                editNumber: 3,
                status: 'completed',
                author: 'UXDesigner',
                date: 'May 5, 2025'
              }
            ];
          }
        } catch (error) {
          console.error('Error getting posts from CritiqueService:', error);
          // Fallback to localStorage
          allPosts = JSON.parse(localStorage.getItem('critiquePosts') || '[]');
        }
        
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
        
        // Set top users data
        setTopUsers([
          { id: 1, name: 'DesignPro', points: 320, avatar: '/assets/images/default-avatar.png' },
          { id: 2, name: 'ArtCritic', points: 285, avatar: '/assets/images/default-avatar.png' },
          { id: 3, name: 'CreativeGenius', points: 240, avatar: '/assets/images/default-avatar.png' },
          { id: 4, name: 'FeedbackMaster', points: 220, avatar: '/assets/images/default-avatar.png' },
          { id: 5, name: 'PixelPerfect', points: 180, avatar: '/assets/images/default-avatar.png' }
        ]);
        
        // Try to get communities from CritiqueService
        let communities = [];
        try {
          communities = await critiqueService.getAllCommunities();
        } catch (error) {
          console.error('Error getting communities:', error);
        }
        
        if (!communities || communities.length === 0) {
          // Get unique communities and count posts from the posts we have
          const communityCount = {};
          allPosts.forEach(post => {
            if (post.community || post.communityName) {
              const communityId = post.communityName || post.community;
              communityCount[communityId] = (communityCount[communityId] || 0) + 1;
            }
          });
          
          // Create sorted community array
          communities = Object.entries(communityCount)
            .map(([name, postCount]) => ({ name, postCount }))
            .sort((a, b) => b.postCount - a.postCount);
        } else {
          // Format communities from the service
          communities = communities.map(community => ({
            name: community.name,
            postCount: community.stats?.members || 0
          })).sort((a, b) => b.postCount - a.postCount);
        }
        
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
              community={post.communityName || post.community}
              date={post.date}
              title={post.title}
              description={post.description}
              editNumber={post.editNumber}
              status={post.status}
              image={post.imageUrl || post.image || `/assets/images/default-post-image.png`}
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
        {topCommunities.length > 0 ? (
          topCommunities.map((community, index) => (
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
          ))
        ) : (
          <div className="no-data-message">
            <p>No communities found. Create a community to get started!</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'featured' ? 'active' : ''}`}
          onClick={() => setActiveTab('featured')}
        >
          Featured Posts
        </button>
        
        {/* <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Top Users
        </button> */}
{/*         
        <button 
          className={`tab-button ${activeTab === 'communities' ? 'active' : ''}`}
          onClick={() => setActiveTab('communities')}
        >
          Communities
        </button> */}
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