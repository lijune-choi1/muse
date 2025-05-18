// src/pages/CreatePost.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import critiqueService from '../services/CritiqueService';
import Button from '../components/common/Button';
import './CreatePost.css';

const CreatePost = () => {
  const { community } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageFile: null,
    imagePreview: null,
    status: 'just-started',
  });
  
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [availableCommunities, setAvailableCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(community || '');

  // Load community data and available communities
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get all communities for dropdown selection
        const communities = await critiqueService.getAllCommunities();
        setAvailableCommunities(communities || []);
        
        // If a community is specified in the URL, load its data
        if (community) {
          const communityName = community.startsWith('r/') ? community : `r/${community}`;
          const data = await critiqueService.getCommunityByName(communityName);
          
          if (data) {
            setCommunityData(data);
            setSelectedCommunity(data.name);
          } else {
            setError(`Community "${communityName}" not found.`);
          }
        }
      } catch (err) {
        console.error('Error loading community data:', err);
        setError('Failed to load community. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [community]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCommunityChange = (e) => {
    setSelectedCommunity(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCommunity) {
      setError('Please select a community.');
      return;
    }
    
    if (!formData.title.trim()) {
      setError('Please enter a title for your post.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Find the selected community's ID
      const communityObj = availableCommunities.find(c => c.name === selectedCommunity);
      
      if (!communityObj) {
        throw new Error('Selected community not found.');
      }
      
      const postData = {
        title: formData.title,
        description: formData.description,
        imageFile: formData.imageFile,
        community: communityObj.id,
        communityName: communityObj.name,
        status: formData.status,
        author: currentUser.displayName || currentUser.email
      };
      
      const result = await critiqueService.createPost(postData);
      
      if (result && result.id) {
        // Redirect to the new post
        navigate(`/post/${result.id}`);
      } else {
        throw new Error('Failed to create post.');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-post-container">
      <h1 className="page-title">
        Create Post {selectedCommunity && `in ${selectedCommunity}`}
      </h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="loading-spinner">Loading community information...</div>
      ) : (
        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label>Community</label>
            <select 
              value={selectedCommunity} 
              onChange={handleCommunityChange} 
              className="form-control"
              disabled={submitting}
            >
              <option value="">Select a community</option>
              {availableCommunities.map(community => (
                <option key={community.id} value={community.name}>
                  {community.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Post Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter post title"
              className="form-control"
              disabled={submitting}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you need critique on"
              className="form-control"
              rows="6"
              disabled={submitting}
            />
          </div>
          
          <div className="form-group">
            <label>Upload Image</label>
            <div className="image-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
                disabled={submitting}
              />
              
              {formData.imagePreview && (
                <div className="image-preview">
                  <img 
                    src={formData.imagePreview} 
                    alt="Preview" 
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-control"
              disabled={submitting}
            >
              <option value="just-started">Just Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="form-actions">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={submitting}
            >
              {submitting ? 'Creating Post...' : 'Create Post'}
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => navigate('/')}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreatePost;