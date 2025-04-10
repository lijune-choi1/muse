// src/pages/CreateCritiqueRoom.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import critiqueService from './CritiqueService'; // Import CritiqueService
import './CreateCritiquePost.css'; // Reusing the existing CSS

const CreateCritiqueRoom = () => {
  const navigate = useNavigate();
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
      const formattedCommunityName = `r/${communityName.trim().toLowerCase().replace(/\s+/g, '')}`;

      // Create the new community object
      const newCommunity = {
        name: formattedCommunityName,
        description: description.trim(),
        guidelines: guidelines.trim().split('\n').filter(g => g.trim()),
        rules: rules.trim().split('\n').filter(r => r.trim()),
        visibility: isPublic ? 'Public' : 'Private',
        createdBy: 'lijune.choi20' // Current user - in a real app would come from auth context
      };

      console.log('Creating new community:', newCommunity);
      
      // Actually create the community using critiqueService
      try {
        const createdCommunity = await critiqueService.createCommunity(newCommunity);
        console.log('Community created successfully:', createdCommunity);
        
        // Navigate to the new community page
        navigate(`/community/${communityName.trim().toLowerCase().replace(/\s+/g, '')}`);
      } catch (serviceError) {
        console.error('CritiqueService error:', serviceError);
        setError('Failed to create community: ' + serviceError.message);
      }
    } catch (error) {
      console.error('Error creating community:', error);
      setError('Failed to create community. Please try again.');
    } finally {
      setIsCreating(false);
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
              <button 
                className="circle-button" 
                onClick={() => navigate('/')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            <h1 className="page-title">Create New Community</h1>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <form className="critique-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="communityName">Community Name</label>
                <input
                  type="text"
                  id="communityName"
                  className="critique-input"
                  placeholder="Enter community name (e.g., IJuneNeeds Help)"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  required
                />
                <small>This will create a community like r/communityname</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Community Description</label>
                <textarea
                  id="description"
                  className="critique-textarea"
                  placeholder="Describe the purpose of your community"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="guidelines">Community Guidelines (one per line)</label>
                <textarea
                  id="guidelines"
                  className="critique-textarea"
                  placeholder="Enter community guidelines"
                  value={guidelines}
                  onChange={(e) => setGuidelines(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="rules">Community Rules (one per line)</label>
                <textarea
                  id="rules"
                  className="critique-textarea"
                  placeholder="Enter community rules"
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  rows="3"
                ></textarea>
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
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Community'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCritiqueRoom;