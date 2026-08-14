import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function FacultyLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'gauge-high' },
    { id: 'myattendance', label: 'My Attendance', icon: 'user-clock' },
    { id: 'attendance', label: 'Subject Attendance', icon: 'calendar-check' },
    { id: 'marks', label: 'Marks', icon: 'clipboard-list' },
    { id: 'tests', label: 'Tests', icon: 'flask' },
    { id: 'mystudents', label: 'My Students', icon: 'user-graduate' },
    { id: 'subjects', label: 'My Subjects', icon: 'book' },
    { id: 'myclasses', label: 'My Classes', icon: 'school' },
    { id: 'payslip', label: 'Payslip', icon: 'money-bill-wave' },
    { id: 'notices', label: 'Notices', icon: 'bullhorn' },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><i className="fa-solid fa-xmark"></i></button>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon"><i className="fa-solid fa-chalkboard-user"></i></div>
            <div><h2>EduNex</h2><p>Faculty Panel</p></div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">Overview</div>
          <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}>
            <i className="fa-solid fa-gauge-high"></i> Dashboard
          </button>
          <div className="sidebar-section">Attendance</div>
          <button className={`tab-btn ${activeTab === 'myattendance' ? 'active' : ''}`} onClick={() => { setActiveTab('myattendance'); setSidebarOpen(false); }}>
            <i className="fa-solid fa-user-clock"></i> My Attendance
          </button>
          <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => { setActiveTab('attendance'); setSidebarOpen(false); }}>
            <i className="fa-solid fa-calendar-check"></i> Subject Attendance
          </button>
          <div className="sidebar-section">Academics</div>
          <button className={`tab-btn ${activeTab === 'marks' ? 'active' : ''}`} onClick={() => { setActiveTab('marks'); setSidebarOpen(false); }}>
            <i className="fa-solid fa-clipboard-list"></i> Marks
          </button>
          <button className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`} onClick={() => { setActiveTab('tests'); setSidebarOpen(false); }}>
            <i className="fa-solid fa-flask"></i> Tests
          </button>
          <button className={`tab-btn ${activeTab === 'mystudents' ? 'active' : ''}`} onClick={() => { setActiveTab('mystudents'); setSidebarOpen(false); }}>
            <i className="fa-solid fa-user-graduate"></i> My Students
          </button>
          <button className={`tab-btn ${activeTab === 'subjects' ? 'active' : ''}`} onClick={() => { setActiveTab('subjects'); setSidebarOpen(false); }}>
            <i className="fa-solid fa-book"></i> My Subjects
          </button>
          <button className={`tab-btn ${activeTab === 'myclasses' ? 'active' : ''}`} onClick={() => { setActiveTab('myclasses'); setSidebarOpen(false); }}>
            <i className="fa-solid fa-school"></i> My Classes
          </button>
          <div className="sidebar-section">Info</div>
          <button className={`tab-btn ${activeTab === 'payslip' ? 'active' : ''}`} onClick={() => { setActiveTab('payslip'); setSidebarOpen(false); }}>
            <i className="fa-solid fa-money-bill-wave"></i> Payslip
          </button>
          <button className={`tab-btn ${activeTab === 'notices' ? 'active' : ''}`} onClick={() => { setActiveTab('notices'); setSidebarOpen(false); }}>
            <i className="fa-solid fa-bullhorn"></i> Notices
          </button>
          <div className="sidebar-section">System</div>
          <a href="/"><i className="fa-solid fa-globe"></i> View Website</a>
          <a onClick={handleLogout} style={{ cursor: 'pointer' }}><i className="fa-solid fa-right-from-bracket"></i> Logout</a>
        </nav>
      </div>
      <div className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <i className="fa-solid fa-bars menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} />
            <h1>Faculty Panel</h1>
          </div>
          <div className="topbar-right">
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.facultyName || user?.username}</span>
            <a onClick={handleLogout} style={{ cursor: 'pointer', color: '#ef4444', fontSize: '1.1rem' }} title="Logout">
              <i className="fa-solid fa-power-off"></i>
            </a>
          </div>
        </div>
        <div className="content">
          <Outlet context={{ activeTab, setActiveTab }} />
        </div>
      </div>
    </>
  );
}
