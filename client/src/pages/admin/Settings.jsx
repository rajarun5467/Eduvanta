import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api.js';

export default function AdminSettings() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'students';
  const [tab, setTab] = useState(initialTab);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get('/students'), API.get('/faculty')])
      .then(([s, f]) => { setStudents(s.data); setFaculty(f.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggleStudentStatus = async (id, current) => {
    const newStatus = current === 'Active' ? 'Inactive' : 'Active';
    await API.post(`/students/${id}/toggle-status`, { status: newStatus });
    setStudents(students.map(s => s._id === id ? { ...s, status: newStatus } : s));
  };

  const toggleFacultyStatus = async (id, current) => {
    const newStatus = current === 'Active' ? 'Inactive' : 'Active';
    await API.post(`/faculty/${id}/toggle-status`, { status: newStatus });
    setFaculty(faculty.map(f => f._id === id ? { ...f, status: newStatus } : f));
  };

  const resetStudentPassword = async (id) => {
    const { data } = await API.post(`/students/${id}/reset-password`);
    alert(data.message);
  };

  const resetFacultyPassword = async (id) => {
    const { data } = await API.post(`/faculty/${id}/reset-password`);
    alert(data.message);
  };

  const deleteStudent = async (id) => {
    if (!confirm('Delete this student?')) return;
    await API.delete(`/students/${id}`);
    setStudents(students.filter(s => s._id !== id));
  };

  const deleteFaculty = async (id) => {
    if (!confirm('Delete this faculty member?')) return;
    await API.delete(`/faculty/${id}`);
    setFaculty(faculty.filter(f => f._id !== id));
  };

  const tabs = [
    { id: 'students', label: 'Student Management', icon: 'user-graduate' },
    { id: 'faculty', label: 'Faculty Management', icon: 'chalkboard-user' },
    { id: 'logins', label: 'Login Activity', icon: 'right-to-bracket' },
  ];

  return (
    <>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}><i className="fa-solid fa-user-graduate"></i></div><h3>{students.length}</h3><p>Students</p></div>
        <div className="stat-card"><div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)' }}><i className="fa-solid fa-chalkboard-user"></i></div><h3>{faculty.length}</h3><p>Faculty</p></div>
        <div className="stat-card"><div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><i className="fa-solid fa-user-check"></i></div><h3>{students.filter(s => s.status === 'Active').length}</h3><p>Active Students</p></div>
        <div className="stat-card"><div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><i className="fa-solid fa-user-check"></i></div><h3>{faculty.filter(f => f.status === 'Active').length}</h3><p>Active Faculty</p></div>
      </div>

      <div className="panel">
        <div className="panel-header" style={{ borderBottom: 'none' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {tabs.map(t => (
              <button key={t.id} className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t.id)}>
                <i className={`fa-solid fa-${t.icon}`}></i> {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            <>
              {tab === 'students' && (
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Course</th><th>Year</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s._id}>
                        <td>{s.firstName} {s.lastName}</td>
                        <td>{s.email}</td>
                        <td>{s.course}</td>
                        <td>{s.year}</td>
                        <td><span className={`badge ${s.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{s.status}</span></td>
                        <td>
                          <button className="btn btn-sm btn-outline" onClick={() => toggleStudentStatus(s._id, s.status)} title="Toggle Status"><i className="fa-solid fa-power-off"></i></button>
                          <button className="btn btn-sm btn-outline" onClick={() => resetStudentPassword(s._id)} title="Reset Password"><i className="fa-solid fa-key"></i></button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteStudent(s._id)}><i className="fa-solid fa-trash"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {tab === 'faculty' && (
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Department</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {faculty.map(f => (
                      <tr key={f._id}>
                        <td>{f.firstName} {f.lastName}</td>
                        <td>{f.department}</td>
                        <td>{f.email}</td>
                        <td><span className={`badge ${f.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{f.status}</span></td>
                        <td>
                          <button className="btn btn-sm btn-outline" onClick={() => toggleFacultyStatus(f._id, f.status)} title="Toggle Status"><i className="fa-solid fa-power-off"></i></button>
                          <button className="btn btn-sm btn-outline" onClick={() => resetFacultyPassword(f._id)} title="Reset Password"><i className="fa-solid fa-key"></i></button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteFaculty(f._id)}><i className="fa-solid fa-trash"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {tab === 'logins' && <LoginActivityTab />}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function LoginActivityTab() {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    API.get('/login-activity').then(({ data }) => setRecords(data)).catch(() => {});
  }, []);
  return (
    <table className="data-table">
      <thead><tr><th>User ID</th><th>Type</th><th>Login At</th><th>Logout At</th><th>IP</th><th>Status</th></tr></thead>
      <tbody>
        {records.map(r => (
          <tr key={r._id}>
            <td>{r.userId}</td><td>{r.userType}</td>
            <td>{new Date(r.loginAt).toLocaleString()}</td>
            <td>{r.logoutAt ? new Date(r.logoutAt).toLocaleString() : '-'}</td>
            <td>{r.ipAddress}</td>
            <td><span className={`badge ${r.status === 'online' ? 'badge-success' : 'badge-warning'}`}>{r.status}</span></td>
          </tr>
        ))}
        {records.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>No login activity</td></tr>}
      </tbody>
    </table>
  );
}
