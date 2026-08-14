import { useState, useEffect, useMemo } from 'react';
import API from '../../services/api.js';

const formatINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AdminFees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [receiptFee, setReceiptFee] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [form, setForm] = useState({ studentId: '', feeType: 'Tuition', totalAmount: 0, paidAmount: 0, paymentDate: '', notes: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feesRes, stuRes, defRes] = await Promise.all([
        API.get('/fees'),
        API.get('/students'),
        API.get('/fees/defaulters/list'),
      ]);
      setFees(feesRes.data);
      setStudents(stuRes.data);
      setDefaulters(defRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const handleAdd = async () => {
    if (!form.studentId || !form.totalAmount) { showMessage('Please fill required fields', 'error'); return; }
    try {
      await API.post('/fees', { ...form, totalAmount: Number(form.totalAmount), paidAmount: Number(form.paidAmount) });
      showMessage('Fee record added successfully!', 'success');
      setModal(false);
      setForm({ studentId: '', feeType: 'Tuition', totalAmount: 0, paidAmount: 0, paymentDate: '', notes: '' });
      fetchData();
    } catch (e) { showMessage(e.response?.data?.message || 'Error adding fee', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this fee record?')) return;
    try { await API.delete(`/fees/${id}`); showMessage('Fee record deleted!', 'success'); fetchData(); }
    catch (e) { showMessage('Error deleting fee', 'error'); }
  };

  const handleStatusChange = async (id, status) => {
    try { await API.put(`/fees/${id}`, { status }); showMessage('Status updated!', 'success'); fetchData(); }
    catch (e) { showMessage('Error updating status', 'error'); }
  };

  const stats = useMemo(() => {
    const total = fees.reduce((a, f) => a + (f.totalAmount || 0), 0);
    const paid = fees.reduce((a, f) => a + (f.paidAmount || 0), 0);
    const due = fees.reduce((a, f) => a + (f.dueAmount || 0), 0);
    return { total, paid, due, count: fees.length };
  }, [fees]);

  const filtered = useMemo(() => {
    if (!search) return fees;
    const term = search.toLowerCase();
    return fees.filter((f) =>
      (f.studentName || '').toLowerCase().includes(term) ||
      (f.feeType || '').toLowerCase().includes(term) ||
      (f.studentCourse || '').toLowerCase().includes(term)
    );
  }, [fees, search]);

  const badgeClass = (status) => status === 'Paid' ? 'badge-success' : status === 'Partial' ? 'badge-warning' : 'badge-danger';

  const showReceipt = (fee) => setReceiptFee(fee);
  const closeReceipt = () => setReceiptFee(null);

  const receiptNo = (id) => 'EDU-FR-' + String(id).slice(-5).toUpperCase().padStart(5, '0');
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <>
      {msg && (
        <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500, background: msgType === 'success' ? '#dcfce7' : '#fee2e2', color: msgType === 'success' ? '#15803d' : '#dc2626' }}>
          <i className={`fa-solid fa-${msgType === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i> {msg}
        </div>
      )}

      <div className="fee-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '25px' }}>
        <div className="fee-stat-card" style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--secondary)' }}>{formatINR(stats.total)}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Total Fees</p>
        </div>
        <div className="fee-stat-card" style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--secondary)' }}>{formatINR(stats.paid)}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Paid Amount</p>
        </div>
        <div className="fee-stat-card" style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--secondary)' }}>{formatINR(stats.due)}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Due Amount</p>
        </div>
        <div className="fee-stat-card" style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--secondary)' }}>{stats.count}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Fee Records</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Fee Records</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-box"><i className="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Search fees..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><i className="fa-solid fa-plus"></i> New Fee</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            <table className="data-table">
              <thead><tr><th>ID</th><th>Student</th><th>Course</th><th>Year</th><th>Fee Type</th><th>Total</th><th>Paid</th><th>Due</th><th>Payment Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((f, i) => (
                  <tr key={f._id}>
                    <td>#FEE{String(i + 1).padStart(3, '0')}</td>
                    <td>{f.studentName || 'Deleted'}</td>
                    <td>{f.studentCourse || '—'}</td>
                    <td>{f.studentYear || '—'}</td>
                    <td>{f.feeType}</td>
                    <td>{formatINR(f.totalAmount)}</td>
                    <td>{formatINR(f.paidAmount)}</td>
                    <td>{formatINR(f.dueAmount)}</td>
                    <td>{fmtDate(f.paymentDate)}</td>
                    <td><span className={`badge ${badgeClass(f.status)}`}>{f.status}</span></td>
                    <td style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <button className="action-btn action-view" title="View Receipt" onClick={() => showReceipt(f)}><i className="fa-solid fa-eye"></i></button>
                      <select onChange={(e) => handleStatusChange(f._id, e.target.value)} value={f.status} style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.78rem' }}>
                        <option value="Pending">Pending</option><option value="Partial">Partial</option><option value="Paid">Paid</option>
                      </select>
                      <button className="action-btn action-delete" onClick={() => handleDelete(f._id)} title="Delete"><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="11" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No fee records found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Defaulters Panel */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-header"><h3>Defaulters</h3></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Student</th><th>Course</th><th>Year</th><th>Total Due</th></tr></thead>
            <tbody>
              {defaulters.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No defaulters</td></tr>}
              {defaulters.map((d, i) => (
                <tr key={i}>
                  <td>{d.firstName} {d.lastName}</td>
                  <td>{d.course}</td>
                  <td>{d.year}</td>
                  <td style={{ color: '#dc2626', fontWeight: 600 }}>{formatINR(d.totalDue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fee Modal */}
      {modal && (
        <div className="modal-overlay active" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Fee Record</h3>
              <button className="modal-close" onClick={() => setModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Student</label>
                <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
                  <option value="">Select Student</option>
                  {students.filter((s) => s.status === 'Active').map((s) => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} — {s.course} ({s.year})</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fee Type</label>
                  <input type="text" value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Payment Date</label>
                  <input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Total Amount (₹)</label><input type="number" step="0.01" placeholder="e.g. 50000" min="0" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} required /></div>
                <div className="form-group"><label>Paid Amount (₹)</label><input type="number" step="0.01" placeholder="e.g. 25000" min="0" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Notes</label><textarea rows={2} placeholder="Optional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleAdd}><i className="fa-solid fa-save"></i> Save Fee</button>
            </div>
          </div>
        </div>
      )}

      {/* Fee Receipt Modal */}
      {receiptFee && (
        <div className="modal-overlay active" onClick={closeReceipt}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-receipt"></i> Fee Receipt</h3>
              <button className="modal-close" onClick={closeReceipt}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div style={{ border: '2px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#1e293b', color: '#fff', textAlign: 'center', padding: '16px' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '1px', margin: 0 }}>EDUNEX COLLEGE</h2>
                  <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: '4px 0 0' }}>FEE PAYMENT RECEIPT</p>
                </div>
                <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '10px' }}>Receipt No: <strong>{receiptNo(receiptFee._id)}</strong></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                    <div><span style={{ color: '#64748b' }}>Name:</span> <strong>{receiptFee.studentName}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Course:</span> <strong>{receiptFee.studentCourse}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Year:</span> <strong>{receiptFee.studentYear}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Receipt No:</span> <strong>{receiptNo(receiptFee._id)}</strong></div>
                  </div>
                </div>
                <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', marginBottom: '12px' }}>
                    <div><span style={{ color: '#64748b' }}>Fee Type:</span> <strong>{receiptFee.feeType}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Payment Date:</span> <strong>{fmtDate(receiptFee.paymentDate)}</strong></div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ textAlign: 'left', padding: '8px 12px' }}>Total Amount</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px' }}>Paid Amount</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px' }}>Due Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{formatINR(receiptFee.totalAmount)}</td>
                        <td style={{ padding: '10px 12px', color: '#15803d', fontWeight: 700 }}>{formatINR(receiptFee.paidAmount)}</td>
                        <td style={{ padding: '10px 12px', color: '#dc2626', fontWeight: 700 }}>{formatINR(receiptFee.dueAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>
                        {receiptFee.totalAmount > 0 ? Math.round((receiptFee.paidAmount / receiptFee.totalAmount) * 100) : 0}%
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Payment Done</div>
                    </div>
                    <div>
                      <span className={`badge ${badgeClass(receiptFee.status)}`} style={{ fontSize: '0.9rem', padding: '6px 20px' }}>{receiptFee.status}</span>
                    </div>
                  </div>
                  {receiptFee.dueAmount > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
                      Note: {formatINR(receiptFee.dueAmount)} is still pending.
                    </div>
                  )}
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '10px' }}>
                    This is a computer-generated receipt.<br />
                    Generated on {new Date().toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeReceipt}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
