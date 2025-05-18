// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import CritiqueCard from '../components/common/CritiqueCard';
import critiqueService from '../services/CritiqueService';
import './Home.css';

const Home = () => {
  const [critiquePosts, setCritiquePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState(null);
  const [seedingInProgress, setSeedingInProgress] = useState(false);
  
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Check if data exists
        const status = await critiqueService.checkData();
        setDataStatus(status);
        
        // If no posts exist, offer to seed data
        if (!status.postsExist && !status.error) {
          console.log("No posts found. Consider seeding data.");
        }
        
        // Fetch posts regardless
        const posts = await critiqueService.getAllPosts();
        console.log('Posts loaded:', posts);
        setCritiquePosts(posts || []);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);
  
  const handleSeedData = async () => {
    try {
      setSeedingInProgress(true);
      
      const result = await critiqueService.seedDummyData();
      console.log("Seeding result:", result);
      
      // Refresh posts
      const posts = await critiqueService.getAllPosts();
      setCritiquePosts(posts || []);
      
      // Update data status
      const newStatus = await critiqueService.checkData();
      setDataStatus(newStatus);
    } catch (error) {
      console.error("Error seeding data:", error);
    } finally {
      setSeedingInProgress(false);
    }
  };

  return (
    <div className="content-wrapper">
      {!loading && !dataStatus?.postsExist && (
        <div className="seed-data-section" style={{ 
          padding: '15px', 
          margin: '15px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '5px', 
          textAlign: 'center' 
        }}>
          <p>No posts found. Would you like to add some sample posts?</p>
          <button 
            onClick={handleSeedData} 
            disabled={seedingInProgress}
            style={{ 
              padding: '8px 15px', 
              backgroundColor: '#4285f4', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            {seedingInProgress ? 'Adding Sample Data...' : 'Add Sample Data'}
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="loading-spinner">Loading posts...</div>
      ) : critiquePosts.length > 0 ? (
        <div className="critiques-grid">
          {critiquePosts.map(post => (
            <CritiqueCard 
              key={post.id}
              id={post.id}
              community={post.communityName}
              date={post.date || post.createdAt}
              title={post.title}
              description={post.description}
              editNumber={post.editNumber}
              status={post.status}
              image={post.imageUrl}
              author={post.authorName}
            />
          ))}
        </div>
      ) : (
        <div className="no-posts-message">
          <p>No posts found. Create a new post to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Home;