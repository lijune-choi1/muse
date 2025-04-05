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

            <div className="about-image-placeholder">
              <div className="about-image-caption">The Muse team at our SF headquarters, Summer 2024</div>
            </div>

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
                  <div className="feature-icon">📊</div>
                  <h3 className="feature-title">Smart Critique Rooms</h3>
                  <p className="feature-description">Dedicated spaces where designers can post their work and receive targeted feedback from peers and experts.</p>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">🖌️</div>
                  <h3 className="feature-title">Interactive Whiteboard</h3>
                  <p className="feature-description">Collaborative tools that allow critics to annotate designs directly, making feedback clearer and more actionable.</p>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">🏆</div>
                  <h3 className="feature-title">Merit-Based Rewards</h3>
                  <p className="feature-description">Recognition and rewards for both high-quality designs and helpful critiques, creating a positive feedback loop in our community.</p>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">💰</div>
                  <h3 className="feature-title">Funding Opportunities</h3>
                  <p className="feature-description">Connections to potential sponsors and investors who are looking to support promising design projects.</p>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2 className="section-header">Our Story</h2>
              <p>Muse began in a graduate design studio at Rhode Island School of Design in 2023. Frustrated by the limitations of traditional critique methods and the challenges of finding design funding, our founders created a simple web app to facilitate better feedback among classmates.</p>
              
              <p>The tool quickly gained popularity beyond their immediate circle, revealing a widespread need for better critique and funding channels in the design community. With input from designers, educators, and industry professionals, Muse evolved into the platform you see today.</p>
              
              <p>Backed by leading design-focused venture capital, Muse launched publicly in January 2024 and has since grown to serve over 10,000 designers across 40 countries.</p>
            </section>

            <section className="about-section">
              <h2 className="section-header">Meet Our Team</h2>
              <div className="team-grid">
                <div className="team-member">
                  <div className="member-photo"></div>
                  <h3 className="member-name">Alex Chen</h3>
                  <div className="member-title">Co-Founder & CEO</div>
                </div>
                
                <div className="team-member">
                  <div className="member-photo"></div>
                  <h3 className="member-name">Mia Johnson</h3>
                  <div className="member-title">Co-Founder & Head of Design</div>
                </div>
                
                <div className="team-member">
                  <div className="member-photo"></div>
                  <h3 className="member-name">Jordan Lee</h3>
                  <div className="member-title">CTO</div>
                </div>
                
                <div className="team-member">
                  <div className="member-photo"></div>
                  <h3 className="member-name">Sam Patel</h3>
                  <div className="member-title">Head of Community</div>
                </div>
              </div>
            </section>

            <section className="about-section contact-section">
              <h2 className="section-header">Get In Touch</h2>
              <p>We're always looking to improve Muse and would love to hear your thoughts.</p>
              
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-icon">✉️</div>
                  <div className="contact-info">hello@musedesign.io</div>
                </div>
                
                <div className="contact-method">
                  <div className="contact-icon">📍</div>
                  <div className="contact-info">530 Howard St, San Francisco, CA 94105</div>
                </div>
                
                <div className="contact-method">
                  <div className="contact-icon">🔗</div>
                  <div className="contact-info">@musedesignapp</div>
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