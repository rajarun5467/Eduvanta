import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import API from '../services/api.js';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/students': 'Students',
  '/admin/students/:id': 'Student Profile',
  '/admin/admissions': 'Admissions',
  '/admin/attendance': 'Attendance',
  '/admin/fees': 'Fees',
  '/admin/courses': 'Courses',
  '/admin/classes': 'Classes',
  '/admin/faculty': 'Faculty',
  '/admin/salaries': 'Salaries',
  '/admin/staff-attendance': 'Staff Attendance',
  '/admin/attendance-requests': 'Att. Requests',
  '/admin/exams': 'Exams',
  '/admin/applications': 'Applications',
  '/admin/placements': 'Placements',
  '/admin/settings': 'Settings',
  '/admin/login-activity': 'Login Activity',
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || (location.pathname.match(/^\/admin\/students\/[^/]+$/) ? 'Student Profile' : 'Dashboard');

  useEffect(() => {
    API.get('/corrections?status=Pending').then(({ data }) => {
      setPendingRequests(Array.isArray(data) ? data.filter(r => r.status === 'Pending').length : 0);
    }).catch(() => {});
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { section: 'Main', links: [{ to: '/admin', label: 'Dashboard', icon: 'gauge-high', end: true }] },
    {
      section: 'Management',
      links: [
        { to: '/admin/students', label: 'Students', icon: 'user-graduate' },
        { to: '/admin/admissions', label: 'Admissions', icon: 'address-card' },
        { to: '/admin/attendance', label: 'Attendance', icon: 'calendar-check' },
        { to: '/admin/fees', label: 'Fees', icon: 'indian-rupee-sign' },
        { to: '/admin/courses', label: 'Courses', icon: 'book' },
        { to: '/admin/classes', label: 'Classes', icon: 'school' },
        { to: '/admin/faculty', label: 'Faculty', icon: 'chalkboard-user' },
        { to: '/admin/salaries', label: 'Salaries', icon: 'money-bill-wave' },
        { to: '/admin/staff-attendance', label: 'Staff Attendance', icon: 'user-clock' },
        { to: '/admin/attendance-requests', label: 'Att. Requests', icon: 'paper-plane', badge: pendingRequests },
        { to: '/admin/applications', label: 'Applications', icon: 'file-pen' },
        { to: '/admin/placements', label: 'Placements', icon: 'briefcase' },
      ],
    },
    {
      section: 'Settings',
      links: [
        { to: '/admin/settings', label: 'Student Management', icon: 'user-graduate', tab: 'students' },
        { to: '/admin/settings?tab=faculty', label: 'Faculty Management', icon: 'chalkboard-user', tab: 'faculty' },
        { to: '/admin/login-activity', label: 'Login Activity', icon: 'right-to-bracket' },
      ],
    },
  ];

  const initials = (user?.username || 'AD').slice(0, 2).toUpperCase();
  const roleDisplay = (user?.role || 'admin').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <>
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><i className="fa-solid fa-xmark"></i></button>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon"><i className="fa-solid fa-graduation-cap"></i></div>
            <div><h2>EduNex</h2><p>Admin Panel</p></div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((group) => (
            <div key={group.section}>
              <div className="sidebar-section">{group.section}</div>
              {group.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => isActive ? 'active' : ''}
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className={`fa-solid fa-${link.icon}`}></i> {link.label}
                  {link.badge > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', padding: '2px 7px', borderRadius: '50px', marginLeft: '4px', fontWeight: 700 }}>{link.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
          <div className="sidebar-section">System</div>
          <a href="/"><i className="fa-solid fa-globe"></i> View Website</a>
          <a onClick={handleLogout} style={{ cursor: 'pointer' }}><i className="fa-solid fa-right-from-bracket"></i> Logout</a>
        </nav>
      </div>
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <i className="fa-solid fa-bars menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} />
            <h1>{currentTitle}</h1>
          </div>
          <div className="topbar-right">
            <div className="admin-info">
              <div className="admin-avatar">{initials}</div>
              <div>
                <div className="admin-name">{user?.username || 'Admin'}</div>
                <div className="admin-role">{roleDisplay}</div>
              </div>
            </div>
            <a onClick={handleLogout} className="btn-logout" title="Logout" style={{ cursor: 'pointer' }}>
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
