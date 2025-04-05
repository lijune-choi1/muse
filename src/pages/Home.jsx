// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import CritiqueCard from '../components/common/CritiqueCard';
import critiqueService from './CritiqueService';
import './Home.css';

const Home = () => {
  const [critiquePosts, setCritiquePosts] = useState([]);
  
  useEffect(() => {
    // TEMPORARY FIX: Clear localStorage to force reinitialization with image URLs
    // You can remove this after the first time you run it
    localStorage.removeItem('critiquePosts');
    localStorage.removeItem('critiqueCommunities');
    localStorage.removeItem('whiteboardData');
    localStorage.removeItem('userPreferences');
    
    // Fetch all posts from both communities
    const fetchPosts = async () => {
      try {
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
    </div>
  );
};

export default Home;