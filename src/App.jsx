// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Leaderboard from './pages/Leaderboard';
import Whiteboard from './pages/Whiteboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route path="/explore" element={
          <Layout>
            <Explore />
          </Layout>
        } />
        <Route path="/leaderboard" element={
          <Layout>
            <Leaderboard />
          </Layout>
        } />
        <Route path="/whiteboard" element={
          <Layout>
            <Whiteboard />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;