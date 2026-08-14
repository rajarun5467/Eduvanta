import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import API from '../services/api.js';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/student-login');
  };

  useEffect(() => {
    if (user?.id) {
      API.get(`/dashboard/student/${user.entityId || user.id}`).then(({ data }) => {
        setUpcomingCount(data?.upcomingTests?.length || 0);
      }).catch(() => {});
    }
  }, [user]);

  const navItems = [
    { to: '/student', label: 'Dashboard', icon: 'gauge-high', end: true },
    { to: '/student/attendance', label: 'Attendance', icon: 'calendar-check' },
    { to: '/student/results', label: 'Results', icon: 'clipboard-list' },
    { to: '/student/detailed-result', label: 'Detailed Result', icon: 'file-lines' },
    { to: '/student/tests', label: 'Upcoming Tests', icon: 'flask', badge: upcomingCount },
    { to: '/student/professors', label: 'Professors', icon: 'chalkboard-user' },
    { to: '/student/profile', label: 'My Profile', icon: 'user' },
  ];

  const initials = ((user?.firstName?.[0] || '') + (user?.lastName?.[0] || '') || 'ST').toUpperCase();

  return (
    <>
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)', color: '#c7d2fe' }}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><i className="fa-solid fa-xmark"></i></button>
        <div className="sidebar-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="logo">
            <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}><i className="fa-solid fa-user-graduate"></i></div>
            <div><h2 style={{ color: '#fff' }}>EduNex</h2><p style={{ color: '#a5b4fc' }}>Student Portal</p></div>
          </div>
        </div>
        {/* Profile section */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize: '0.72rem', color: '#a5b4fc', marginTop: '2px' }}>{user?.course} · {user?.year}</div>
          </div>
        </div>
        <nav className="sidebar-nav" style={{ padding: '16px 0' }}>
          <div className="nav-section" style={{ padding: '12px 24px 6px', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#6366f1', fontWeight: 700 }}>Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 24px',
                fontSize: '0.88rem', fontWeight: 500, transition: 'all 0.25s',
                borderLeft: '3px solid transparent', cursor: 'pointer',
                color: isActive ? '#fff' : '#c7d2fe',
                background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                borderLeftColor: isActive ? '#818cf8' : 'transparent',
              })}
            >
              <i className={`fa-solid fa-${item.icon}`} style={{ width: '20px', textAlign: 'center', fontSize: '1rem' }}></i>
              {item.label}
              {item.badge > 0 && (
                <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 600 }}>{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 'auto' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c7d2fe', fontSize: '0.82rem', fontWeight: 600, transition: 'color 0.2s', marginBottom: '10px' }}>
            <i className="fa-solid fa-globe"></i> View Website
          </a>
          <a onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fca5a5', fontSize: '0.82rem', fontWeight: 600, transition: 'color 0.2s', cursor: 'pointer' }}>
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </a>
        </div>
      </div>
      <div className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <i className="fa-solid fa-bars menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} />
            <h1>Student Portal</h1>
          </div>
          <div className="topbar-right">
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.firstName} {user?.lastName}</span>
            <a onClick={handleLogout} style={{ cursor: 'pointer', color: '#ef4444', fontSize: '1.1rem' }} title="Logout">
              <i className="fa-solid fa-power-off"></i>
            </a>
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </>
  );
}
