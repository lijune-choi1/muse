// src/components/layout/Layout.jsx
import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <div className="content-wrapper">
        <div className="sidebar-container">
          <Sidebar />
        </div>
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;