// src/pages/About.jsx
import React from 'react';
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
              <h1 className="about-title">About Muse</h1>
              <div className="about-subtitle">
                Design critique platform reimagined for everyone
              </div>
            </header>


            <section className="about-section">
              <h2 className="section-header">Our Mission</h2>
              <p>At Muse, we believe that great design emerges through thoughtful critique and collaboration. Our mission is to make design critique and funding accessible to everyone—from students to professionals, from independent creators to established studios.</p>
              
              <p>We're building a community where designers can receive honest, constructive feedback on their work, connect with fellow creators, and potentially find funding for their projects. By democratizing the critique process, we aim to elevate design standards across the industry and open doors for talented individuals who might otherwise be overlooked.</p>
            </section>

            <section className="about-section">
              <h2 className="section-header">How It Works</h2>
              <p>Muse provides a structured platform for posting design work, receiving feedback, and iterating based on community input. Our unique approach includes:</p>
              
              <div className="feature-grid">
                <div className="feature-item">
                  {/* <div className="feature-icon">📊</div> */}
                  <h3 className="feature-title">Smart Critique Rooms</h3>
                  <p className="feature-description">Dedicated spaces where designers can post their work and receive targeted feedback from peers and experts.</p>
                </div>
                
                <div className="feature-item">
                  {/* <div className="feature-icon">🖌️</div> */}
                  <h3 className="feature-title">Interactive Whiteboard</h3>
                  <p className="feature-description">Collaborative tools that allow critics to annotate designs directly, making feedback clearer and more actionable.</p>
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