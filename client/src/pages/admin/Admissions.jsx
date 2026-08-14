import { useState, useEffect, useMemo } from 'react';
import API from '../../services/api.js';

const courses = ['B.Tech CSE', 'B.Tech ECE', 'BCA', 'MBA', 'MCA', 'B.Sc', 'Diploma'];
const years = ['1st Year', '2nd Year', '3rd Year', 'Final Year'];

export default function AdminAdmissions() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', course: 'B.Tech CSE', year: '1st Year', feeAmount: '' });

  const fetchAdmissions = async () => {
    setLoading(true);
    try { const { data } = await API.get('/admissions'); setAdmissions(data); } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchAdmissions(); }, []);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const handleAdd = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.course) { showMessage('Please fill required fields', 'error'); return; }
    try {
      await API.post('/admissions', { ...form, status: 'Admitted', admissionDate: new Date().toISOString().slice(0, 10) });
      showMessage('Admission added successfully!', 'success');
      setModal(false);
      fetchAdmissions();
    } catch (e) { showMessage('Error adding admission', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this admission record?')) return;
    try { await API.delete(`/admissions/${id}`); showMessage('Admission deleted!', 'success'); fetchAdmissions(); }
    catch (e) { showMessage('Error deleting', 'error'); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this admission?')) return;
    try { await API.put(`/admissions/${id}`, { status: 'Cancelled' }); showMessage('Admission cancelled!', 'success'); fetchAdmissions(); }
    catch (e) { showMessage('Error cancelling', 'error'); }
  };

  const filtered = useMemo(() => {
    if (!search) return admissions;
    return admissions.filter((a) => `${a.firstName} ${a.lastName} ${a.email} ${a.course}`.toLowerCase().includes(search.toLowerCase()));
  }, [admissions, search]);

  return (
    <>
      {msg && (
        <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500, background: msgType === 'success' ? '#dcfce7' : '#fee2e2', color: msgType === 'success' ? '#15803d' : '#dc2626' }}>
          <i className={`fa-solid fa-${msgType === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i> {msg}
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h3>Admissions</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-box"><i className="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Search admissions..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><i className="fa-solid fa-plus"></i> New Admission</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            <table className="data-table">
              <thead><tr><th>ID</th><th>Name</th><th>Course</th><th>Year</th><th>Email</th><th>Phone</th><th>Date</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a._id}>
                    <td>#ADM{String(i + 1).padStart(3, '0')}</td>
                    <td>{a.firstName} {a.lastName}</td>
                    <td>{a.course}</td>
                    <td>{a.year}</td>
                    <td>{a.email}</td>
                    <td>{a.phone || '—'}</td>
                    <td>{a.admissionDate ? new Date(a.admissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td>{a.feeAmount || '—'}</td>
                    <td><span className={`badge ${a.status === 'Admitted' ? 'badge-success' : 'badge-danger'}`}>{a.status}</span></td>
                    <td style={{ display: 'flex', gap: '5px' }}>
                      {a.status === 'Admitted' && <button className="action-btn action-edit" title="Cancel" onClick={() => handleCancel(a._id)}><i className="fa-solid fa-ban"></i></button>}
                      <button className="action-btn action-delete" onClick={() => handleDelete(a._id)} title="Delete"><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="10" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No admissions found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay active" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Add New Admission</h3><button className="modal-close" onClick={() => setModal(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>First Name</label><input type="text" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                <div className="form-group"><label>Last Name</label><input type="text" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label>Phone</label><input type="tel" placeholder="Enter phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Course</label><select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>{courses.map((c) => <option key={c}>{c}</option>)}</select></div>
                <div className="form-group"><label>Year</label><select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>{years.map((y) => <option key={y}>{y}</option>)}</select></div>
              </div>
              <div className="form-group"><label>Fee Amount (₹)</label><input type="number" placeholder="e.g. 250000" value={form.feeAmount} onChange={(e) => setForm({ ...form, feeAmount: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Admission</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
