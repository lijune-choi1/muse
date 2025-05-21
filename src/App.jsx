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
import Profile from './pages/Profile';
import Whiteboard from './pages/Whiteboard';
import Explore from './pages/Explore'; 
import Leaderboard from './pages/Leaderboard';
import EditCommunity from './pages/EditCommunity';
import EditPost from './pages/EditPost';
import About from './pages/About';
import Settings from './pages/Settings';

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
        {/* Public Routes that use the same layout */}
        <Route path="/about" element={<About />} />
                  
                  {/* Protected Routes with layout */}
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />
        <Route path="/community/:name" element={<RouteWithLayout element={<CommunityPage />} />} />
        
        {/* Redirect /post/:id to /whiteboard/:postId */}
        <Route path="/post/:id" element={<Navigate to={(params) => `/whiteboard/${params.id}`} />} />
        
        {/* Authentication routes without Layout */}
        <Route path="/login" element={<RouteWithLayout element={<Login />} showLayout={false} />} />
        <Route path="/register" element={<RouteWithLayout element={<Register />} showLayout={false} />} />
        
        {/* Whiteboard route - direct access */}
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
        
        {/* Modified CreatePost route to handle redirection to whiteboard */}
        <Route 
          path="/create-post/:community" 
          element={
            <ProtectedRoute>
              <RouteWithLayout element={<CreatePost redirectToWhiteboard={true} />} />
            </ProtectedRoute>
          } 
        />
        
        {/* Support for the path used in Navbar - also redirects to whiteboard */}
        <Route 
          path="/create-critique-post" 
          element={
            <ProtectedRoute>
              <RouteWithLayout element={<CreatePost redirectToWhiteboard={true} />} />
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