// src/pages/Leaderboard.jsx
import React from 'react';
import './Leaderboard.css';

const LeaderboardRow = ({ rank, username, reviews, points }) => {
  return (
    <div className="leaderboard-row">
      <div className="rank-info">
        <span className="rank-number">{rank}</span>
        <div className="user-avatar"></div>
        <span className="username">{username}</span>
      </div>
      <div className="user-stats">
        <button className="stat-button reviews">+{reviews} Reviews</button>
        <button className="stat-button points">+{points} Points</button>
      </div>
    </div>
  );
};

const Leaderboard = () => {
  const topReviewers = [
    { id: 1, username: 'Username', reviews: 10, points: 20 },
    { id: 2, username: 'Username', reviews: 10, points: 20 },
    { id: 3, username: 'Username', reviews: 10, points: 20 },
    { id: 4, username: 'Username', reviews: 10, points: 20 },
    { id: 5, username: 'Username', reviews: 10, points: 20 },
    { id: 6, username: 'Username', reviews: 10, points: 20 },
    { id: 7, username: 'Username', reviews: 10, points: 20 },
    { id: 8, username: 'Username', reviews: 10, points: 20 },
    { id: 9, username: 'Username', reviews: 10, points: 20 },
    { id: 10, username: 'Username', reviews: 10, points: 20 }
  ];

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">Leaderboard</h1>
      
      <div className="leaderboard-section">
        <h2 className="section-title">Top 10 Reviewers This Week</h2>
        
        <div className="leaderboard-table">
          {topReviewers.map((reviewer) => (
            <LeaderboardRow
              key={reviewer.id}
              rank={reviewer.id}
              username={reviewer.username}
              reviews={reviewer.reviews}
              points={reviewer.points}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;