import { useState, useEffect, useMemo } from 'react';
import API from '../../services/api.js';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [viewModal, setViewModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchApps = async () => {
    setLoading(true);
    try { const { data } = await API.get('/applications'); setApplications(data); } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, []);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const updateStatus = async (id, status) => {
    try { await API.put(`/applications/${id}`, { status }); showMessage(`Application ${status.toLowerCase()}!`, 'success'); fetchApps(); }
    catch (e) { showMessage('Error updating status', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return;
    try { await API.delete(`/applications/${id}`); showMessage('Application deleted!', 'success'); fetchApps(); }
    catch (e) { showMessage('Error deleting application', 'error'); }
  };

  const openModal = (app) => {
    setViewModal(app);
    setNewStatus(app.status);
    setAdminNotes(app.adminNotes || '');
  };

  const saveModal = async () => {
    if (!viewModal) return;
    try {
      await API.put(`/applications/${viewModal._id}`, { status: newStatus, adminNotes });
      showMessage('Application updated!', 'success');
      setViewModal(null);
      fetchApps();
    } catch (e) { showMessage('Error updating application', 'error'); }
  };

  const stats = useMemo(() => {
    const newCount = applications.filter((a) => a.status === 'New').length;
    const reviewedCount = applications.filter((a) => a.status === 'Reviewed').length;
    const admittedCount = applications.filter((a) => a.status === 'Admitted').length;
    const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;
    return { newCount, reviewedCount, admittedCount, rejectedCount };
  }, [applications]);

  const filtered = useMemo(() => {
    if (!search) return applications;
    return applications.filter((a) => `${a.firstName} ${a.lastName} ${a.email} ${a.course}`.toLowerCase().includes(search.toLowerCase()));
  }, [applications, search]);

  const badgeClass = (status) => status === 'Admitted' ? 'badge-success' : status === 'New' ? 'badge-info' : status === 'Reviewed' ? 'badge-warning' : 'badge-danger';

  return (
    <>
      {msg && (
        <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500, background: msgType === 'success' ? '#dcfce7' : '#fee2e2', color: msgType === 'success' ? '#15803d' : '#dc2626' }}>
          <i className="fa-solid fa-circle-check"></i> {msg}
        </div>
      )}

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-card-top"><div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}><i className="fa-solid fa-bell"></i></div></div>
          <h3>{stats.newCount}</h3><p>New Applications</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top"><div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><i className="fa-solid fa-eye"></i></div></div>
          <h3>{stats.reviewedCount}</h3><p>Reviewed</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top"><div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)' }}><i className="fa-solid fa-circle-check"></i></div></div>
          <h3>{stats.admittedCount}</h3><p>Admitted</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top"><div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}><i className="fa-solid fa-circle-xmark"></i></div></div>
          <h3>{stats.rejectedCount}</h3><p>Rejected</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>All Applications</h3>
          <div className="search-box"><i className="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Search applications..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            <table className="data-table">
              <thead><tr><th>App ID</th><th>Name</th><th>Course</th><th>Email</th><th>Phone</th><th>Applied On</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((app, i) => (
                  <tr key={app._id}>
                    <td>#APP{String(i + 1).padStart(4, '0')}</td>
                    <td>{app.firstName} {app.lastName}</td>
                    <td>{app.course ? app.course.charAt(0).toUpperCase() + app.course.slice(1) : '—'}</td>
                    <td>{app.email}</td>
                    <td>{app.phone || '—'}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td><span className={`badge ${badgeClass(app.status)}`}>{app.status}</span></td>
                    <td style={{ display: 'flex', gap: '5px' }}>
                      {app.status === 'New' && <button className="action-btn action-edit" title="Mark Reviewed" onClick={() => updateStatus(app._id, 'Reviewed')}><i className="fa-solid fa-eye"></i></button>}
                      {app.status === 'Reviewed' && (
                        <>
                          <button className="action-btn action-view" title="Admit" onClick={() => updateStatus(app._id, 'Admitted')}><i className="fa-solid fa-user-check"></i></button>
                          <button className="action-btn action-delete" title="Reject" onClick={() => updateStatus(app._id, 'Rejected')}><i className="fa-solid fa-xmark"></i></button>
                        </>
                      )}
                      {(app.status === 'Admitted' || app.status === 'Rejected') && <button className="action-btn action-delete" title="Delete" onClick={() => handleDelete(app._id)}><i className="fa-solid fa-trash"></i></button>}
                      <button className="action-btn action-edit" title="View Details" onClick={() => openModal(app)}><i className="fa-solid fa-info-circle"></i></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="8"><div className="empty-state"><i className="fa-solid fa-file-pen"></i><p>No applications yet.</p></div></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {viewModal && (
        <div className="modal-overlay active" onClick={() => setViewModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Application Details</h3><button className="modal-close" onClick={() => setViewModal(null)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div><strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Name</strong><p style={{ fontSize: '1rem', marginTop: '4px' }}>{viewModal.firstName} {viewModal.lastName}</p></div>
                <div><strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Course</strong><p style={{ fontSize: '1rem', marginTop: '4px' }}>{viewModal.course}</p></div>
                <div><strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</strong><p style={{ fontSize: '1rem', marginTop: '4px' }}>{viewModal.email}</p></div>
                <div><strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone</strong><p style={{ fontSize: '1rem', marginTop: '4px' }}>{viewModal.phone || '—'}</p></div>
                <div><strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Applied On</strong><p style={{ fontSize: '1rem', marginTop: '4px' }}>{new Date(viewModal.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p></div>
                <div><strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</strong><p style={{ fontSize: '1rem', marginTop: '4px' }}><span className={`badge ${badgeClass(viewModal.status)}`}>{viewModal.status}</span></p></div>
              </div>
              <div><strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Message</strong><p style={{ fontSize: '0.9rem', marginTop: '4px', padding: '12px', background: 'var(--bg-light)', borderRadius: '8px' }}>{viewModal.message || 'No message provided'}</p></div>
              {viewModal.adminNotes && (
                <div style={{ marginTop: '16px' }}><strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin Notes</strong><p style={{ fontSize: '0.9rem', marginTop: '4px', padding: '12px', background: 'var(--bg-light)', borderRadius: '8px' }}>{viewModal.adminNotes}</p></div>
              )}
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Admin Notes</label>
                <textarea rows={3} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', marginTop: '6px', minHeight: '80px' }} placeholder="Add notes about this application..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ padding: '8px 14px' }}>
                    <option value="New">New</option><option value="Reviewed">Reviewed</option><option value="Admitted">Admitted</option><option value="Rejected">Rejected</option>
                  </select>
                </div>
                <button className="btn btn-primary btn-sm" onClick={saveModal}>Update Status</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
