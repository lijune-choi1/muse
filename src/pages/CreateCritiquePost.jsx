// src/pages/CreateCritiquePost.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import critiqueService from '../pages/CritiqueService';
import './CreateCritiquePost.css';

const CreateCritiquePost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [postName, setPostName] = useState('');
  const [community, setCommunity] = useState('r/ijuneneedshelp');
  const [isPublic, setIsPublic] = useState(true);
  const [editNumber, setEditNumber] = useState(1);
  const [status, setStatus] = useState('just-started');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [communities, setCommunities] = useState([]);

  const [postType, setPostType] = useState('single'); // single, newThread, existingThread
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [availableThreads, setAvailableThreads] = useState([]);
  const [threadInfo, setThreadInfo] = useState(null);
  
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        // Add more detailed logging
        console.log('Fetching communities...');
        
        const all = await critiqueService.getAllCommunities();
        console.log('Fetched communities:', all);
        
        // Ensure we're extracting names correctly
        const names = all.map(c => c.name || `r/${c.id}`);
        
        console.log('Community names:', names);
        
        // Ensure we have a default community
        if (names.length > 0) {
          setCommunities(names);
          setCommunity(names[0]);  // Set first community as default
        } else {
          // Fallback to default communities if none fetched
          const defaultCommunities = [
            'r/ijuneneedshelp', 
            'r/Graphic4ever'
          ];
          setCommunities(defaultCommunities);
          setCommunity(defaultCommunities[0]);
        }
      } catch (err) {
        console.error("Failed to load communities:", err);
        
        // Fallback to hardcoded communities
        const defaultCommunities = [
          'r/ijuneneedshelp', 
          'r/Graphic4ever'
        ];
        setCommunities(defaultCommunities);
        setCommunity(defaultCommunities[0]);
      }
    };
  
    fetchCommunities();
  }, []);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const threadId = params.get('threadId');
    const communityParam = params.get('community');

    if (communityParam) {
      setCommunity(communityParam);
    }

    if (threadId) {
      const numericThreadId = parseInt(threadId, 10);
      setPostType('existingThread');
      setSelectedThreadId(numericThreadId);

      const fetchThreadDetails = async () => {
        try {
          const thread = await critiqueService.getPostById(numericThreadId);
          if (thread) {
            setThreadInfo(thread);
            setCommunity(thread.community);
          }
        } catch (error) {
          console.error("Error loading thread details:", error);
          setError("Failed to load thread details. Thread may not exist.");
        }
      };

      fetchThreadDetails();
    }
  }, [location]);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const threads = await critiqueService.getAllThreads(community);
        setAvailableThreads(threads);

        if (postType === 'existingThread' && !selectedThreadId && threads.length > 0) {
          setSelectedThreadId(threads[0].id);
          const thread = await critiqueService.getPostById(threads[0].id);
          setThreadInfo(thread);
        }
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };

    fetchThreads();
  }, [postType, selectedThreadId, community]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleThreadChange = (e) => {
    const threadId = parseInt(e.target.value, 10);
    setSelectedThreadId(threadId);

    const fetchThreadDetails = async () => {
      try {
        const thread = await critiqueService.getPostById(threadId);
        if (thread) {
          setThreadInfo(thread);
        }
      } catch (error) {
        console.error("Error loading thread details:", error);
      }
    };

    fetchThreadDetails();
  };

  const getBackUrl = () => {
    return `/community/${community.substring(2)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let finalThreadId = null;

      if (postType === 'newThread') {
        const threadData = {
          title: `Thread: ${postName}`,
          community,
          description: `Thread for ${postName}`,
          editNumber: 1,
          status,
          threadId: null,
          isThread: true,
          image: null
        };

        const newThread = await critiqueService.createPost(threadData);
        finalThreadId = newThread.id;
      } else if (postType === 'existingThread') {
        finalThreadId = selectedThreadId;
      }

      const postData = {
        title: postName,
        community,
        description,
        editNumber,
        status,
        image: imagePreview,
        threadId: finalThreadId,
        isThread: postType === 'single' || postType === 'newThread'
      };

      const newPost = await critiqueService.createPost(postData);
      navigate(`/community/${community.substring(2)}`);
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create the post. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          <div className="create-critique-post-container">
            <div className="back-button">
              <Link to={getBackUrl()}>
                <button className="circle-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </Link>
            </div>

            <h1 className="page-title">Create New Post</h1>

            <div className="form-group">
              <label htmlFor="community">Community</label>
              <select
                id="community"
                className="critique-select"
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
              >
                {communities.map((comm) => (
                  <option key={comm} value={comm}>{comm}</option>
                ))}
              </select>
            </div>

            {postType === 'existingThread' && threadInfo && (
              <div className="thread-info-card">
                <div className="thread-info-label">Adding to Thread:</div>
                <div className="thread-info-title">{threadInfo.title}</div>
              </div>
            )}

            {error && (
              <div className="error-message">{error}</div>
            )}

            <form className="critique-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="postName">Post Name</label>
                <input
                  type="text"
                  id="postName"
                  className="critique-input"
                  placeholder="Type Post Name"
                  value={postName}
                  onChange={(e) => setPostName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="editNumber">Edit Number</label>
                  <select
                    id="editNumber"
                    className="critique-select"
                    value={editNumber}
                    onChange={(e) => setEditNumber(parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}th Edit</option>
                    ))}
                  </select>
                </div>

                <div className="form-group half-width">
                  <label htmlFor="status">Progress Status</label>
                  <select
                    id="status"
                    className="critique-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="just-started">Just Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="near-completion">Near Completion</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="critique-textarea"
                  placeholder="Describe what you need help with..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  required
                ></textarea>
              </div>

              {!selectedThreadId && (
                <div className="post-type-options">
                  <label>Post Type</label>
                  <div className="radio-options">
                    {['single', 'newThread', 'existingThread'].map(type => (
                      <label key={type} className="radio-option">
                        <input
                          type="radio"
                          name="postType"
                          value={type}
                          checked={postType === type}
                          onChange={() => setPostType(type)}
                        />
                        <div className="radio-content">
                          <div className="radio-title">{type === 'single' ? 'Single Post' : type === 'newThread' ? 'Create New Thread' : 'Add to Existing Thread'}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {postType === 'existingThread' && (
                    <div className="thread-selector-container">
                      <label htmlFor="threadSelector">Select Thread</label>
                      <select
                        id="threadSelector"
                        className="thread-selector"
                        value={selectedThreadId || ''}
                        onChange={handleThreadChange}
                      >
                        <option value="">Select a thread...</option>
                        {availableThreads.map(thread => (
                          <option key={thread.id} value={thread.id}>{thread.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>Visibility</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="visibility"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                    /> Public
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                    /> Private
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Upload Image</label>
                <div 
                  className="image-upload-area"
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">Upload Image</div>
                  )}
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Done'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCritiquePost;

