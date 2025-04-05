// src/pages/ThreadView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import Navbar from '../layout/Navbar';
import Button from './Button';
import critiqueService from '../services/CritiqueService';
import './ThreadView.css';

const ThreadView = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState(null);
  const [error, setError] = useState(null);
  
  // Load thread data
  useEffect(() => {
    const loadThread = async () => {
      try {
        setLoading(true);
        console.log(`Loading thread with ID: ${threadId}`);
        
        // Convert ID to a number
        const numericId = typeof threadId === 'string' ? parseInt(threadId, 10) : threadId;
        
        // Get the thread
        const threadData = await critiqueService.getThreadById(numericId);
        console.log('Loaded thread data:', threadData);
        
        if (threadData) {
          setThread(threadData);
        } else {
          setError('Thread not found');
        }
      } catch (error) {
        console.error("Error loading thread data:", error);
        setError('Failed to load thread data');
      } finally {
        setLoading(false);
      }
    };
    
    loadThread();
  }, [threadId]);
  
  // Function to navigate to whiteboard
  const goToWhiteboard = () => {
    navigate('/whiteboard');
  };
  
  // Function to navigate to create new post in this thread
  const createNewPost = () => {
    navigate('/create-critique-post', { 
      state: { thread: thread }
    });
  };
  
  // Community information based on the thread
  const communityInfo = thread ? {
    name: thread.community,
    description: 'Community board for design feedback and critique',
    createdDate: thread.createdAt,
    visibility: 'Public',
    stats: {
      members: 20,
      online: 10
    },
    guidelines: ['Respect', 'Honesty'],
    rules: [
      'Be Respectful',
      'Do Not Swear',
      'Make Sure To Be Civil'
    ],
    moderators: [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' }
    ]
  } : null;

  if (loading) {
    return (
      <div className="layout">
        <Navbar />
        <div className="content-wrapper">
          <div className="sidebar-container">
            <Sidebar />
          </div>
          <div className="main-content thread-view-main">
            <div className="loading">Loading thread...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="layout">
        <Navbar />
        <div className="content-wrapper">
          <div className="sidebar-container">
            <Sidebar />
          </div>
          <div className="main-content thread-view-main">
            <div className="not-found">
              <h2>Thread not found</h2>
              <p>{error || "The requested thread could not be found."}</p>
              <button 
                className="return-home-btn"
                onClick={() => navigate('/')}
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <Navbar />
      <div className="content-wrapper">
        <div className="sidebar-container">
          <Sidebar />
        </div>
        <div className="main-content thread-view-main">
          <div className="thread-header">
            <div className="thread-title-section">
              <h1 className="thread-title">{thread.title}</h1>
              <div className="thread-subtitle">
                <span className="thread-community">{thread.community}</span>
                <span className="thread-date">Created: {thread.createdAt}</span>
              </div>
              {thread.description && (
                <p className="thread-description">{thread.description}</p>
              )}
            </div>
            
            <div className="thread-actions">
              <Button
                variant="primary"
                onClick={createNewPost}
                className="new-post-btn"
              >
                Add to Thread
              </Button>
            </div>
          </div>

          <div className="thread-content-container">
            <div className="thread-posts-section">
              <h2 className="posts-title">Posts ({thread.posts.length})</h2>
              
              {/* Thread posts, sorted by date (newest first) */}
              {thread.posts
                .slice()
                .reverse()
                .map((post, index) => (
                  <div key={post.id} className={`thread-post ${index === 0 ? 'latest-post' : ''}`}>
                    <div className="post-header">
                      <div className="post-author-info">
                        <div className="post-author-icon">C</div>
                        <div className="post-author">{post.author}</div>
                        <div className="post-date">{post.date}</div>
                      </div>
                    </div>
                    
                    <div className="post-content-wrapper">
                      <div className="post-status-tags">
                        <div className={`status-tag status-${post.status}`}>
                          {post.status === 'just-started' ? 'Just Started' : 
                           post.status === 'in-progress' ? 'In Progress' : 
                           post.status === 'near-completion' ? 'Near Completion' : 'Done'}
                        </div>
                        
                        <div className="edit-number-tag">
                          {post.editNumber === 1 ? '1st Edit' : 
                           post.editNumber === 2 ? '2nd Edit' : 
                           post.editNumber === 3 ? '3rd Edit' : 
                           `${post.editNumber}th Edit`}
                        </div>
                      </div>
                      
                      <h3 className="post-title">{post.title}</h3>
                      
                      <div className="post-content-layout">
                        <div className="post-text-content">
                          <p className="post-text">{post.description}</p>
                        </div>
                        <div className="post-image-container">
                          {post.image ? (
                            <img src={post.image} alt="Critique" className="post-image" />
                          ) : (
                            <div className="post-image-placeholder"></div>
                          )}
                        </div>
                      </div>
                      
                      {index === 0 && (
                        <div className="post-footer">
                          <div className="post-reactions">
                            <button className="reaction-btn">
                              Like <span className="reaction-count">10</span>
                            </button>
                            <button className="reaction-btn">
                              Hearts <span className="reaction-count">5</span>
                            </button>
                          </div>
                          
                          <button 
                            className="enter-whiteboard-btn"
                            onClick={goToWhiteboard}
                          >
                            Enter Critique
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="community-sidebar-container">
              <div className="community-header">
                <h2 className="community-name">{communityInfo.name}</h2>
                <button className="join-btn">Join</button>
              </div>
              
              <p className="community-description">{communityInfo.description}</p>
              
              <div className="community-meta">
                <div>Created on {communityInfo.createdDate}</div>
                <div>{communityInfo.visibility}</div>
              </div>
              
              <div className="community-stats">
                <div className="stat-group">
                  <div className="stat-value">{communityInfo.stats.members}</div>
                  <div className="stat-label">Members</div>
                </div>
                <div className="stat-group">
                  <div className="stat-value">{communityInfo.stats.online}</div>
                  <div className="stat-label">Online</div>
                </div>
              </div>
              
              <div className="community-section">
                <h3 className="section-title">COMMUNITY GUIDELINES</h3>
                <div className="guidelines-list">
                  {communityInfo.guidelines.map((guideline, index) => (
                    <div key={index} className="guideline-item">{guideline}</div>
                  ))}
                </div>
              </div>
              
              <div className="community-section">
                <h3 className="section-title">RULES</h3>
                <ol className="rules-list">
                  {communityInfo.rules.map((rule, index) => (
                    <li key={index} className="rule-item">{rule}</li>// src/pages/ThreadView.jsx (continued)

                ))}
              </ol>
            </div>
            
            <div className="community-section">
              <h3 className="section-title">Moderators</h3>
              <div className="moderators-list">
                {communityInfo.moderators.map((mod) => (
                  <div key={mod.id} className="moderator-item">
                    <div className="moderator-icon"></div>
                    <div className="moderator-name">{mod.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default ThreadView;