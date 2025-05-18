// src/pages/PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'posts', id));
        
        if (!postDoc.exists()) {
          setError('Post not found');
          setLoading(false);
          return;
        }
        
        setPost({
          id: postDoc.id,
          ...postDoc.data(),
          date: postDoc.data().createdAt?.toDate()
        });
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="layout">
        <Navbar />
        <div className="content-wrapper">
          <div className="sidebar-container">
            <Sidebar />
          </div>
          <div className="main-content">
            <div>Loading post...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="layout">
        <Navbar />
        <div className="content-wrapper">
          <div className="sidebar-container">
            <Sidebar />
          </div>
          <div className="main-content">
            <div>{error || 'Post not found'}</div>
            <button onClick={() => navigate(-1)}>Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <Navbar />
      <div className="content-wrapper">
        <div className="sidebar-container">
          <Sidebar />
        </div>
        <div className="main-content">
          <div className="post-detail-container">
            <div className="back-button">
              <button 
                className="circle-button" 
                onClick={() => navigate(-1)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            <div className="post-header">
              <h1>{post.title}</h1>
              <div className="post-metadata">
                <span>Posted in {post.communityName}</span>
                <span>by {post.authorName}</span>
                <span>on {post.date?.toLocaleDateString()}</span>
                <span className="post-status">{post.status}</span>
              </div>
            </div>
            
            {post.imageUrl && (
              <div className="post-image">
                <img src={post.imageUrl} alt={post.title} />
              </div>
            )}
            
            {post.description && (
              <div className="post-description">
                <p>{post.description}</p>
              </div>
            )}
            
            {/* Comments section would go here */}
            <div className="comments-section">
              <h2>Comments</h2>
              {post.comments && post.comments.length > 0 ? (
                <div className="comments-list">
                  {/* Render comments here */}
                </div>
              ) : (
                <p>No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;