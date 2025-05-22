// src/pages/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import './About.css';

const About = () => {
  return (
    <div className="layout">
      <Navbar />
      <div className="content-wrapper">
        <div className="sidebar-container">
          <Sidebar />
        </div>
        <div className="main-content">
          <article className="about-container">
            <header className="about-header">
              <h1 className="about-title">About Critique</h1>
              <div className="about-subtitle">
                A design critique platform reimagined for everyone
              </div>
            </header>

            <section className="about-section">
              <h2 className="section-header">Our Mission</h2>
              <p>At Critique, we believe that great design emerges through thoughtful feedback and collaboration. Our mission is to make design critique accessible to everyone—from students to professionals, from independent creators to established studios.</p>
              
              <p>We're building a community where designers can receive honest, constructive feedback on their work, connect with fellow creators, and iterate on their designs based on valuable input. By democratizing the critique process, we aim to elevate design standards across the industry and open doors for talented individuals who might otherwise be overlooked.</p>
            </section>

            
            
            <section className="about-section">
              <h2 className="section-header">Join Our Community</h2>
              <p>Whether you're a designer looking for feedback, a critic with expertise to share, or just someone interested in design, there's a place for you in our community.</p>
              
              <div className="cta-container">
                {/* Link to the registration page */}
                <Link to="/register" className="cta-button">Create an Account</Link>
                
                {/* Link to the Explore page */}
                <Link to="/explore" className="cta-button secondary">Explore Communities</Link>
              </div>
            </section>
            
            
          </article>
        </div>
      </div>
    </div>
  );
};

export default About;