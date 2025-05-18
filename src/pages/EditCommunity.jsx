// src/pages/EditCommunity.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import critiqueService from '../services/CritiqueService';
import './CreateCritiquePost.css'; // Reuse the existing styles

const EditCommunity = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  
  // Make sure to add the r/ prefix for looking up the community
  const formattedName = name && !name.startsWith('r/') ? `r/${name}` : name;
  console.log("EditCommunity component - Working with community name:", formattedName);
  
  // Form states
  const [communityName, setCommunityName] = useState('');
  const [description, setDescription] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [rules, setRules] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [originalCommunity, setOriginalCommunity] = useState(null);
  
  // Current user info from localStorage/window
  const currentUserName = localStorage.getItem('currentUserName') || window.currentUserName;
  console.log("Current user from localStorage:", currentUserName);
  
  // Load community data
  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        console.log("Loading community data for:", formattedName);
        setIsLoading(true);
        
        // Get the community by name
        const community = await critiqueService.getCommunityByName(formattedName);
        
        if (!community) {
          console.error(`Community "${formattedName}" not found.`);
          setError(`Community "${formattedName}" not found.`);
          setIsLoading(false);
          return;
        }
        
        console.log("Found community:", community);
        
        // Check if current user is the creator
        const isCreator = 
          community.creatorUsername === currentUserName;
        
        console.log("Creator check:", {
          communityCreator: community.creatorUsername,
          currentUser: currentUserName,
          isCreator
        });
        
        if (!isCreator) {
          console.error("Permission denied: Not community creator");
          setError("You don't have permission to edit this community.");
          setIsLoading(false);
          return;
        }
        
        // Set form data from community
        setOriginalCommunity(community);
        setCommunityName(community.name || '');
        setDescription(community.description || '');
        setGuidelines(community.guidelines ? community.guidelines.join('\n') : '');
        setRules(community.rules ? community.rules.join('\n') : '');
        setIsPublic(community.visibility !== 'Private');
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading community:', error);
        setError('Failed to load community. Please try again.');
        setIsLoading(false);
      }
    };
    
    loadCommunityData();
  }, [formattedName, currentUserName]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if the user is logged in
    if (!currentUserName) {
      setError('You must be logged in to edit a community.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log("Submitting form with data:", {
        description,
        guidelines: guidelines.trim().split('\n').filter(line => line.trim()),
        rules: rules.trim().split('\n').filter(line => line.trim()),
        visibility: isPublic ? 'Public' : 'Private'
      });
      
      // Create updated community object
      const updatedCommunity = {
        ...originalCommunity,
        description: description.trim(),
        guidelines: guidelines.trim().split('\n').filter(line => line.trim()),
        rules: rules.trim().split('\n').filter(line => line.trim()),
        visibility: isPublic ? 'Public' : 'Private'
      };
      
      // Update the community
      await critiqueService.updateCommunity(updatedCommunity);
      console.log("Community updated successfully");
      
      // Navigate back to community page
      navigate(`/community/${name}`);
    } catch (error) {
      console.error('Error updating community:', error);
      setError('Failed to update community. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate(`/community/${name}`);
  };
  
  if (isLoading) {
    return <div className="loading">Loading community data...</div>;
  }
  
  if (error) {
    return (
      <div className="error-message">
        <h2>Error</h2>
        <p>{error}</p>
        <button 
          className="back-button"
          onClick={() => navigate(`/community/${name}`)}
        >
          Back to Community
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
      
      <h1 className="page-title">Edit Community</h1>
      
      <form className="critique-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="communityName">Community Name *</label>
          <div className="community-name-input-container">
            <input
              type="text"
              id="communityName"
              className="critique-input"
              value={communityName.replace('r/', '')}
              disabled
              readOnly
            />
          </div>
          <small className="form-help-text">
            Community names cannot be changed after creation.
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
            {isSubmitting ? 'Updating...' : 'Update Community'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCommunity;