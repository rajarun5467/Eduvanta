import { useState, useEffect, useMemo } from 'react';
import API from '../../services/api.js';

const fmtTime = (t) => t ? new Date(`2000-01-01T${t}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--';
const fmtDateTime = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '';

export default function AdminAttendanceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [responses, setResponses] = useState({});

  const fetchRequests = async () => {
    setLoading(true);
    try { const { data } = await API.get(`/corrections?status=${filter}`); setRequests(data); } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const handleApprove = async (id) => {
    try {
      await API.put(`/corrections/${id}`, { status: 'Approved', adminResponse: responses[id] || '' });
      showMessage('Attendance request approved and attendance updated.', 'success');
      fetchRequests();
    } catch (e) { showMessage('Error approving request', 'error'); }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/corrections/${id}`, { status: 'Rejected', adminResponse: responses[id] || '' });
      showMessage('Attendance request rejected.', 'success');
      fetchRequests();
    } catch (e) { showMessage('Error rejecting request', 'error'); }
  };

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === 'Pending').length;
    const approved = requests.filter((r) => r.status === 'Approved').length;
    const rejected = requests.filter((r) => r.status === 'Rejected').length;
    const total = requests.length;
    return { pending, approved, rejected, total };
  }, [requests]);

  return (
    <>
      {msg && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', background: msgType === 'success' ? '#dcfce7' : '#fee2e2', color: msgType === 'success' ? '#15803d' : '#b91c1c', border: `1px solid ${msgType === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
          <i className={`fa-solid fa-${msgType === 'success' ? 'circle-check' : 'circle-exclamation'}`} style={{ fontSize: '1.2rem' }}></i>
          {msg}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '18px', marginBottom: '28px' }}>
        {[
          { icon: 'clock', bg: 'linear-gradient(135deg,#f59e0b,#d97706)', value: stats.pending, label: 'Pending Requests' },
          { icon: 'circle-check', bg: 'linear-gradient(135deg,#22c55e,#15803d)', value: stats.approved, label: 'Approved' },
          { icon: 'circle-xmark', bg: 'linear-gradient(135deg,#ef4444,#dc2626)', value: stats.rejected, label: 'Rejected' },
          { icon: 'inbox', bg: 'linear-gradient(135deg,#2563eb,#1d4ed8)', value: stats.total, label: 'Total Requests' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', color: '#fff', background: s.bg, flexShrink: 0 }}><i className={`fa-solid fa-${s.icon}`}></i></div>
            <div><h4 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>{s.value}</h4><p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, margin: '2px 0 0' }}>{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Requests Panel */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', marginBottom: '30px' }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <i className="fa-solid fa-user-clock" style={{ color: 'var(--primary)' }}></i> Faculty Attendance Correction Requests
          </h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['Pending', 'Approved', 'Rejected', 'All'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid var(--border)', background: filter === f ? 'var(--primary)' : 'var(--white)', color: filter === f ? '#fff' : 'var(--text-muted)', borderColor: filter === f ? 'var(--primary)' : 'var(--border)', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Faculty', 'Date', 'Requested', 'Reason', 'Status', 'Response / Action'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)', background: 'var(--bg-light, #f8fafc)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const initials = (r.facultyName?.[0] || '?').toUpperCase();
                  return (
                    <tr key={r._id} style={{ transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#1e40af)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                          <div>
                            <strong style={{ fontSize: '0.85rem', display: 'block' }}>{r.facultyName}</strong>
                            <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.department || r.role || 'Teacher'}</small>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', verticalAlign: 'top', fontWeight: 600 }}>
                        {r.requestDate ? new Date(r.requestDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>Requested: {fmtDateTime(r.createdAt)}</small>
                      </td>
                      <td style={{ padding: '16px', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', verticalAlign: 'top', fontWeight: 700 }}>
                        {r.requestedStatus}
                        <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>{fmtTime(r.checkIn)} - {fmtTime(r.checkOut)}</small>
                      </td>
                      <td style={{ padding: '16px', fontSize: '0.82rem', borderBottom: '1px solid var(--border)', verticalAlign: 'top', maxWidth: '240px', color: 'var(--text-muted)' }}>{r.reason || '—'}</td>
                      <td style={{ padding: '16px', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>
                        <span className={`badge ${r.status === 'Approved' ? 'badge-success' : r.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{r.status}</span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>
                        {r.status === 'Pending' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '260px' }}>
                            <textarea placeholder="Write a response to faculty..." rows={2} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.8rem', resize: 'vertical' }} value={responses[r._id] || ''} onChange={(e) => setResponses({ ...responses, [r._id]: e.target.value })} />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn btn-success btn-sm" onClick={() => handleApprove(r._id)}><i className="fa-solid fa-check"></i> Approve</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleReject(r._id)}><i className="fa-solid fa-xmark"></i> Reject</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.82rem', color: 'var(--secondary)' }}>
                            {r.adminResponse || '—'}
                            {r.reviewedAt && <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>Reviewed: {fmtDateTime(r.reviewedAt)}</small>}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {requests.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                    <i className="fa-regular fa-clipboard" style={{ fontSize: '2.5rem', opacity: 0.3, display: 'block', marginBottom: '12px' }}></i>
                    <p style={{ fontSize: '0.9rem' }}>No attendance correction requests found.</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
