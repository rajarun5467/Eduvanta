import { useState, useEffect } from 'react';
import API from '../../services/api.js';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [form, setForm] = useState({ title: '', description: '', eventDate: '', eventType: 'General' });

  const fetchEvents = async () => {
    setLoading(true);
    try { const { data } = await API.get('/events'); setEvents(data); } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const handleAdd = async () => {
    if (!form.title || !form.eventDate) { showMessage('Title and date required', 'error'); return; }
    try { await API.post('/events', form); showMessage('Event added!', 'success'); setModal(false); setForm({ title: '', description: '', eventDate: '', eventType: 'General' }); fetchEvents(); }
    catch (e) { showMessage('Error adding event', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try { await API.delete(`/events/${id}`); showMessage('Event deleted!', 'success'); fetchEvents(); }
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
          <h3>Events</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><i className="fa-solid fa-plus"></i> New Event</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            <table className="data-table">
              <thead><tr><th>Title</th><th>Date</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e._id}>
                    <td>
                      <strong>{e.title}</strong><br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.description}</span>
                    </td>
                    <td>{e.eventDate ? new Date(e.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td>{e.eventType || 'General'}</td>
                    <td><span className={`badge ${e.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{e.status || 'Active'}</span></td>
                    <td><button className="action-btn action-delete" onClick={() => handleDelete(e._id)}><i className="fa-solid fa-trash"></i></button></td>
                  </tr>
                ))}
                {events.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No events found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay active" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>New Event</h3><button className="modal-close" onClick={() => setModal(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Title</label><input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Date</label><input type="date" required value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} /></div>
                <div className="form-group"><label>Type</label><input type="text" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} /></div>
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
