import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api.js';

const formatINR = (n) => '₹' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard').then(({ data }) => { setData(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i><p>Loading dashboard...</p></div>;
  if (!data) return <div className="empty-state"><i className="fa-solid fa-circle-exclamation"></i><p>Failed to load dashboard</p></div>;

  const s = data.stats;

  const statCards = [
    { label: 'Total Students', value: s.totalStudents, icon: 'user-graduate', color: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
    { label: 'Faculty Members', value: s.totalFaculty, icon: 'chalkboard-user', color: 'linear-gradient(135deg, #22c55e, #15803d)' },
    { label: 'Applications', value: s.totalApplications, icon: 'file-pen', color: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { label: 'Placements', value: s.totalPlacements, icon: 'briefcase', color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  ];

  const quickActions = [
    { to: '/admin/students', icon: 'user-plus', color: 'linear-gradient(135deg,#2563eb,#1d4ed8)', title: 'Add Student', desc: 'Enroll new student' },
    { to: '/admin/faculty', icon: 'chalkboard-user', color: 'linear-gradient(135deg,#22c55e,#15803d)', title: 'Add Faculty', desc: 'Manage faculty' },
    { to: '/admin/applications', icon: 'file-pen', color: 'linear-gradient(135deg,#f59e0b,#d97706)', title: 'Applications', desc: `${s.pendingApplications} pending` },
    { to: '/admin/fees', icon: 'indian-rupee-sign', color: 'linear-gradient(135deg,#ef4444,#dc2626)', title: 'Fee Collection', desc: `${s.pendingFees} pending dues` },
    { to: '/admin/attendance', icon: 'calendar-check', color: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', title: 'Attendance', desc: "Mark today's attendance" },
    { to: '/admin/salaries', icon: 'money-bill-wave', color: 'linear-gradient(135deg,#0ea5e9,#0284c7)', title: 'Salaries', desc: 'Pay staff & faculty' },
  ];

  const badgeClass = (status) => {
    if (['Approved', 'Admitted', 'Paid'].includes(status)) return 'badge-success';
    if (['Pending', 'New', 'Partial', 'Reviewed'].includes(status)) return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes countUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .main-content .reveal { opacity: 0; transform: translateY(20px); animation: fadeUp 0.6s ease forwards; }
        .main-content .reveal-1 { animation-delay: 0.05s; }
        .main-content .reveal-2 { animation-delay: 0.1s; }
        .main-content .reveal-3 { animation-delay: 0.15s; }
        .main-content .reveal-4 { animation-delay: 0.2s; }
        .main-content .reveal-5 { animation-delay: 0.25s; }
        .main-content .reveal-6 { animation-delay: 0.3s; }
        .main-content .dashboard .stat-card h3 { animation: countUp 0.5s ease both; }
        .main-content .dashboard .stat-card { transition: transform 0.3s, box-shadow 0.3s; }
        .main-content .dashboard .stat-card:hover { transform: translateY(-6px) scale(1.01); box-shadow: var(--shadow-md); }
      `}</style>

      <div className="dashboard">
        <div className="stat-grid reveal reveal-1">
          {statCards.map((c) => (
            <div className="stat-card" key={c.label}>
              <div className="stat-card-top">
                <div className="stat-card-icon" style={{ background: c.color }}><i className={`fa-solid fa-${c.icon}`}></i></div>
                <span className="trend" style={{ color: 'var(--text-muted)' }}><i className="fa-solid fa-chart-line"></i></span>
              </div>
              <h3>{c.value}</h3>
              <p>{c.label}</p>
            </div>
          ))}
        </div>

        <div className="chart-grid reveal reveal-2">
          <div className="panel">
            <div className="panel-header"><h3>Quick Actions</h3></div>
            <div className="panel-body">
              <div className="quick-action">
                {quickActions.map((qa) => (
                  <Link to={qa.to} className="qa-card" key={qa.title}>
                    <div className="qa-icon" style={{ background: qa.color }}><i className={`fa-solid fa-${qa.icon}`}></i></div>
                    <div className="qa-info"><h4>{qa.title}</h4><p>{qa.desc}</p></div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><h3>Today's Overview</h3></div>
            <div className="panel-body today-overview">
              <div className="overview-title">Attendance</div>
              <div className="mini-grid">
                <div className="mini-stat">
                  <h4 style={{ color: '#15803d' }}>{s.presentToday}</h4>
                  <p>Present</p>
                </div>
                <div className="mini-stat">
                  <h4 style={{ color: '#dc2626' }}>{s.absentToday}</h4>
                  <p>Absent</p>
                </div>
              </div>
              <div className="overview-title">Applications</div>
              <div className="mini-grid">
                <div className="mini-stat">
                  <h4 style={{ color: '#2563eb' }}>{s.todayApps}</h4>
                  <p>New Today</p>
                </div>
                <div className="mini-stat">
                  <h4 style={{ color: '#f59e0b' }}>{s.pendingApplications}</h4>
                  <p>Pending</p>
                </div>
              </div>
              <div className="mini-stat" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', textAlign: 'left' }}>
                <div>
                  <h4 style={{ fontSize: '1.2rem', color: '#dc2626' }}>{formatINR(s.feeDue)}</h4>
                  <p>Total Due Fees</p>
                </div>
                <i className="fa-solid fa-hand-holding-dollar" style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="panel reveal reveal-3">
          <div className="panel-header">
            <h3>Recent Applications</h3>
            <Link to="/admin/applications" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Student Name</th><th>Course</th><th>Email</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data.recentApplications && data.recentApplications.map((app) => (
                <tr key={app._id}>
                  <td>{app.firstName} {app.lastName}</td>
                  <td>{app.course}</td>
                  <td>{app.email}</td>
                  <td>{new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td><span className={`badge ${badgeClass(app.status)}`}>{app.status}</span></td>
                  <td><Link to="/admin/applications" className="action-btn action-view"><i className="fa-solid fa-eye"></i></Link></td>
                </tr>
              ))}
              {(!data.recentApplications || data.recentApplications.length === 0) && <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No applications</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="panel reveal reveal-4">
          <div className="panel-header">
            <h3>Fee Collection</h3>
            <Link to="/admin/fees" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="panel-body">
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '20px' }}>
              <div className="stat-card">
                <div className="stat-card-top">
                  <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><i className="fa-solid fa-indian-rupee-sign"></i></div>
                </div>
                <h3>{formatINR(s.feeTotal)}</h3>
                <p>Total Fees</p>
              </div>
              <div className="stat-card">
                <div className="stat-card-top">
                  <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)' }}><i className="fa-solid fa-check-circle"></i></div>
                </div>
                <h3>{formatINR(s.feePaid)}</h3>
                <p>Collected</p>
              </div>
              <div className="stat-card">
                <div className="stat-card-top">
                  <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}><i className="fa-solid fa-clock"></i></div>
                </div>
                <h3>{formatINR(s.feeDue)}</h3>
                <p>Due Amount</p>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Student</th><th>Fee Type</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.recentFees && data.recentFees.map((f) => (
                  <tr key={f._id}>
                    <td>{f.studentId ? `${f.studentId.firstName || ''} ${f.studentId.lastName || ''}`.trim() : (f.studentName || '—')}</td>
                    <td>{f.feeType}</td>
                    <td>{formatINR(f.totalAmount)}</td>
                    <td>{formatINR(f.paidAmount)}</td>
                    <td>{formatINR(f.dueAmount)}</td>
                    <td><span className={`badge ${badgeClass(f.status)}`}>{f.status}</span></td>
                  </tr>
                ))}
                {(!data.recentFees || data.recentFees.length === 0) && <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No fee records</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
