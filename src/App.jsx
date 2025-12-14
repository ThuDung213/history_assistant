import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import MapPage from './pages/map/MapPage';
import AgentPage from './pages/agent/AgentPage';
import AdminLogin from './pages/auth/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import { isAdminLoggedIn } from './hooks/auth/useAuth';
import CommunityPage from './pages/community/Community';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { logout } from './api/auth/authService';
import './App.css';

const ContentMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <div className="ha-contentMenu">
      <button
        type="button"
        className="ha-menuBtn ha-menuBtn--fab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="ha-menu"
        aria-label="Mở menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && <div className="ha-overlayInContent" onClick={() => setOpen(false)} />}

      <nav
        id="ha-menu"
        className={`ha-menuPanelInContent ${open ? 'is-open' : ''}`}
        aria-label="Main menu"
      >
        <NavLink to="/map" className={({ isActive }) => `ha-menuLink ${isActive ? 'is-active' : ''}`}>
          MAP
        </NavLink>

        <NavLink to="/agent" className={({ isActive }) => `ha-menuLink ${isActive ? 'is-active' : ''}`}>
          Trợ Lý Ảo (3D Agent)
        </NavLink>

        <NavLink
          to="/community"
          className={({ isActive }) => `ha-menuLink ${isActive ? 'is-active' : ''}`}
        >
          Cộng Đồng
        </NavLink>

        <div className="ha-menuDivider" />

        <button type="button" className="ha-menuLink ha-menuLink--danger" onClick={handleLogout}>
          Đăng xuất
        </button>
      </nav>
    </div>
  );
};

function App() {
  const location = useLocation();
  const { pathname } = location;

  const shouldHideMenu =
    pathname === '/' || pathname === '/register' || pathname.startsWith('/admin');

  const noScrollViewport = pathname === '/map' || pathname === '/agent';

  return (
    <div className="ha-app">
      {!shouldHideMenu && <ContentMenu />}

      <div className={`ha-routeViewport ${noScrollViewport ? 'ha-routeViewport--noScroll' : ''}`.trim()}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/map" element={<MapPage />} />
          <Route path="/agent" element={<AgentPage />} />
          <Route path="/community" element={<CommunityPage />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={isAdminLoggedIn() ? <AdminDashboard /> : <Navigate to="/admin/login" />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;