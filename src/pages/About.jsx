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
              <h2 className="section-header">How It Works</h2>
              <p>Critique provides a structured platform for posting design work, receiving feedback, and iterating based on community input. Our unique approach includes:</p>
              
              <div className="feature-grid">
                <div className="feature-item">
                  <div className="feature-icon">🏠</div>
                  <h3 className="feature-title">Community Spaces</h3>
                  <p className="feature-description">Dedicated spaces where designers can post their work and receive targeted feedback from peers and experts.</p>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">🖌️</div>
                  <h3 className="feature-title">Interactive Whiteboard</h3>
                  <p className="feature-description">Collaborative tools that allow critics to annotate designs directly, making feedback clearer and more actionable.</p>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">🧵</div>
                  <h3 className="feature-title">Design Threads</h3>
                  <p className="feature-description">Track design iterations and feedback across multiple versions, showing the evolution of your work.</p>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">👥</div>
                  <h3 className="feature-title">Profiles & Portfolios</h3>
                  <p className="feature-description">Build your reputation as a designer or critic and showcase your best work and contributions.</p>
                </div>
              </div>
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
            
            <section className="about-section">
              <h2 className="section-header">Our Team</h2>
              <p>Critique was built by a team of designers, developers, and design education enthusiasts who believe in the power of feedback to improve creative work.</p>
              
              <div className="team-grid">
                <div className="team-member">
                  <div className="member-photo"></div>
                  <h3 className="member-name">Jane Doe</h3>
                  <p className="member-title">Founder & Design Lead</p>
                </div>
                
                <div className="team-member">
                  <div className="member-photo"></div>
                  <h3 className="member-name">John Smith</h3>
                  <p className="member-title">Tech Lead</p>
                </div>
                
                <div className="team-member">
                  <div className="member-photo"></div>
                  <h3 className="member-name">Alex Johnson</h3>
                  <p className="member-title">Community Manager</p>
                </div>
                
                <div className="team-member">
                  <div className="member-photo"></div>
                  <h3 className="member-name">Sam Lee</h3>
                  <p className="member-title">UX Researcher</p>
                </div>
              </div>
            </section>
            
            <section className="contact-section">
              <h2 className="section-header">Get in Touch</h2>
              <p>Have questions, feedback, or just want to say hello? We'd love to hear from you!</p>
              
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-icon">📧</div>
                  <div className="contact-info">support@critiqueapp.com</div>
                </div>
                
                <div className="contact-method">
                  <div className="contact-icon">🌐</div>
                  <div className="contact-info">www.critiqueapp.com</div>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
};

export default About;