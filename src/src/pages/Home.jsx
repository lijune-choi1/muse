// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import CritiqueCard from '../components/common/CritiqueCard';
import critiqueService from './CritiqueService';
import './Home.css';

const Home = () => {
  const [critiquePosts, setCritiquePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Remove the localStorage clearing code - it's preventing persistence
    
    // Fetch all posts from both communities
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Force initialization of default data if needed
        await critiqueService._initializeDefaultData();
        
        const ijunePosts = await critiqueService.getAllPosts('r/ijuneneedshelp');
        const graphicPosts = await critiqueService.getAllPosts('r/Graphic4ever');
        
        // Combine and sort by date (most recent first)
        const allPosts = [...ijunePosts, ...graphicPosts].sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        console.log('Posts loaded:', allPosts);
        
        setCritiquePosts(allPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  const handleEditClick = () => {
    console.log('Edit clicked');
    // Edit logic here
  };

  return (
    <div className="content-wrapper">
      {loading ? (
        <div className="loading-spinner">Loading posts...</div>
      ) : critiquePosts.length > 0 ? (
        <div className="critiques-grid">
          {critiquePosts.map(post => (
            <CritiqueCard 
              key={post.id}
              id={post.id}
              community={post.community} 
              date={post.date}
              title={post.title}
              description={post.description}
              editNumber={post.editNumber}
              status={post.status}
              onEditClick={handleEditClick}
              image={post.imageUrl}
              author={post.author}
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