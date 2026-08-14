import { useState, useEffect, useMemo } from 'react';
import API from '../../services/api.js';

const avatarColors = ['#2563eb', '#7c3aed', '#db2777', '#d97706', '#15803d', '#0891b2', '#b91c1c', '#4f46e5'];
const roleDisplay = (role) => (role || 'teacher').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const statusBadge = (s) => s === 'Present' ? 'badge-success' : s === 'Late' ? 'badge-warning' : s === 'Half Day' ? 'badge-info' : s === 'Not Marked' ? 'badge-warning' : 'badge-danger';
const statusSelectBg = (s) => s === 'Present' ? '#dcfce7' : s === 'Absent' ? '#fee2e2' : s === 'Late' ? '#fef3c7' : s === 'Half Day' ? '#ede9fe' : '';

const calcHours = (ci, co) => {
  if (!ci || !co) return '—';
  const [h1, m1] = ci.split(':').map(Number);
  const [h2, m2] = co.split(':').map(Number);
  const diff = (h2 * 60 + m2 - h1 * 60 - m1) / 60;
  return diff > 0 ? diff.toFixed(1) + 'h' : '—';
};

export default function AdminStaffAttendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [todayAtt, setTodayAtt] = useState({});
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [today] = useState(new Date().toISOString().slice(0, 10));
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  // Batch form state
  const [batchData, setBatchData] = useState({});

  // Individual form
  const [indForm, setIndForm] = useState({ userId: '', attendanceDate: new Date().toISOString().slice(0, 10), status: 'Present', checkIn: '09:00', checkOut: '17:00' });

  // Edit modal
  const [editModal, setEditModal] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes, todayRes] = await Promise.all([
        API.get('/staff-attendance/employees/list'),
        API.get(`/staff-attendance?month=${month}`),
        API.get(`/staff-attendance?date=${today}`),
      ]);
      setEmployees(empRes.data);
      setRecords(attRes.data);
      const tMap = {};
      todayRes.data.forEach((r) => { tMap[r.userId] = r; });
      setTodayAtt(tMap);
      // init batch data from today's records
      const bData = {};
      empRes.data.forEach((e) => {
        const t = tMap[e._id];
        bData[e._id] = {
          status: t?.status || 'Present',
          checkIn: t?.checkIn || '09:00',
          checkOut: t?.checkOut || '17:00',
        };
      });
      setBatchData(bData);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [month]);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const handleBatchSave = async () => {
    try {
      const entries = employees.map((e) => ({
        userId: e._id,
        status: batchData[e._id]?.status || 'Present',
        checkIn: batchData[e._id]?.checkIn || '09:00',
        checkOut: batchData[e._id]?.checkOut || '17:00',
      }));
      const { data } = await API.post('/staff-attendance/batch', { batchDate: today, entries });
      showMessage(data.message, 'success');
      fetchData();
    } catch (e) { showMessage('Error saving batch', 'error'); }
  };

  const handleIndividualMark = async () => {
    if (!indForm.userId) { showMessage('Select employee', 'error'); return; }
    try {
      await API.post('/staff-attendance', indForm);
      showMessage('Attendance marked successfully!', 'success');
      setIndForm({ ...indForm, userId: '' });
      fetchData();
    } catch (e) { showMessage('Error marking attendance', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { await API.delete(`/staff-attendance/${id}`); showMessage('Record deleted!', 'success'); fetchData(); }
    catch (e) { showMessage('Error deleting', 'error'); }
  };

  const handleEditSave = async () => {
    try {
      await API.put(`/staff-attendance/${editModal._id}`, { status: editModal.status, checkIn: editModal.checkIn, checkOut: editModal.checkOut });
      showMessage('Record updated!', 'success');
      setEditModal(null);
      fetchData();
    } catch (e) { showMessage('Error updating', 'error'); }
  };

  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const late = records.filter((r) => r.status === 'Late').length;
    const half = records.filter((r) => r.status === 'Half Day').length;
    return { total, present, absent, late, half };
  }, [records]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fmtDay = (d) => d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'short' }) : '—';

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
          { icon: 'calendar-days', bg: '#dbeafe', color: '#2563eb', value: stats.total, label: 'Total Records' },
          { icon: 'check', bg: '#dcfce7', color: '#15803d', value: stats.present, label: 'Present' },
          { icon: 'xmark', bg: '#fee2e2', color: '#dc2626', value: stats.absent, label: 'Absent' },
          { icon: 'clock', bg: '#fef3c7', color: '#d97706', value: stats.late, label: 'Late' },
          { icon: 'hourglass-half', bg: '#ede9fe', color: '#7c3aed', value: stats.half, label: 'Half Day' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', background: s.bg, color: s.color, flexShrink: 0 }}><i className={`fa-solid fa-${s.icon}`}></i></div>
            <div><h4 style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</h4><p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Batch Attendance */}
      <div className="panel">
        <div className="panel-header">
          <h3><i className="fa-solid fa-users" style={{ color: 'var(--primary)' }}></i> Batch Attendance — {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mark all staff at once</span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '10px', padding: '8px 0', borderBottom: '2px solid var(--border)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <div>Employee</div><div>Status</div><div>Check In</div><div>Check Out</div><div>Current</div>
              </div>
              {employees.map((e, i) => {
                const initials = ((e.firstName?.[0] || e.username?.[0] || '') + (e.lastName?.[0] || e.username?.[1] || '')).toUpperCase();
                const color = avatarColors[i % avatarColors.length];
                const current = todayAtt[e._id];
                const bd = batchData[e._id] || { status: 'Present', checkIn: '09:00', checkOut: '17:00' };
                return (
                  <div key={e._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: color, flexShrink: 0 }}>{initials}</div>
                      <div>
                        <strong style={{ fontSize: '0.82rem' }}>{e.firstName ? `${e.firstName} ${e.lastName}` : e.username}</strong>
                        <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{e.department || roleDisplay(e.role)}</small>
                      </div>
                    </div>
                    <div>
                      <select value={bd.status} onChange={(ev) => setBatchData({ ...batchData, [e._id]: { ...bd, status: ev.target.value } })} style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.78rem', width: '100%', background: statusSelectBg(bd.status) }}>
                        <option value="Present">Present</option><option value="Absent">Absent</option><option value="Late">Late</option><option value="Half Day">Half Day</option><option value="Not Marked">Not Marked</option>
                      </select>
                    </div>
                    <div><input type="time" value={bd.checkIn} onChange={(ev) => setBatchData({ ...batchData, [e._id]: { ...bd, checkIn: ev.target.value } })} style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.78rem', width: '100%' }} /></div>
                    <div><input type="time" value={bd.checkOut} onChange={(ev) => setBatchData({ ...batchData, [e._id]: { ...bd, checkOut: ev.target.value } })} style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.78rem', width: '100%' }} /></div>
                    <div>
                      {current ? <span className={`badge ${statusBadge(current.status)}`}>{current.status}</span> : <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Not marked</span>}
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <button className="btn btn-primary" onClick={handleBatchSave}><i className="fa-solid fa-save"></i> Save Batch Attendance</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Individual Mark Form */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-header">
          <h3><i className="fa-solid fa-pen-to-square" style={{ color: 'var(--primary)' }}></i> Mark Individual Attendance</h3>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap', padding: '16px 20px' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
            <label>Employee</label>
            <select value={indForm.userId} onChange={(e) => setIndForm({ ...indForm, userId: e.target.value })} required>
              <option value="">Select Employee</option>
              {employees.map((e) => <option key={e._id} value={e._id}>{e.firstName ? `${e.firstName} ${e.lastName}` : e.username} ({roleDisplay(e.role)})</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '130px', marginBottom: 0 }}>
            <label>Date</label>
            <input type="date" value={indForm.attendanceDate} onChange={(e) => setIndForm({ ...indForm, attendanceDate: e.target.value })} required />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '130px', marginBottom: 0 }}>
            <label>Status</label>
            <select value={indForm.status} onChange={(e) => setIndForm({ ...indForm, status: e.target.value })}>
              <option>Present</option><option>Absent</option><option>Late</option><option>Half Day</option><option>Not Marked</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '100px', marginBottom: 0 }}>
            <label>Check In</label>
            <input type="time" value={indForm.checkIn} onChange={(e) => setIndForm({ ...indForm, checkIn: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '100px', marginBottom: 0 }}>
            <label>Check Out</label>
            <input type="time" value={indForm.checkOut} onChange={(e) => setIndForm({ ...indForm, checkOut: e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={handleIndividualMark}><i className="fa-solid fa-save"></i> Mark</button>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-header">
          <h3><i className="fa-solid fa-list" style={{ color: 'var(--primary)' }}></i> Attendance Records — {new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h3>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.82rem' }} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            <table className="data-table">
              <thead><tr><th>Date</th><th>Day</th><th>Employee</th><th>Department</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Actions</th></tr></thead>
              <tbody>
                {records.map((r, i) => {
                  const initials = ((r.employeeName?.split(' ')[0]?.[0] || '') + (r.employeeName?.split(' ')[1]?.[0] || '')).toUpperCase();
                  const color = avatarColors[i % avatarColors.length];
                  return (
                    <tr key={r._id}>
                      <td>{fmtDate(r.attendanceDate)}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{fmtDay(r.attendanceDate)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: color, flexShrink: 0 }}>{initials}</div>
                          <div>
                            <strong style={{ fontSize: '0.82rem' }}>{r.employeeName}</strong>
                            <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{roleDisplay(r.role)}</small>
                          </div>
                        </div>
                      </td>
                      <td>{r.department}</td>
                      <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                      <td>{r.checkIn || '—'}</td>
                      <td>{r.checkOut || '—'}</td>
                      <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>{calcHours(r.checkIn, r.checkOut)}</td>
                      <td style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <button className="action-btn action-edit" title="Edit" onClick={() => setEditModal(r)}><i className="fa-solid fa-pen"></i></button>
                        <button className="action-btn action-delete" title="Delete" onClick={() => handleDelete(r._id)}><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  );
                })}
                {records.length === 0 && <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}><i className="fa-solid fa-calendar-xmark" style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '10px', display: 'block' }}></i>No attendance records for this month.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay active" onClick={() => setEditModal(null)}>
          <div className="modal" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Attendance Record</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Status</label>
                <select value={editModal.status} onChange={(e) => setEditModal({ ...editModal, status: e.target.value })} required>
                  <option>Present</option><option>Absent</option><option>Late</option><option>Half Day</option><option>Not Marked</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Check In</label><input type="time" value={editModal.checkIn || ''} onChange={(e) => setEditModal({ ...editModal, checkIn: e.target.value })} /></div>
                <div className="form-group"><label>Check Out</label><input type="time" value={editModal.checkOut || ''} onChange={(e) => setEditModal({ ...editModal, checkOut: e.target.value })} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEditSave}><i className="fa-solid fa-save"></i> Update</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
