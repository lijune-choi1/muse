// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateCritiqueRoom from './pages/CreateCritiqueRoom';
import CommunityPage from './pages/CommunityPage';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Whiteboard from './pages/Whiteboard';
import Explore from './pages/Explore'; // Import for Explore component
import Leaderboard from './pages/Leaderboard'; // Import for Leaderboard component
// Import the EditCommunity component
import EditCommunity from './pages/EditCommunity';
// Import the EditPost component
import EditPost from './pages/EditPost';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Determine if layout should be shown (exclude for login and register pages)
const RouteWithLayout = ({ element, showLayout = true }) => {
  return showLayout ? <Layout>{element}</Layout> : element;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public routes with Layout */}
        <Route path="/" element={<RouteWithLayout element={<Home />} />} />
        <Route path="/explore" element={<RouteWithLayout element={<Explore />} />} />
        <Route path="/featured" element={<RouteWithLayout element={<Leaderboard />} />} />
        <Route path="/leaderboard" element={<RouteWithLayout element={<Leaderboard />} />} />
        <Route path="/community/:name" element={<RouteWithLayout element={<CommunityPage />} />} />
        <Route path="/post/:id" element={<RouteWithLayout element={<PostDetail />} />} />
        
        {/* Authentication routes without Layout */}
        <Route path="/login" element={<RouteWithLayout element={<Login />} showLayout={false} />} />
        <Route path="/register" element={<RouteWithLayout element={<Register />} showLayout={false} />} />
        
        {/* Whiteboard route - without standard layout since it has its own UI */}
        <Route path="/whiteboard/:postId" element={<Whiteboard />} />
        
        {/* Protected routes with Layout */}
        <Route 
          path="/create-community" 
          element={
            <ProtectedRoute>
              <RouteWithLayout element={<CreateCritiqueRoom />} />
            </ProtectedRoute>
          } 
        />
        
        {/* Add support for the alternate path (create-critique-room) */}
        <Route 
          path="/create-critique-room" 
          element={
            <ProtectedRoute>
              <RouteWithLayout element={<CreateCritiqueRoom />} />
            </ProtectedRoute>
          } 
        />
        
        {/* Add the EditCommunity route */}
        <Route 
          path="/edit-community/:name" 
          element={
            <ProtectedRoute>
              <RouteWithLayout element={<EditCommunity />} />
            </ProtectedRoute>
          } 
        />
        
        {/* Add the EditPost route */}
        <Route 
          path="/edit-post/:postId" 
          element={
            <ProtectedRoute>
              <RouteWithLayout element={<EditPost />} />
            </ProtectedRoute>
          } 
        />
        
        {/* Support both path patterns for creating posts */}
        <Route 
          path="/create-post/:community" 
          element={
            <ProtectedRoute>
              <RouteWithLayout element={<CreatePost />} />
            </ProtectedRoute>
          } 
        />
        
        {/* Add support for the path used in Navbar */}
        <Route 
          path="/create-critique-post" 
          element={
            <ProtectedRoute>
              <RouteWithLayout element={<CreatePost />} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <RouteWithLayout element={<Profile />} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;