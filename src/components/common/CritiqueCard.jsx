// src/components/common/CritiqueCard.jsx
import React from 'react';
import Card from './Card';
import Button from './Button';
import './Button.css';


const CritiqueCard = ({ 
  community, 
  date, 
  title = "POST NAME: I need help with my poster design.", 
  description = "Hi, I am doing an assignment for Type II and I need help with my poster design. I think the composition is off but I am not too sure... Any advice?", 
  image,
  onEnterClick, 
  onEditClick
}) => {
  return (
    <Card>
      <div className="card-header">
        <div className="community-info">
          <span className="community-name">{community}</span>
          <span className="post-date">{date}</span>
        </div>
        <Button variant="primary" onClick={onEnterClick}>Enter Critique</Button>
      </div>
      
      <div className="edit-action">
        <Button variant="secondary" onClick={onEditClick}>2nd Edit</Button>
      </div>
      
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
      
      {image ? (
        <div className="card-image">
          <img src={image} alt={title} />
        </div>
      ) : (
        <div className="card-image"></div>
      )}
      
      <div className="card-actions">
        <Button variant="action">Likes</Button>
        <Button variant="action">Comments</Button>
        <Button variant="action">Share</Button>
      </div>
    </Card>
  );
};

export default CritiqueCard;