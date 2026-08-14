import { useState, useEffect } from 'react';
import API from '../../services/api.js';

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [form, setForm] = useState({ title: '', description: '', targetRole: 'all' });

  const fetchNotices = async () => {
    setLoading(true);
    try { const { data } = await API.get('/notices'); setNotices(data); } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, []);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const handleAdd = async () => {
    if (!form.title || !form.description) { showMessage('Title and description required', 'error'); return; }
    try {
      await API.post('/notices', form);
      showMessage('Notice added!', 'success');
      setModal(false);
      setForm({ title: '', description: '', targetRole: 'all' });
      fetchNotices();
    } catch (e) { showMessage('Error adding notice', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notice?')) return;
    try { await API.delete(`/notices/${id}`); showMessage('Notice deleted!', 'success'); fetchNotices(); }
    catch (e) { showMessage('Error deleting', 'error'); }
  };

  return (
    <>
      {msg && (
        <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500, background: msgType === 'success' ? '#dcfce7' : '#fee2e2', color: msgType === 'success' ? '#15803d' : '#dc2626' }}>
          <i className={`fa-solid fa-${msgType === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i> {msg}
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h3>Notices</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><i className="fa-solid fa-plus"></i> New Notice</button>
        </div>
        {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
          notices.length === 0 ? <div className="empty-state"><i className="fa-solid fa-bell"></i><p>No notices yet.</p></div> :
          notices.map((n) => (
            <div key={n._id} style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px', flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '6px' }}>{n.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{n.description}</p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>For: {n.targetRole ? n.targetRole.charAt(0).toUpperCase() + n.targetRole.slice(1) : 'All'} · {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <button className="action-btn action-delete" onClick={() => handleDelete(n._id)}><i className="fa-solid fa-trash"></i></button>
              </div>
            </div>
          ))
        )}
      </div>

      {modal && (
        <div className="modal-overlay active" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>New Notice</h3><button className="modal-close" onClick={() => setModal(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Title</label><input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="form-group"><label>Description</label><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-group">
                <label>Target Audience</label>
                <select value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
                  <option value="all">All</option><option value="admin">Admin</option><option value="teacher">Teachers</option><option value="student">Students</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}><i className="fa-solid fa-save"></i> Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
