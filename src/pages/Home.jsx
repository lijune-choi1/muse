// src/pages/Home.jsx
import React from 'react';
import CritiqueCard from '../components/common/CritiqueCard';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Home</h1>
      <div>
        <h2 className="trending-section-title">Top Trending Critiques</h2>
        <div className="critiques-grid">
          <CritiqueCard 
            community="r/ijuneneedshelp" 
            date="2 days ago" 
            onEnterClick={() => console.log('Enter clicked')}
            onEditClick={() => console.log('Edit clicked')}
          />
          <CritiqueCard 
            community="r/ijuneneedshelp" 
            date="2 days ago"
            onEnterClick={() => console.log('Enter clicked')}
            onEditClick={() => console.log('Edit clicked')}
          />
          <CritiqueCard 
            community="r/ijuneneedshelp" 
            date="2 days ago"
            onEnterClick={() => console.log('Enter clicked')}
            onEditClick={() => console.log('Edit clicked')}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;