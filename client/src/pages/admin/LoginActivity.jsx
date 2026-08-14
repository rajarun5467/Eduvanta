import { useState, useEffect, useMemo } from 'react';
import API from '../../services/api.js';

const avatarColors = ['#2563eb', '#7c3aed', '#db2777', '#d97706', '#15803d', '#0891b2', '#b91c1c', '#4f46e5'];
const typeIcon = { admin: 'user-shield', faculty: 'user-tie', student: 'user-graduate' };
const typeBadge = { admin: 'badge-danger', faculty: 'badge-info', student: 'badge-success' };

export default function AdminLoginActivity() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType) params.set('userType', filterType);
    if (filterStatus) params.set('status', filterStatus);
    try {
      const { data } = await API.get(`/login-activity?${params}`);
      setRecords(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filterType, filterStatus]);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const handleTerminate = async (id) => {
    if (!confirm('Terminate this session?')) return;
    try { await API.post(`/login-activity/${id}/terminate`); showMessage('Session terminated', 'success'); fetchData(); }
    catch (e) { showMessage('Error terminating session', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this activity record?')) return;
    try { await API.delete(`/login-activity/${id}`); showMessage('Record deleted', 'success'); fetchData(); }
    catch (e) { showMessage('Error deleting record', 'error'); }
  };

  const stats = useMemo(() => {
    const total = records.length;
    const online = records.filter((r) => r.status === 'online').length;
    const offline = records.filter((r) => r.status === 'offline').length;
    const admins = records.filter((r) => r.userType === 'admin').length;
    const faculty = records.filter((r) => r.userType === 'faculty').length;
    const students = records.filter((r) => r.userType === 'student').length;
    return { total, online, offline, admins, faculty, students };
  }, [records]);

  const filtered = useMemo(() => {
    if (!search) return records;
    const term = search.toLowerCase();
    return records.filter((r) =>
      (r.displayName || '').toLowerCase().includes(term) ||
      (r.displayEmail || '').toLowerCase().includes(term) ||
      (r.ipAddress || '').toLowerCase().includes(term) ||
      (r.userType || '').toLowerCase().includes(term)
    );
  }, [records, search]);

  const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
  const fmtDuration = (login, logout) => {
    if (!login) return '—';
    const end = logout ? new Date(logout) : new Date();
    const diff = Math.floor((end - new Date(login)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  };

  return (
    <>
      {msg && (
        <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500, background: msgType === 'success' ? '#dcfce7' : '#fee2e2', color: msgType === 'success' ? '#15803d' : '#dc2626' }}>
          <i className={`fa-solid fa-${msgType === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i> {msg}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '14px', marginBottom: '25px' }}>
        {[
          { icon: 'list', bg: '#dbeafe', color: '#2563eb', value: stats.total, label: 'Total Sessions' },
          { icon: 'circle', bg: '#dcfce7', color: '#15803d', value: stats.online, label: 'Online Now' },
          { icon: 'circle-xmark', bg: '#fee2e2', color: '#dc2626', value: stats.offline, label: 'Offline' },
          { icon: 'user-tie', bg: '#ede9fe', color: '#7c3aed', value: stats.faculty, label: 'Faculty Logins' },
          { icon: 'user-graduate', bg: '#fef3c7', color: '#d97706', value: stats.students, label: 'Student Logins' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', background: s.bg, color: s.color, flexShrink: 0 }}><i className={`fa-solid fa-${s.icon}`}></i></div>
            <div><h4 style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</h4><p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Login Activity Table */}
      <div className="panel">
        <div className="panel-header">
          <h3><i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--primary)' }}></i> Login Activity</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-box"><i className="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Search users, IPs..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <option value="">All Types</option>
              <option value="admin">Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <option value="">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            <table className="data-table">
              <thead><tr><th>User</th><th>Type</th><th>Login At</th><th>Logout At</th><th>Duration</th><th>IP Address</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((r, i) => {
                  const initials = (r.displayName?.split(' ')[0]?.[0] || '') + (r.displayName?.split(' ')[1]?.[0] || '');
                  const color = avatarColors[i % avatarColors.length];
                  return (
                    <tr key={r._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: color, flexShrink: 0 }}>{initials.toUpperCase() || '?'}</div>
                          <div>
                            <strong style={{ fontSize: '0.82rem', display: 'block' }}>{r.displayName}</strong>
                            <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{r.displayEmail || r.displayExtra || '—'}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge ${typeBadge[r.userType] || 'badge-info'}`}><i className={`fa-solid fa-${typeIcon[r.userType] || 'user'}`} style={{ marginRight: '4px' }}></i>{r.userType}</span></td>
                      <td>{fmtDate(r.loginAt)}</td>
                      <td>{fmtDate(r.logoutAt)}</td>
                      <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>{fmtDuration(r.loginAt, r.logoutAt)}</td>
                      <td style={{ fontSize: '0.82rem' }}>{r.ipAddress || '—'}</td>
                      <td>
                        <span className={`badge ${r.status === 'online' ? 'badge-success' : 'badge-warning'}`}>
                          {r.status === 'online' && <i className="fa-solid fa-circle" style={{ fontSize: '0.5rem', marginRight: '4px' }}></i>}
                          {r.status}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        {r.status === 'online' && <button className="action-btn action-delete" title="Terminate Session" style={{ background: '#fee2e2' }} onClick={() => handleTerminate(r._id)}><i className="fa-solid fa-ban"></i></button>}
                        <button className="action-btn action-delete" title="Delete" onClick={() => handleDelete(r._id)}><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}><i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '10px', display: 'block' }}></i><p>No login activity records found.</p></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
