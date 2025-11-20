import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MapPage from './pages/map/MapPage';
import AgentPage from './pages/agent/AgentPage';

const Navbar = () => (
  <nav style={{
    background: '#20232A', padding: '15px', color: 'white',
    display: 'flex', gap: '20px', zIndex: 10, position: 'relative'
  }}>
    <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
      Bản Đồ Lịch Sử Đà Nẵng (MAP)
    </Link>
    <Link to="/agent" style={{ color: 'white', textDecoration: 'none' }}>
      Trợ Lý Ảo (3D Agent)
    </Link>
  </nav>
);

function App() {
  return (
    <>
      <Navbar />
      <div className="main-content" style={{ position: 'relative', height: 'calc(100vh - 50px)' }}>
        <Routes>
          {/* Trang mặc định sẽ là bản đồ */}
          <Route path="/" element={<MapPage />} />

          {/* Trang chứa Trợ lý Ảo và Canvas 3D */}
          <Route path="/agent" element={<AgentPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;