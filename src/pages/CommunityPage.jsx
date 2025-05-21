// src/pages/CommunityPage.jsx (improved)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import critiqueService from '../services/CritiqueService';
import CritiqueCard from '../components/common/CritiqueCard';
import { useAuth } from '../contexts/AuthContext';
import './CommunityPage.css';

// Reaction component to use directly in CommunityPage
const ReactionButtons = ({ postId, initialLikes = 0, initialHearts = 0 }) => {
  // State for tracking reactions
  const [likes, setLikes] = useState(initialLikes);
  const [hearts, setHearts] = useState(initialHearts);
  const [isLiked, setIsLiked] = useState(false);
  const [isHearted, setIsHearted] = useState(false);
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Check if we have a reaction service
    if (typeof window.reactionService !== 'undefined') {
      // Initialize the post with default reaction counts if it doesn't exist yet
      window.reactionService.initializePost(postId, initialLikes, initialHearts);
      
      // Get current reaction counts
      const { likes, hearts } = window.reactionService.getReactionCounts(postId);
      setLikes(likes);
      setHearts(hearts);
      
      // Get user's reaction status if logged in
      if (currentUser) {
        const { hasLiked, hasHearted } = window.reactionService.getUserReactions(
          currentUser.displayName, 
          postId
        );
        setIsLiked(hasLiked);
        setIsHearted(hasHearted);
      }
    }
  }, [postId, initialLikes, initialHearts, currentUser]);
  
  // Handle like button click
  const handleLikeClick = () => {
    if (!currentUser) {
      alert('Please sign in to react to posts');
      return;
    }
    
    if (typeof window.reactionService !== 'undefined') {
      const { hasLiked, likesCount } = window.reactionService.toggleLike(
        currentUser.displayName, 
        postId
      );
      setIsLiked(hasLiked);
      setLikes(likesCount);
    } else {
      // Fallback if reaction service is not available
      setIsLiked(!isLiked);
      setLikes(isLiked ? likes - 1 : likes + 1);
    }
  };
  
  // Handle heart button click
  const handleHeartClick = () => {
    if (!currentUser) {
      alert('Please sign in to react to posts');
      return;
    }
    
    if (typeof window.reactionService !== 'undefined') {
      const { hasHearted, heartsCount } = window.reactionService.toggleHeart(
        currentUser.displayName, 
        postId
      );
      setIsHearted(hasHearted);
      setHearts(heartsCount);
    } else {
      // Fallback if reaction service is not available
      setIsHearted(!isHearted);
      setHearts(isHearted ? hearts - 1 : hearts + 1);
    }
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

const CommunityPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  
  // Thread-related states
  const [threads, setThreads] = useState([]);
  const [expandedThreads, setExpandedThreads] = useState({});
  const [threadPosts, setThreadPosts] = useState({});
  const [mostRecentPost, setMostRecentPost] = useState(null);

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
        if (currentUser) {
          // Creator check
          const isCreator = 
            communityData.creatorUsername === currentUser.displayName;
          
          setIsCreator(isCreator);
          
          // Following check
          try {
            const following = await critiqueService.isUserFollowingCommunity(
              currentUser.displayName,
              communityData.id
            );
            setIsFollowing(following);
          } catch (err) {
            console.error('Error checking if user follows community:', err);
          }
        }
        
        // Get all posts for this community
        const communityPosts = await critiqueService.getAllPosts(formattedName);
        
        // Store all posts
        setPosts(communityPosts || []);
        
        // Identify and set the most recent post
        if (communityPosts && communityPosts.length > 0) {
          // Sort by creation date (newest first)
          const sortedPosts = [...communityPosts].sort((a, b) => {
            // Convert date strings to Date objects for comparison
            const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(a.date);
            const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(b.date);
            return dateB - dateA;
          });
          
          // Set the most recent post
          setMostRecentPost(sortedPosts[0]);
          
          // Identify threads (posts without a threadId)
          const identifiedThreads = communityPosts.filter(post => !post.threadId);
          setThreads(identifiedThreads);
          
          // Initialize expanded state for each thread
          const expanded = {};
          const postsMap = {};
          
          // Group posts by their thread
          identifiedThreads.forEach(thread => {
            expanded[thread.id] = false;
            // Find posts that belong to this thread
            postsMap[thread.id] = communityPosts.filter(
              post => post.threadId === thread.id
            );
          });
          
          setExpandedThreads(expanded);
          setThreadPosts(postsMap);
        }
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
  }, [name, formattedName, currentUser]);

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
      if (!currentUser) {
        alert("Please log in to join communities");
        return;
      }
      
      if (isFollowing) {
        await critiqueService.unfollowCommunity(currentUser.displayName, community.id);
        setIsFollowing(false);
        alert(`Left ${community.name}`);
      } else {
        await critiqueService.followCommunity(currentUser.displayName, community.id);
        setIsFollowing(true);
        alert(`Joined ${community.name}`);
      }
    } catch (error) {
      console.error('Error joining/leaving community:', error);
      alert("Failed to join/leave community. Please try again.");
    }
  };

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
  
  // Function to navigate to add post to specific thread
  const addPostToThread = (threadId) => {
    navigate(`/create-post/${name}?threadId=${threadId}`);
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
          {posts.length === 0 ? (
            <div className="empty-community-message">
              <p>No posts in this community yet. Be the first to create one!</p>
              <button 
                className="primary-button"
                onClick={handleCreatePost}
              >
                Create the First Post
              </button>
            </div>
          ) : (
            <>
              {/* Most Recent Post Section */}
              {mostRecentPost && (
                <div className="most-recent-post-section">
                  <h2 className="section-title">Most Recent</h2>
                  <div className="critique-post main-post">
                    <div className="post-header">
                      <div className="post-author-info">
                        <div className="post-author-avatar"></div>
                        <div className="post-author">{mostRecentPost.authorName}</div>
                        <div className="post-date">{mostRecentPost.date}</div>
                      </div>
                    </div>
                    
                    <div className="post-content-wrapper">
                      <div className="post-status-tags">
                        <div className={`status-tag status-${mostRecentPost.status}`}>
                          {mostRecentPost.status.replace(/-/g, ' ')}
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
                          {mostRecentPost.imageUrl && (
                            <img 
                              src={mostRecentPost.imageUrl} 
                              alt={mostRecentPost.title} 
                              className="post-image"
                            />
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
              
              {/* Threads Section */}
              {threads.length > 0 && (
                <div className="threads-section">
                  <h2 className="section-title">Threads</h2>
                  
                  {threads.map((thread) => (
                    <div key={thread.id} className="thread-container">
                      <div className="critique-post thread-post">
                        <div className="thread-badge">Thread</div>
                        <div className="post-header">
                          <div className="post-author-info">
                            <div className="post-author-avatar"></div>
                            <div className="post-author">{thread.authorName}</div>
                            <div className="post-date">{thread.date}</div>
                          </div>
                        </div>
                        
                        <div className="post-content-wrapper">
                          <div className="post-status-tags">
                            <div className={`status-tag status-${thread.status}`}>
                              {thread.status.replace(/-/g, ' ')}
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
                              {thread.imageUrl && (
                                <img 
                                  src={thread.imageUrl} 
                                  alt={thread.title} 
                                  className="post-image"
                                />
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
                                className="enter-whiteboard-btn"
                                onClick={() => goToWhiteboard(thread.id)}
                              >
                                Enter Critique
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
                              <div key={post.id} className="critique-post thread-child-post">
                                <div className="post-header">
                                  <div className="post-author-info">
                                    <div className="post-author-avatar"></div>
                                    <div className="post-author">{post.authorName}</div>
                                    <div className="post-date">{post.date}</div>
                                  </div>
                                </div>
                                
                                <div className="post-content-wrapper">
                                  <div className="post-status-tags">
                                    <div className={`status-tag status-${post.status}`}>
                                      {post.status.replace(/-/g, ' ')}
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
                                      {post.imageUrl && (
                                        <img 
                                          src={post.imageUrl} 
                                          alt={post.title} 
                                          className="post-image"
                                        />
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
                              <p>No posts in this thread yet.</p>
                              <button 
                                className="add-post-btn"
                                onClick={() => addPostToThread(thread.id)}
                              >
                                Add the First Post
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Regular Posts Section (if not already displayed as most recent or threads) */}
              {posts.filter(post => 
                post.id !== mostRecentPost?.id && 
                !threads.some(thread => thread.id === post.id) &&
                !threads.some(thread => threadPosts[thread.id]?.some(p => p.id === post.id))
              ).length > 0 && (
                <div className="regular-posts-section">
                  <h2 className="section-title">Other Posts</h2>
                  <div className="posts-grid">
                    {posts.filter(post => 
                      post.id !== mostRecentPost?.id && 
                      !threads.some(thread => thread.id === post.id) &&
                      !threads.some(thread => threadPosts[thread.id]?.some(p => p.id === post.id))
                    ).map(post => (
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
                </div>
              )}
            </>
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