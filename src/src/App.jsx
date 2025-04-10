// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Whiteboard from './pages/Whiteboard';
import Leaderboard from './pages/Leaderboard';
import CritiqueRoom from './pages/CritiqueRoom';
import CreateCritiqueRoom from './pages/CreateCritiqueRoom';
import CreateCritiquePost from './pages/CreateCritiquePost';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import About from './pages/About';

const CritiqueRoomWrapper = () => {
  const { communityName } = useParams();
  return <CritiqueRoom communityKey={`r/${communityName}`} />;
};

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
        <Route path="/whiteboard" element={
          <Layout>
            <Whiteboard />
          </Layout>
        } />
        <Route path="/whiteboard/:postId" element={
          <Layout>
            <Whiteboard />
          </Layout>
        } />
        <Route path="/leaderboard" element={
          <Layout>
            <Leaderboard />
          </Layout>
        } />
        <Route path="/settings" element={<Settings />} />
        {/* Make sure both route handlers exist for creating communities */}
        <Route path="/create-critique" element={<CreateCritiqueRoom />} />
        <Route path="/create-critique-room" element={<CreateCritiqueRoom />} />
        <Route path="/create-community" element={<CreateCritiqueRoom />} /> {/* Added alias for consistency */}
        <Route path="/create-critique-post" element={<CreateCritiquePost />} />
        <Route path="/critique/:id" element={<CritiqueRoom />} />
        <Route path="/community/ijuneneedshelp" element={<CritiqueRoom communityKey="r/ijuneneedshelp" />} />
        <Route path="/community/Graphic4ever" element={<CritiqueRoom communityKey="r/Graphic4ever" />} />
        <Route path="/community/:communityName" element={<CritiqueRoomWrapper />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;