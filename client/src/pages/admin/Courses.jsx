import { useState, useEffect, useMemo } from 'react';
import API from '../../services/api.js';

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Management', 'Sciences', 'Humanities', 'Computer Applications'];

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [form, setForm] = useState({ name: '', department: 'Computer Science', duration: '', fee: '', status: 'Active', description: '' });

  const fetchCourses = async () => {
    setLoading(true);
    try { const { data } = await API.get('/courses'); setCourses(data); } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const handleAdd = async () => {
    if (!form.name || !form.duration || !form.fee) { showMessage('Please fill required fields', 'error'); return; }
    try {
      await API.post('/courses', form);
      showMessage('Course added successfully!', 'success');
      setModal(false);
      fetchCourses();
    } catch (e) { showMessage(e.response?.data?.message || 'Error adding course', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try { await API.delete(`/courses/${id}`); showMessage('Course deleted!', 'success'); fetchCourses(); }
    catch (e) { showMessage('Error deleting course', 'error'); }
  };

  const filtered = useMemo(() => {
    if (!search) return courses;
    return courses.filter((c) => `${c.name} ${c.department} ${c.duration}`.toLowerCase().includes(search.toLowerCase()));
  }, [courses, search]);

  return (
    <>
      {msg && (
        <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500, background: msgType === 'success' ? '#dcfce7' : '#fee2e2', color: msgType === 'success' ? '#15803d' : '#dc2626' }}>
          <i className={`fa-solid fa-${msgType === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i> {msg}
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h3>Course List</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-box"><i className="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><i className="fa-solid fa-plus"></i> Add Course</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            <table className="data-table">
              <thead><tr><th>Code</th><th>Course Name</th><th>Department</th><th>Duration</th><th>Fee/Year</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c._id}>
                    <td>#CRS{String(i + 1).padStart(2, '0')}</td>
                    <td>{c.name}</td>
                    <td>{c.department}</td>
                    <td>{c.duration}</td>
                    <td>₹ {Number(c.fee || 0).toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span></td>
                    <td>
                      <button className="action-btn action-delete" onClick={() => handleDelete(c._id)} title="Delete"><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No courses found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay active" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Course</h3>
              <button className="modal-close" onClick={() => setModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Course Name</label><input type="text" placeholder="Enter course name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>{departments.map((d) => <option key={d}>{d}</option>)}</select>
                </div>
                <div className="form-group"><label>Duration (Years)</label><input type="number" placeholder="e.g. 4" min="1" max="5" required value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Annual Fee (₹)</label><input type="number" placeholder="e.g. 250000" required value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} /></div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Draft</option></select>
                </div>
              </div>
              <div className="form-group"><label>Description</label><textarea rows={3} placeholder="Course description..." style={{ minHeight: '80px' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleAdd}>Add Course</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
