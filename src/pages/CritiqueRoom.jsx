// src/pages/CritiqueRoom.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Button from '../components/common/Button';
import critiqueService from '../pages/CritiqueService'; // Make sure this path is correct
import JoinButton from '../components/common/JoinButton';
import UserAvatar from '../components/common/UserAvatar';
import reactionService from '../components/common/ReactService'; // Import ReactionService

import './CritiqueRoom.css';

// Reaction component to use directly in CritiqueRoom
const ReactionButtons = ({ postId, initialLikes = 0, initialHearts = 0 }) => {
  // State for tracking reactions
  const [likes, setLikes] = useState(initialLikes);
  const [hearts, setHearts] = useState(initialHearts);
  const [isLiked, setIsLiked] = useState(false);
  const [isHearted, setIsHearted] = useState(false);
  
  // Current user - in a real app would come from auth context
  const currentUser = 'lijune.choi20';
  
  useEffect(() => {
    // Initialize the post with default reaction counts if it doesn't exist yet
    reactionService.initializePost(postId, initialLikes, initialHearts);
    
    // Get current reaction counts
    const { likes, hearts } = reactionService.getReactionCounts(postId);
    setLikes(likes);
    setHearts(hearts);
    
    // Get user's reaction status
    const { hasLiked, hasHearted } = reactionService.getUserReactions(currentUser, postId);
    setIsLiked(hasLiked);
    setIsHearted(hasHearted);
  }, [postId, initialLikes, initialHearts]);
  
  // Handle like button click
  const handleLikeClick = () => {
    const { hasLiked, likesCount } = reactionService.toggleLike(currentUser, postId);
    setIsLiked(hasLiked);
    setLikes(likesCount);
  };
  
  // Handle heart button click
  const handleHeartClick = () => {
    const { hasHearted, heartsCount } = reactionService.toggleHeart(currentUser, postId);
    setIsHearted(hasHearted);
    setHearts(heartsCount);
  };

  return (
    <div className="post-reactions">
      <button 
        className={`reaction-btn ${isLiked ? 'active' : ''}`}
        onClick={handleLikeClick}
      >
        {isLiked ? '✓ Needs Work' : 'Needs Work'} <span className="reaction-count">{likes}</span>
      </button>
      <button 
        className={`reaction-btn ${isHearted ? 'active' : ''}`}
        onClick={handleHeartClick}
      >
        {isHearted ? '❤️ Finished' : 'Finished'} <span className="reaction-count">{hearts}</span>
      </button>
    </div>
  );
};

const CritiqueRoom = ({ communityKey }) => {
  const { communityName } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mostRecentPost, setMostRecentPost] = useState(null);
  const [threads, setThreads] = useState([]);
  const [expandedThreads, setExpandedThreads] = useState({});
  const [threadPosts, setThreadPosts] = useState({});
  const [error, setError] = useState(null);
  const [hasPosts, setHasPosts] = useState(false);

  // Debug function to log community resolution
  const debugCommunityResolution = (key) => {
    console.log('Community Resolution Debug:');
    console.log('Input Community Key:', key);
    console.log('URL Community Name:', communityName);
    console.log('Prop Community Key:', communityKey);
  };

  // Community information mapping
  const communityInfoMap = {
    'r/ijuneneedshelp': {
      id: 1,
      name: 'r/ijuneneedshelp',
      description: 'Community board for Iijune to get feedback for design',
      createdDate: 'Mar 13, 2024',
      visibility: 'Public',
      stats: {
        members: 20,
        online: 10
      },
      guidelines: ['Respect Design Process', 'Constructive Feedback'],
      rules: [
        'Be Respectful',
        'Provide Specific Feedback',
        'Focus on Design Improvement'
      ],
      moderators: [
        { id: 1, name: 'Iijune' },
        { id: 2, name: 'DesignMentor' }
      ]
    },
    'r/Graphic4ever': {
      id: 2,
      name: 'r/Graphic4ever',
      description: 'A community for graphic designers to share and critique professional work',
      createdDate: 'Jan 15, 2024',
      visibility: 'Public',
      stats: {
        members: 50,
        online: 25
      },
      guidelines: ['Professional Critique', 'Portfolio Development'],
      rules: [
        'Maintain Professional Tone',
        'Provide Constructive Insights',
        'Respect Intellectual Property'
      ],
      moderators: [
        { id: 1, name: 'GraphicPro' },
        { id: 2, name: 'CreativeLead' }
      ]
    }
  };

  // Determine effective community key
  const effectiveCommunityKey = (() => {
    if (communityName) return `r/${communityName}`;
    if (communityKey) return communityKey;
    return 'r/ijuneneedshelp';
  })();

  // Fetch community details
  const [communityInfo, setCommunityInfo] = useState({
    name: effectiveCommunityKey.replace(/^r\//, ''),
    description: ''
  });

  // Function to toggle thread expansion
  const toggleThreadExpansion = (threadId) => {
    setExpandedThreads(prev => ({
      ...prev,
      [threadId]: !prev[threadId]
    }));
  };
  
  // Function to navigate to whiteboard
  const goToWhiteboard = (postId) => {
    navigate(`/whiteboard/${postId}`);
  };
  
  // Function to navigate to create new post page
  const createNewPost = () => {
    navigate('/create-critique-post');
  };
  
  // Function to navigate to add post to specific thread
  const addPostToThread = (threadId) => {
    navigate(`/create-critique-post?threadId=${threadId}`);
  };

  // Load data: most recent post and threads with their posts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Debug community resolution
        debugCommunityResolution(effectiveCommunityKey);
        
        const allPosts = await critiqueService.getAllPosts(effectiveCommunityKey);
        
        // Check if there are any posts
        setHasPosts(allPosts.length > 0);
        
        // Get the most recent post
        if (allPosts.length > 0) {
          setMostRecentPost(allPosts[0]);
        }
        
        // Get all threads for the specific community
        const allThreads = await critiqueService.getAllThreads(effectiveCommunityKey);
        setThreads(allThreads);
        
        // Initialize expanded state for each thread
        const expanded = {};
        const postsMap = {};
        
        // Preload posts for each thread
        await Promise.all(allThreads.map(async (thread) => {
          expanded[thread.id] = false;
          const threadPostsData = await critiqueService.getPostsInThread(thread.id);
          // Remove the thread itself from the posts list
          postsMap[thread.id] = threadPostsData.filter(post => post.id !== thread.id);
        }));
        
        setExpandedThreads(expanded);
        setThreadPosts(postsMap);
      } catch (error) {
        console.error("Error loading critique data:", error);
        setError('Failed to load critique data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [effectiveCommunityKey]);

  // Fetch community details
  useEffect(() => {
    const fetchCommunityDetails = async () => {
      try {
        // First, try to get from hardcoded map
        const mappedCommunity = communityInfoMap[effectiveCommunityKey];
        if (mappedCommunity) {
          setCommunityInfo(mappedCommunity);
          return;
        }

        // If not in map, try service
        const community = await critiqueService.getCommunityByName(effectiveCommunityKey);
        if (community) {
          setCommunityInfo(community);
        }
      } catch (error) {
        console.error('Error fetching community details:', error);
      }
    };
  
    fetchCommunityDetails();
  }, [effectiveCommunityKey]);

  // Loading state
  if (loading) {
    return (
      <div className="layout">
        <Navbar />
        <div className="content-wrapper">
          <div className="sidebar-container">
            <Sidebar />
          </div>
          <div className="main-content critique-room-main">
            <div className="loading">Loading critique posts...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="layout">
        <Navbar />
        <div className="content-wrapper">
          <div className="sidebar-container">
            <Sidebar />
          </div>
          <div className="main-content critique-room-main">
            <div className="error-message">
              {error}
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
        <div className="main-content critique-room-main">
          <div className="critique-room-header">
            <div className="critique-room-title-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/">
                <button className="circle-button" style={{ width: '32px', height: '32px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </Link>
              <h1 className="critique-room-title">{communityInfo.name}</h1>
            </div>
            <div className="critique-room-actions">
              <Button
                variant="primary"
                onClick={createNewPost}
                className="new-post-btn"
              >
                New Post
              </Button>
            </div>
          </div>

          <div className="critique-content-container">
            <div className="critique-posts-section">
              {!hasPosts ? (
                <div className="empty-community-message">
                  <p>No posts in this community yet. Be the first to create one!</p>
                </div>
              ) : (
                <>
                  {/* Most Recent Post */}
                  {mostRecentPost && (
                    <div className="section-container">
                      <h2 className="section-title">Most Recent</h2>
                      <div className="critique-post main-post">
                        {mostRecentPost.threadId === null && (
                          <div className="thread-badge2">Thread</div>
                        )}
                        <div className="post-header">
                          <div className="post-author-info">
                            <UserAvatar 
                              username={mostRecentPost.author || mostRecentPost.community.replace('r/', '')}
                              size="small"
                            />
                            <div className="post-author">{mostRecentPost.community}</div>
                            <div className="post-date">{mostRecentPost.date}</div>
                          </div>
                        </div>
                        
                        <div className="post-content-wrapper">
                          <div className="post-status-tags">
                            <div className={`status-tag status-${mostRecentPost.status}`}>
                              {mostRecentPost.status === 'just-started' ? 'Just Started' : 
                               mostRecentPost.status === 'in-progress' ? 'In Progress' : 
                               mostRecentPost.status === 'near-completion' ? 'Near Completion' : 'Done'}
                            </div>
                            
                            <div className="edit-number-tag">
                              {mostRecentPost.editNumber === 1 ? '1st Edit' : 
                               mostRecentPost.editNumber === 2 ? '2nd Edit' : 
                               mostRecentPost.editNumber === 3 ? '3rd Edit' : 
                               `${mostRecentPost.editNumber}th Edit`}
                            </div>
                          </div>
                          
                          <h2 className="post-title">{mostRecentPost.title}</h2>
                          
                          <div className="post-content-layout">
                            <div className="post-text-content">
                              <p className="post-text">{mostRecentPost.description}</p>
                            </div>
                            <div className="post-image-container">
                              {mostRecentPost.imageUrl ? (
                                <img 
                                  src={mostRecentPost.imageUrl} 
                                  alt="Critique" 
                                  className="post-image"
                                />
                              ) : mostRecentPost.image ? (
                                <img 
                                  src={mostRecentPost.image} 
                                  alt="Critique" 
                                  className="post-image"
                                />
                              ) : (
                                <div className="post-image-placeholder"></div>
                              )}
                            </div>
                          </div>
                          
                          <div className="post-footer">
                            <ReactionButtons
                              postId={mostRecentPost.id}
                              initialLikes={10}
                              initialHearts={5}
                            />
                            
                            <button 
                              className="enter-whiteboard-btn"
                              onClick={() => goToWhiteboard(mostRecentPost.id)}
                            >
                              Enter Critique
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Threads */}
                  {threads.length > 0 && (
                    <div className="section-container">
                      <h2 className="section-title">Threads</h2>
                      
                      {threads.map((thread) => (
                        <div key={thread.id} className="thread-container">
                          <div className="critique-post thread-item">
                            <div className="thread-badge2">Thread</div>
                            <div className="post-header">
                              <div className="post-author-info">
                                <UserAvatar 
                                  username={thread.author || thread.community.replace('r/', '')}
                                  size="small"
                                />
                                <div className="post-author">{thread.community}</div>
                                <div className="post-date">{thread.date}</div>
                              </div>
                            </div>
                            
                            <div className="post-content-wrapper">
                              <div className="post-status-tags">
                                <div className={`status-tag status-${thread.status}`}>
                                  {thread.status === 'just-started' ? 'Just Started' : 
                                   thread.status === 'in-progress' ? 'In Progress' : 
                                   thread.status === 'near-completion' ? 'Near Completion' : 'Done'}
                                </div>
                                
                                <div className="edit-number-tag">
                                  {thread.editNumber === 1 ? '1st Edit' : 
                                   thread.editNumber === 2 ? '2nd Edit' : 
                                   thread.editNumber === 3 ? '3rd Edit' : 
                                   `${thread.editNumber}th Edit`}
                                </div>
                              </div>
                              
                              <h2 className="post-title">{thread.title}</h2>
                              
                              <div className="post-content-layout">
                                <div className="post-text-content">
                                  <p className="post-text">{thread.description}</p>
                                </div>
                                <div className="post-image-container">
                                  {thread.imageUrl ? (
                                    <img 
                                      src={thread.imageUrl} 
                                      alt="Critique" 
                                      className="post-image"
                                    />
                                  ) : thread.image ? (
                                    <img 
                                      src={thread.image} 
                                      alt="Critique" 
                                      className="post-image"
                                    />
                                  ) : (
                                    <div className="post-image-placeholder"></div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="post-footer">
                                <ReactionButtons
                                  postId={thread.id}
                                  initialLikes={8}
                                  initialHearts={4}
                                />
                                
                                <div className="thread-actions">
                                  <button 
                                    className="toggle-thread-btn"
                                    onClick={() => toggleThreadExpansion(thread.id)}
                                  >
                                    {expandedThreads[thread.id] ? 'Hide Posts' : 'Show Posts'} 
                                    {threadPosts[thread.id]?.length > 0 && (
                                      <span className="post-count">({threadPosts[thread.id].length})</span>
                                    )}
                                  </button>
                                  <button 
                                    className="add-post-btn"
                                    onClick={() => addPostToThread(thread.id)}
                                  >
                                    Add Post
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Posts in Thread */}
                          {expandedThreads[thread.id] && threadPosts[thread.id] && (
                            <div className="thread-posts">
                              {threadPosts[thread.id].length > 0 ? (
                                threadPosts[thread.id].map((post) => (
                                  <div key={post.id} className="critique-post thread-post">
                                    <div className="post-header">
                                      <div className="post-author-info">
                                        <UserAvatar 
                                          username={post.author || post.community.replace('r/', '')}
                                          size="small"
                                        />
                                        <div className="post-author">{post.community}</div>
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
                                      
                                      <h2 className="post-title">{post.title}</h2>
                                      
                                      <div className="post-content-layout">
                                        <div className="post-text-content">
                                          <p className="post-text">{post.description}</p>
                                        </div>
                                        <div className="post-image-container">
                                          {post.imageUrl ? (
                                            <img 
                                              src={post.imageUrl} 
                                              alt="Critique" 
                                              className="post-image"
                                            />
                                          ) : post.image ? (
                                            <img 
                                              src={post.image} 
                                              alt="Critique" 
                                              className="post-image"
                                            />
                                          ) : (
                                            <div className="post-image-placeholder"></div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="post-footer">
                                        <ReactionButtons
                                          postId={post.id}
                                          initialLikes={3}
                                          initialHearts={1}
                                        />
                                        
                                        <button 
                                          className="enter-whiteboard-btn"
                                          onClick={() => goToWhiteboard(post.id)}
                                        >
                                          Enter Critique
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="empty-thread-message">
                                  No posts in this thread yet.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="community-sidebar-container">
              <div className="community-header">
                <h2 className="community-name">{communityInfo.name}</h2>
                <JoinButton 
                  communityId={communityInfo.id} 
                  communityName={communityInfo.name}
                  onJoinStatusChange={(action, communityId, communityName) => {
                    // Optional: Show a toast notification
                    const message = action === 'followed' 
                      ? `Joined ${communityName}` 
                      : `Left ${communityName}`;
                    console.log(message);
                  }}
                />
              </div>
              
              <p className="community-description">{communityInfo.description}</p>
              
              <div className="community-meta">
                <div>Created {communityInfo.createdDate}</div>
                <div>{communityInfo.visibility}</div>
              </div>
              
              <div className="community-stats">
                <div className="stat-group">
                  <div className="stat-value">{communityInfo.stats?.members || 0}</div>
                  <div className="stat-label">Members</div>
                </div>
                <div className="stat-group">
                  <div className="stat-value">{communityInfo.stats?.online || 0}</div>
                  <div className="stat-label">Online</div>
                </div>
              </div>
              
              <div className="community-section">
                <h3 className="section-title">COMMUNITY GUIDELINES</h3>
                <div className="guidelines-list">
                  {communityInfo.guidelines && communityInfo.guidelines.map((guideline, index) => (
                    <div key={index} className="guideline-item">{guideline}</div>
                  ))}
                </div>
              </div>
              
              <div className="community-section">
                <h3 className="section-title">RULES</h3>
                <ol className="rules-list">
                  {communityInfo.rules && communityInfo.rules.map((rule, index) => (
                    <li key={index} className="rule-item">{rule}</li>
                  ))}
                </ol>
              </div>
              
              <div className="community-section">
                <h3 className="section-title">Moderators</h3>
                <div className="moderators-list">
                  {communityInfo.moderators && communityInfo.moderators.map((mod) => (
                    <div key={mod.id} className="moderator-item">
                      <UserAvatar
                        username={mod.name}
                        size="small"
                        showModal={true}
                      />
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

export default CritiqueRoom;
