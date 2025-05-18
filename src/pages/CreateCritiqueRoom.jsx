// src/pages/CreateCritiqueRoom.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import critiqueService from '../services/CritiqueService';
import './CreateCritiquePost.css';

const CreateCritiqueRoom = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [communityName, setCommunityName] = useState('');
  const [description, setDescription] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [rules, setRules] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      // Validate inputs
      if (!communityName.trim()) {
        setError('Community name is required');
        setIsCreating(false);
        return;
      }

      // Format community name to match existing pattern
      const formattedCommunityName = communityName.trim().toLowerCase().replace(/\s+/g, '');
      
      // Ensure it starts with r/ if not already
      const finalCommunityName = formattedCommunityName.startsWith('r/') 
        ? formattedCommunityName 
        : `r/${formattedCommunityName}`;

      // Create the new community object
      const newCommunity = {
        name: finalCommunityName,
        description: description.trim(),
        guidelines: guidelines.trim().split('\n').filter(g => g.trim()),
        rules: rules.trim().split('\n').filter(r => r.trim()),
        visibility: isPublic ? 'Public' : 'Private'
      };

      console.log('Creating new community:', newCommunity);
      
      // Create the community using the critiqueService
      const createdCommunity = await critiqueService.createCommunity(newCommunity);
      console.log('Community created successfully:', createdCommunity);
      
      // Navigate to the new community page
      navigate(`/community/${formattedCommunityName}`);
    } catch (error) {
      console.error('Error creating community:', error);
      setError('Failed to create community. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="create-critique-post-container">
      <div className="back-button">
        <button className="circle-button" onClick={handleGoBack}>
          ←
        </button>
      </div>
      
      <h1 className="page-title">Create a Community</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form className="critique-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="communityName">Community Name *</label>
          <div className="community-name-input-container">
            <input
              type="text"
              id="communityName"
              className="critique-input"
              placeholder="e.g. GraphicDesignFeedback"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              required
            />
          </div>
          <small className="form-help-text">
            Community names cannot be changed later. Use lowercase letters and no spaces.
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="critique-textarea"
            placeholder="Describe what your community is about..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="guidelines">Community Guidelines</label>
            <textarea
              id="guidelines"
              className="critique-textarea"
              placeholder="Enter each guideline on a new line"
              value={guidelines}
              onChange={(e) => setGuidelines(e.target.value)}
            ></textarea>
            <small className="form-help-text">
              Each line will become a separate guideline. These help members understand the focus of your community.
            </small>
          </div>
          
          <div className="form-group half-width">
            <label htmlFor="rules">Community Rules</label>
            <textarea
              id="rules"
              className="critique-textarea"
              placeholder="Enter each rule on a new line"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
            ></textarea>
            <small className="form-help-text">
              Each line will become a separate rule. Clear rules help maintain quality content and discussions.
            </small>
          </div>
        </div>
        
        <div className="form-group">
          <label>Community Visibility</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="visibility"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
              />
              Public
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="visibility"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
              />
              Private
            </label>
          </div>
          <small className="form-help-text">
            {isPublic 
              ? "Anyone can view, post, and comment in this community."
              : "Only approved members can view and participate in this community."}
          </small>
        </div>
        
        <button 
          type="submit" 
          className="submit-button" 
          disabled={isCreating}
        >
          {isCreating ? "Creating Community..." : "Create Community"}
        </button>
      </form>
    </div>
  );
};

export default CreateCritiqueRoom;