// src/pages/CreatePost.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import critiqueService from '../services/CritiqueService';
import { useAuth } from '../contexts/AuthContext';
import './CreatePost.css';

const CreatePost = ({ redirectToWhiteboard = true }) => {
  const { community } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  console.log("Current user in CreatePost:", currentUser);
  
  // Parse query parameters to check for threadId
  const queryParams = new URLSearchParams(location.search);
  const threadId = queryParams.get('threadId');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'just-started',
    communityName: '',
    community: '', // This will hold the community ID
    imageFile: null,
    threadId: threadId || null // Set threadId if provided in query params
  });
  
  const [preview, setPreview] = useState(null);
  const [communityDetails, setCommunityDetails] = useState(null);
  const [threadDetails, setThreadDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For community selection
  const [availableCommunities, setAvailableCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  
  // For thread selection
  const [availableThreads, setAvailableThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [showThreadPreview, setShowThreadPreview] = useState(false);
  
  // Fetch available communities on initial load
  useEffect(() => {
    fetchCommunities();
  }, [currentUser]);
  
  // Fetch communities from Firebase
  const fetchCommunities = async () => {
    try {
      setLoadingCommunities(true);
      console.log("Fetching communities...");
      
      // Fetch all available communities using the critiqueService
      const allCommunities = await critiqueService.getAllCommunities();
      console.log("All communities fetched:", allCommunities);
      
      if (!allCommunities || allCommunities.length === 0) {
        console.warn("No communities found");
        setAvailableCommunities([]);
        setLoadingCommunities(false);
        return;
      }
      
      let accessibleCommunities = [];
      
      if (currentUser) {
        console.log("User is logged in:", currentUser.displayName);
        
        try {
          // Get communities the user follows
          const followedCommunities = await critiqueService.getUserFollowedCommunities(currentUser.displayName);
          console.log("Followed communities:", followedCommunities);
          
          // Get communities the user created/moderates
          const createdCommunities = await critiqueService.getUserCreatedCommunities(currentUser.displayName);
          console.log("Created communities:", createdCommunities);
          
          // Combine unique communities from both sources
          const userAccessibleIds = new Set();
          
          // Add followed communities
          if (followedCommunities && followedCommunities.length > 0) {
            followedCommunities.forEach(c => userAccessibleIds.add(c.id));
          }
          
          // Add created/moderated communities
          if (createdCommunities && createdCommunities.length > 0) {
            createdCommunities.forEach(c => userAccessibleIds.add(c.id));
          }
          
          console.log("User has access to community IDs:", Array.from(userAccessibleIds));
          
          // Filter all communities to include:
          // 1. All public communities
          // 2. Private communities the user has access to (followed or created)
          accessibleCommunities = allCommunities.filter(c => 
            c.visibility === 'Public' || userAccessibleIds.has(c.id)
          );
        } catch (err) {
          console.error("Error determining user's accessible communities:", err);
          // Fall back to just showing public communities
          accessibleCommunities = allCommunities.filter(c => c.visibility === 'Public');
        }
      } else {
        console.log("No user logged in, showing only public communities");
        // If no user is logged in, only show public communities
        accessibleCommunities = allCommunities.filter(c => c.visibility === 'Public');
      }
      
      console.log("Accessible communities:", accessibleCommunities);
      
      // Also check if the user is a member or moderator of any community
      if (currentUser && allCommunities.length > accessibleCommunities.length) {
        const privateNotExplicitlyFollowed = allCommunities.filter(c => 
          c.visibility === 'Private' && 
          !accessibleCommunities.some(ac => ac.id === c.id)
        );
        
        // For each private community, check if user is a member or moderator
        const additionalAccessible = [];
        
        for (const community of privateNotExplicitlyFollowed) {
          if (
            (community.members && community.members.includes(currentUser.displayName)) ||
            (community.members && community.members.includes(currentUser.uid)) ||
            (community.moderators && community.moderators.includes(currentUser.displayName)) ||
            (community.moderators && community.moderators.includes(currentUser.uid))
          ) {
            console.log("User has access to private community via membership:", community.name);
            additionalAccessible.push(community);
          }
        }
        
        // Add these to the accessible communities
        accessibleCommunities = [...accessibleCommunities, ...additionalAccessible];
      }
      
      // Sort communities alphabetically
      accessibleCommunities.sort((a, b) => a.name.localeCompare(b.name));
      
      setAvailableCommunities(accessibleCommunities);
    } catch (err) {
      console.error('Error fetching communities:', err);
      setError('Failed to load communities. Please try again.');
      setAvailableCommunities([]);
    } finally {
      setLoadingCommunities(false);
    }
  };
  
  // Fetch initial thread and community details
  useEffect(() => {
    const fetchInitialDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // If community name is provided in URL, fetch its details
        if (community) {
          await fetchCommunityByName(community);
        }
        
        // If threadId is provided, fetch the thread details
        if (threadId) {
          await fetchThreadDetails(threadId);
        }
      } catch (err) {
        console.error('Error fetching initial details:', err);
        setError('Failed to load initial data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialDetails();
  }, [community, threadId]);
  
  // Fetch community by name
  const fetchCommunityByName = async (communityName) => {
    try {
      // Format the community name if needed
      const formattedName = communityName.startsWith('r/') ? communityName : `r/${communityName}`;
      console.log("Fetching community by name:", formattedName);
      
      const communityData = await critiqueService.getCommunityByName(formattedName);
      console.log("Community data fetched:", communityData);
      
      if (communityData) {
        setCommunityDetails(communityData);
        setFormData(prev => ({
          ...prev,
          communityName: communityData.name,
          community: communityData.id
        }));
        
        // If community is found, fetch threads for it
        fetchThreadsForCommunity(communityData.id, communityData.name);
      } else {
        console.error(`Community "${formattedName}" not found`);
        setError(`Community "${formattedName}" not found`);
      }
    } catch (err) {
      console.error('Error fetching community by name:', err);
      throw err;
    }
  };
  
  // Fetch thread details
  const fetchThreadDetails = async (threadId) => {
    try {
      console.log("Fetching thread details for ID:", threadId);
      const thread = await critiqueService.getPostById(threadId);
      console.log("Thread data fetched:", thread);
      
      if (thread) {
        setThreadDetails(thread);
        setShowThreadPreview(true);
        
        // Set threadId in form data
        setFormData(prev => ({
          ...prev,
          threadId: threadId
        }));
        
        // If community wasn't specified in URL, use the thread's community
        if (!community && thread.communityName) {
          console.log("Using thread's community:", thread.communityName);
          await fetchCommunityByName(thread.communityName);
        }
      } else {
        console.error(`Thread with ID "${threadId}" not found`);
        setError(`Thread with ID "${threadId}" not found`);
      }
    } catch (err) {
      console.error('Error fetching thread details:', err);
      throw err;
    }
  };
  
  // Fetch threads for a community
  const fetchThreadsForCommunity = async (communityId, communityName) => {
    try {
      setLoadingThreads(true);
      console.log("Fetching threads for community:", communityName);
      
      // Fetch posts for the selected community
      const posts = await critiqueService.getAllPosts(communityName);
      console.log("Posts fetched for community:", posts);
      
      // Filter to only include posts that can be threads (posts without threadId)
      const threads = posts.filter(post => !post.threadId);
      console.log("Filtered threads:", threads);
      
      setAvailableThreads(threads);
    } catch (err) {
      console.error('Error fetching threads for community:', err);
      setAvailableThreads([]);
    } finally {
      setLoadingThreads(false);
    }
  };
  
  // Handle community selection change
  const handleCommunityChange = async (e) => {
    const communityId = e.target.value;
    console.log("Community selected:", communityId);
    
    if (!communityId) {
      // Clear community details if none selected
      setCommunityDetails(null);
      setFormData(prev => ({
        ...prev,
        community: '',
        communityName: ''
      }));
      setAvailableThreads([]);
      return;
    }
    
    // Find the selected community from available communities
    const selected = availableCommunities.find(c => c.id === communityId);
    console.log("Selected community:", selected);
    
    if (selected) {
      setCommunityDetails(selected);
      setFormData(prev => ({
        ...prev,
        community: selected.id,
        communityName: selected.name
      }));
      
      // Fetch threads for this community
      fetchThreadsForCommunity(selected.id, selected.name);
    } else {
      console.error("Selected community not found in available communities");
    }
  };
  
  // Handle thread selection change
  const handleThreadChange = async (e) => {
    const selectedThreadId = e.target.value;
    console.log("Thread selected:", selectedThreadId);
    
    if (!selectedThreadId || selectedThreadId === 'none') {
      setThreadDetails(null);
      setShowThreadPreview(false);
      setFormData(prev => ({
        ...prev,
        threadId: null
      }));
      return;
    }
    
    // Find the selected thread from available threads
    const selected = availableThreads.find(t => t.id === selectedThreadId);
    console.log("Selected thread:", selected);
    
    if (selected) {
      setThreadDetails(selected);
      setShowThreadPreview(true);
      setFormData(prev => ({
        ...prev,
        threadId: selectedThreadId
      }));
    } else {
      console.error("Selected thread not found in available threads");
    }
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setFormData({ ...formData, imageFile: file });
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, imageFile: null });
      setPreview(null);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!currentUser) {
        setError('You need to be logged in to create a post');
        return;
      }
      
      // Make sure we have the necessary data
      if (!formData.title || !formData.community || !formData.imageFile) {
        setError('Please fill in all required fields and upload an image');
        return;
      }
      
      console.log("Creating post with data:", formData);
      
      // Create the post
      const newPost = await critiqueService.createPost({
        ...formData,
        author: currentUser.displayName
      });
      
      console.log('Post created successfully:', newPost);
      
      // Redirect directly to the whiteboard page for the new post
      if (redirectToWhiteboard) {
        navigate(`/whiteboard/${newPost.id}`);
      } else {
        // Fallback to post detail page if redirectToWhiteboard is false
        navigate(`/post/${newPost.id}`);
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(`Failed to create post: ${err.message || 'Unknown error'}`);
    }
  };
  
  if (isLoading) {
    return <div className="loading">Loading details...</div>;
  }
  
  return (
    <div className="create-post-container">
      <h1>{formData.threadId ? 'Add to Thread' : 'Create a New Post'}</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="create-post-form">
        {/* Community Selection - only show if not already specified in URL */}
        {!community && (
          <div className="form-group">
            <label htmlFor="community">Select Community *</label>
            <div className="community-selector">
              <select
                id="community"
                value={formData.community}
                onChange={handleCommunityChange}
                required
                className="community-select"
                disabled={loadingCommunities}
              >
                <option value="">Select a community</option>
                {availableCommunities.map(comm => (
                  <option key={comm.id} value={comm.id}>
                    {comm.name} {comm.visibility === 'Private' && '(Private)'}
                  </option>
                ))}
              </select>
              
              {loadingCommunities && (
                <div className="loading-indicator">Loading communities...</div>
              )}
              
              {availableCommunities.length === 0 && !loadingCommunities && (
                <div className="no-communities-message">
                  No communities available. <button type="button" onClick={fetchCommunities} className="refresh-btn">Refresh</button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Display community details */}
        {communityDetails && (
          <div className="community-info">
            <h2>Posting in: {communityDetails.name}</h2>
            <p>{communityDetails.description}</p>
          </div>
        )}
        
        {/* Thread Selection - only show if community is selected and not already specified in URL */}
        {formData.community && !threadId && availableThreads.length > 0 && (
          <div className="form-group">
            <label htmlFor="threadId">Add to Thread (Optional)</label>
            <div className="thread-selector">
              <select
                id="threadId"
                value={formData.threadId || 'none'}
                onChange={handleThreadChange}
                className="thread-select"
                disabled={loadingThreads}
              >
                <option value="none">Create as standalone post</option>
                {availableThreads.map(thread => (
                  <option key={thread.id} value={thread.id}>
                    {thread.title}
                  </option>
                ))}
              </select>
              
              {loadingThreads && (
                <div className="loading-indicator">Loading threads...</div>
              )}
              
              <div className="form-help-text">
                Adding to a thread will group your post with related posts
              </div>
            </div>
          </div>
        )}
        
        {/* Show thread details if selected */}
        {threadDetails && showThreadPreview && (
          <div className="thread-info">
            <h3>Adding to thread: {threadDetails.title}</h3>
            <p>{threadDetails.description}</p>
            {threadDetails.imageUrl && (
              <div className="thread-image">
                <img 
                  src={threadDetails.imageUrl} 
                  alt={threadDetails.title} 
                  style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }} 
                />
              </div>
            )}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a descriptive title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Explain what you're looking for feedback on"
            rows={5}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Project Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="just-started">Just Started</option>
            <option value="in-progress">In Progress</option>
            <option value="near-completion">Near Completion</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="imageFile">Upload Image *</label>
          <input
            type="file"
            id="imageFile"
            name="imageFile"
            onChange={handleImageChange}
            accept="image/*"
            required
          />
          
          {preview && (
            <div className="image-preview">
              <h3>Preview</h3>
              <img src={preview} alt="Preview" />
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="cancel-button">
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button-cp"
            disabled={!formData.community || !formData.title || !formData.imageFile}
          >
            {formData.threadId ? 'Add to Thread' : 'Create Post'}
          </button>
        </div>
        
        {/* Debug info
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info" style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', fontSize: '12px' }}>
            <details>
              <summary>Debug Info</summary>
              <pre>{JSON.stringify({ 
                availableCommunities: availableCommunities.length, 
                selectedCommunity: formData.community,
                availableThreads: availableThreads.length,
                selectedThread: formData.threadId,
                formData 
              }, null, 2)}</pre>
            </details>
          </div>
        )} */}
      </form>
    </div>
  );
};

export default CreatePost;// src/pages/CreatePost.jsx
