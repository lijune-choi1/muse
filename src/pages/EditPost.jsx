// src/pages/EditPost.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import critiqueService from '../services/CritiqueService';
import './CreateCritiquePost.css'; // Reuse existing styles

const EditPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Current user info from localStorage/window
  const currentUserName = localStorage.getItem('currentUserName') || window.currentUserName;
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('in-progress');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [originalPost, setOriginalPost] = useState(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Load post data
  useEffect(() => {
    const loadPostData = async () => {
      try {
        setIsLoading(true);
        const post = await critiqueService.getPostById(postId);
        
        if (!post) {
          setError('Post not found.');
          setIsLoading(false);
          return;
        }
        
        // Check if current user is the author
        if (post.authorName !== currentUserName) {
          setError('You do not have permission to edit this post.');
          setIsLoading(false);
          return;
        }
        
        // Set form data from post
        setOriginalPost(post);
        setTitle(post.title || '');
        setDescription(post.description || '');
        setStatus(post.status || 'in-progress');
        
        // Set image preview if available
        if (post.imageUrl) {
          setImagePreview(post.imageUrl);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading post:', error);
        setError('Failed to load post data. Please try again.');
        setIsLoading(false);
      }
    };
    
    loadPostData();
  }, [postId, currentUserName]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare updated post data
      const updatedPost = {
        id: postId,
        title: title.trim(),
        description: description.trim(),
        status,
        editNumber: (originalPost?.editNumber || 0) + 1,
        imageFile
      };
      
      // Update the post
      await critiqueService.updatePost(updatedPost);
      
      // Navigate back to post details
      navigate(`/post/${postId}`);
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Failed to update post. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCancel = () => {
    navigate(`/post/${postId}`);
  };
  
  if (isLoading) {
    return <div className="loading">Loading post data...</div>;
  }
  
  if (error) {
    return (
      <div className="error-message">
        <h2>Error</h2>
        <p>{error}</p>
        <button 
          className="back-button"
          onClick={() => navigate(`/post/${postId}`)}
        >
          Back to Post
        </button>
      </div>
    );
  }
  
  return (
    <div className="create-critique-post-container">
      <div className="back-button">
        <button className="circle-button" onClick={handleCancel}>
          ←
        </button>
      </div>
      
      <h1 className="page-title">Edit Post</h1>
      
      <form className="critique-form" onSubmit={handleSubmit}>
        {/* Community info - read only */}
        <div className="community-info-box">
          <div className="community-name">{originalPost?.communityName}</div>
          <div className="post-edit-info">
            Edit #{(originalPost?.editNumber || 0) + 1}
          </div>
        </div>
        
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            className="critique-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title"
            required
          />
        </div>
        
        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="critique-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you're looking for feedback on"
            rows={5}
          />
        </div>
        
        {/* Status */}
        <div className="form-group">
          <label>Post Status</label>
          <div className="status-options">
            <label className="status-option">
              <input
                type="radio"
                name="status"
                value="just-started"
                checked={status === 'just-started'}
                onChange={() => setStatus('just-started')}
              />
              <div className="status-content">
                <div className="status-label">Just Started</div>
                <div className="status-description">
                  Initial design that needs early feedback
                </div>
              </div>
            </label>
            
            <label className="status-option">
              <input
                type="radio"
                name="status"
                value="in-progress"
                checked={status === 'in-progress'}
                onChange={() => setStatus('in-progress')}
              />
              <div className="status-content">
                <div className="status-label">In Progress</div>
                <div className="status-description">
                  Work that's been revised and needs focused critique
                </div>
              </div>
            </label>
            
            <label className="status-option">
              <input
                type="radio"
                name="status"
                value="completed"
                checked={status === 'completed'}
                onChange={() => setStatus('completed')}
              />
              <div className="status-content">
                <div className="status-label">Completed</div>
                <div className="status-description">
                  Final design ready for review and polish
                </div>
              </div>
            </label>
          </div>
        </div>
        
        {/* Image Upload */}
        <div className="form-group">
          <label>Image (Optional)</label>
          <div 
            className="image-upload-area"
            onClick={() => fileInputRef.current.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            ) : (
              <div className="upload-placeholder">
                Click to select an image
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleImageChange}
          />
          <small className="form-help-text">
            You can keep the existing image or upload a new one.
          </small>
        </div>
        
        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;