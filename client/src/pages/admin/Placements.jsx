import { useState, useEffect, useMemo } from 'react';
import API from '../../services/api.js';

const courses = ['B.Tech CSE', 'B.Tech ECE', 'BCA', 'MBA', 'MCA', 'B.Sc', 'Diploma'];

export default function AdminPlacements() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [form, setForm] = useState({ studentName: '', course: 'B.Tech CSE', company: '', package: '', role: '', placedDate: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) });

  const fetchPlacements = async () => {
    setLoading(true);
    try { const { data } = await API.get('/placements'); setPlacements(data); } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchPlacements(); }, []);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const handleAdd = async () => {
    if (!form.studentName || !form.company || !form.package) { showMessage('Please fill required fields', 'error'); return; }
    try {
      await API.post('/placements', form);
      showMessage('Placement record added!', 'success');
      setModal(false);
      fetchPlacements();
    } catch (e) { showMessage('Error adding record', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { await API.delete(`/placements/${id}`); showMessage('Record deleted!', 'success'); fetchPlacements(); }
    catch (e) { showMessage('Error deleting', 'error'); }
  };

  const stats = useMemo(() => {
    const packages = placements.map((p) => parseFloat(p.package)).filter((n) => !isNaN(n));
    const highest = packages.length > 0 ? Math.max(...packages) : 0;
    const avg = packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : 0;
    return { highest, avg, total: placements.length };
  }, [placements]);

  const filtered = useMemo(() => {
    if (!search) return placements;
    return placements.filter((p) => `${p.studentName} ${p.company} ${p.course}`.toLowerCase().includes(search.toLowerCase()));
  }, [placements, search]);

  return (
    <>
      {msg && (
        <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500, background: msgType === 'success' ? '#dcfce7' : '#fee2e2', color: msgType === 'success' ? '#15803d' : '#dc2626' }}>
          <i className={`fa-solid fa-${msgType === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i> {msg}
        </div>
      )}

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-card-top"><div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}><i className="fa-solid fa-indian-rupee-sign"></i></div></div>
          <h3>{stats.highest ? `${stats.highest} LPA` : '-'}</h3><p>Highest Package</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top"><div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)' }}><i className="fa-solid fa-chart-line"></i></div></div>
          <h3>{stats.avg ? `${stats.avg.toFixed(1)} LPA` : '-'}</h3><p>Average Package</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top"><div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><i className="fa-solid fa-percent"></i></div></div>
          <h3>95%</h3><p>Placement Rate</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top"><div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><i className="fa-solid fa-users"></i></div></div>
          <h3>{stats.total}+</h3><p>Students Placed</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Placement Records</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-box"><i className="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Search placements..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><i className="fa-solid fa-plus"></i> Add Record</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            <table className="data-table">
              <thead><tr><th>Student</th><th>Course</th><th>Company</th><th>Package</th><th>Role</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td>{p.studentName}</td>
                    <td>{p.course}</td>
                    <td>{p.company}</td>
                    <td>{p.package}</td>
                    <td>{p.role || '—'}</td>
                    <td>{p.placedDate || '—'}</td>
                    <td><button className="action-btn action-delete" onClick={() => handleDelete(p._id)} title="Delete"><i className="fa-solid fa-trash"></i></button></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No placement records</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay active" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Add Placement Record</h3><button className="modal-close" onClick={() => setModal(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Student Name</label><input type="text" placeholder="Enter student name" required value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Course</label><select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>{courses.map((c) => <option key={c}>{c}</option>)}</select></div>
                <div className="form-group"><label>Company</label><input type="text" placeholder="e.g. Google" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Package (LPA)</label><input type="text" placeholder="e.g. 51" required value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} /></div>
                <div className="form-group"><label>Role</label><input type="text" placeholder="e.g. Software Engineer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Date</label><input type="text" placeholder="e.g. Jul 2024" value={form.placedDate} onChange={(e) => setForm({ ...form, placedDate: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Record</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
