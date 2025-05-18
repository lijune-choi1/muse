// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import critiqueService from '../services/CritiqueService';
import CritiqueCard from '../components/common/CritiqueCard';
import Button from '../components/common/Button';
import './Profile.css';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'communities', 'activity'
  const [userCommunities, setUserCommunities] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    displayName: currentUser?.displayName || 'User',
    bio: 'No bio yet.',
    email: currentUser?.email || '',
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          // Fetch user's posts
          const posts = await critiqueService.getUserPosts(currentUser.displayName || currentUser.email);
          setUserPosts(posts || []);
          
          // Fetch user's communities
          const communities = await critiqueService.getUserCreatedCommunities(currentUser.displayName || currentUser.email);
          setUserCommunities(communities || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    // Here you would implement the API call to save profile changes
    // For now, we'll just exit edit mode
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {/* Default avatar or user avatar if available */}
          <div className="avatar-image">
            {profile.displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
        
        <div className="profile-info">
          {editMode ? (
            <div className="edit-profile-form">
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  name="displayName" 
                  value={profile.displayName} 
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={profile.email} 
                  onChange={handleChange}
                  className="form-control"
                  disabled // Email typically can't be changed easily
                />
              </div>
              
              <div className="form-group">
                <label>Bio</label>
                <textarea 
                  name="bio" 
                  value={profile.bio} 
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                />
              </div>
              
              <div className="profile-actions">
                <Button variant="primary" onClick={handleSaveProfile}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="profile-username">{profile.displayName}</h1>
              <p className="profile-email">{profile.email}</p>
              <div className="profile-bio">
                <h3>Bio</h3>
                <p>{profile.bio}</p>
              </div>
              <div className="profile-actions">
                <Button variant="primary" onClick={handleEditProfile}>Edit Profile</Button>
                <Button variant="secondary" onClick={handleLogout}>Log Out</Button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            My Posts
          </button>
          <button 
            className={`tab-button ${activeTab === 'communities' ? 'active' : ''}`}
            onClick={() => setActiveTab('communities')}
          >
            My Communities
          </button>
          <button 
            className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Recent Activity
          </button>
        </div>
        
        <div className="tab-content">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div className="user-posts">
                  {userPosts.length > 0 ? (
                    <div className="posts-grid">
                      {userPosts.map(post => (
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
                    <div className="empty-state">
                      <p>You haven't created any posts yet.</p>
                      <Button 
                        variant="primary" 
                        onClick={() => navigate('/create-post/ijuneneedshelp')}
                      >
                        Create Your First Post
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Communities Tab */}
              {activeTab === 'communities' && (
                <div className="user-communities">
                  {userCommunities.length > 0 ? (
                    <div className="communities-list">
                      {userCommunities.map(community => (
                        <div className="community-card" key={community.id}>
                          <h3 className="community-name">{community.name}</h3>
                          <p className="community-description">{community.description}</p>
                          <div className="community-stats">
                            <span className="stat">
                              <i className="icon-users"></i> 
                              {community.stats?.members || 0} members
                            </span>
                            <span className="stat">
                              <i className="icon-online"></i> 
                              {community.stats?.online || 0} online
                            </span>
                          </div>
                          <Button 
                            variant="secondary" 
                            onClick={() => navigate(`/community/${community.name.replace('r/', '')}`)}
                          >
                            View Community
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>You don't own any communities yet.</p>
                      <Button 
                        variant="primary" 
                        onClick={() => navigate('/create-community')}
                      >
                        Create Your First Community
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="user-activity">
                  <div className="empty-state">
                    <p>No recent activity to display.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;