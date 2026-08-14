import { useState, useEffect, useMemo } from 'react';
import API from '../../services/api.js';

const avatarColors = ['#2563eb', '#7c3aed', '#db2777', '#d97706', '#15803d', '#0891b2', '#b91c1c', '#4f46e5'];
const roleDisplay = (role) => (role || 'teacher').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function numberToWords(n) {
  const words = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  if (n <= 20) return words[n];
  if (n < 100) return words[20 + Math.floor(n / 10) - 2] + (n % 10 ? ' ' + words[n % 10] : '');
  if (n < 1000) return words[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numberToWords(n % 100) : '');
  if (n < 100000) return numberToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numberToWords(n % 1000) : '');
  return numberToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numberToWords(n % 100000) : '');
}

const inWords = (net) => {
  const whole = Math.floor(net);
  const paise = Math.round((net - whole) * 100);
  return numberToWords(whole) + ' Rupees' + (paise ? ' and ' + numberToWords(paise) + ' Paise' : '') + ' Only';
};

export default function AdminSalaries() {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [payslipModal, setPayslipModal] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [form, setForm] = useState({ userId: '', salaryMonth: new Date().toISOString().slice(0, 7), basicAmount: 0, deductions: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salRes, empRes] = await Promise.all([API.get('/salaries'), API.get('/salaries/employees/list')]);
      setSalaries(salRes.data);
      setEmployees(empRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const netAmount = Number(form.basicAmount || 0) - Number(form.deductions || 0);

  const handleEmployeeChange = (userId) => {
    const emp = employees.find((e) => e._id === userId);
    setForm({ ...form, userId, basicAmount: emp?.salary || 0 });
  };

  const handleGenerate = async () => {
    if (!form.userId || !form.salaryMonth || !form.basicAmount) { showMessage('Please fill required fields', 'error'); return; }
    try {
      await API.post('/salaries', { userId: form.userId, salaryMonth: form.salaryMonth, basicAmount: Number(form.basicAmount), deductions: Number(form.deductions) });
      showMessage('Payslip generated!', 'success');
      setModal(false);
      setForm({ userId: '', salaryMonth: new Date().toISOString().slice(0, 7), basicAmount: 0, deductions: 0 });
      fetchData();
    } catch (e) { showMessage('Error generating payslip', 'error'); }
  };

  const handleMarkPaid = async (id) => {
    if (!confirm('Mark as paid?')) return;
    try { await API.put(`/salaries/${id}`, { status: 'Paid' }); showMessage('Salary marked as Paid!', 'success'); fetchData(); }
    catch (e) { showMessage('Error updating status', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this payslip?')) return;
    try { await API.delete(`/salaries/${id}`); showMessage('Payslip deleted!', 'success'); fetchData(); }
    catch (e) { showMessage('Error deleting payslip', 'error'); }
  };

  const stats = useMemo(() => {
    const total = salaries.length;
    const paid = salaries.filter((s) => s.status === 'Paid').length;
    const generated = salaries.filter((s) => s.status !== 'Paid').length;
    const totalNet = salaries.reduce((a, s) => a + (s.netAmount || 0), 0);
    const totalDed = salaries.reduce((a, s) => a + (s.deductions || 0), 0);
    return { total, paid, generated, totalNet, totalDed };
  }, [salaries]);

  const filtered = useMemo(() => {
    if (!search) return salaries;
    const term = search.toLowerCase();
    return salaries.filter((s) =>
      (s.employeeName || '').toLowerCase().includes(term) ||
      (s.department || '').toLowerCase().includes(term) ||
      (s.salaryMonth || '').toLowerCase().includes(term)
    );
  }, [salaries, search]);

  const fmtMonth = (m) => m ? new Date(m + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';
  const fmtMonthFull = (m) => m ? new Date(m + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—';
  const fmtINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtINR0 = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 });

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
          { icon: 'file-invoice', bg: '#dbeafe', color: '#2563eb', value: stats.total, label: 'Total Payslips' },
          { icon: 'circle-check', bg: '#dcfce7', color: '#15803d', value: stats.paid, label: 'Paid' },
          { icon: 'clock', bg: '#fef3c7', color: '#d97706', value: stats.generated, label: 'Pending' },
          { icon: 'indian-rupee-sign', bg: '#fce7f3', color: '#db2777', value: `₹${(stats.totalNet / 1000).toFixed(1)}K`, label: 'Total Net Paid' },
          { icon: 'minus', bg: '#fee2e2', color: '#dc2626', value: `₹${(stats.totalDed / 1000).toFixed(1)}K`, label: 'Total Deductions' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', background: s.bg, color: s.color, flexShrink: 0 }}><i className={`fa-solid fa-${s.icon}`}></i></div>
            <div><h4 style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</h4><p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Payslips Table */}
      <div className="panel">
        <div className="panel-header">
          <h3><i className="fa-solid fa-money-bill-wave" style={{ color: 'var(--primary)' }}></i> Payslips</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-box"><i className="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Search payslips..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><i className="fa-solid fa-plus"></i> Generate Payslip</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            <table className="data-table">
              <thead><tr><th>ID</th><th>Employee</th><th>Department</th><th>Month</th><th>Basic</th><th>Deductions</th><th>Net Amount</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((s, i) => {
                  const initials = (s.employeeName?.split(' ')[0]?.[0] || '') + (s.employeeName?.split(' ')[1]?.[0] || '');
                  const color = avatarColors[i % avatarColors.length];
                  return (
                    <tr key={s._id}>
                      <td>#PAY{String(i + 1).padStart(3, '0')}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: color, flexShrink: 0 }}>{initials.toUpperCase()}</div>
                          <div>
                            <strong style={{ fontSize: '0.82rem', display: 'block' }}>{s.employeeName}</strong>
                            <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.designation || roleDisplay(s.role)}</small>
                          </div>
                        </div>
                      </td>
                      <td>{s.department}</td>
                      <td><strong>{fmtMonth(s.salaryMonth)}</strong></td>
                      <td>{fmtINR0(s.basicAmount)}</td>
                      <td style={{ color: '#dc2626' }}>{fmtINR0(s.deductions)}</td>
                      <td style={{ color: '#15803d', fontWeight: 700 }}>{fmtINR0(s.netAmount)}</td>
                      <td><span className={`badge ${s.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
                      <td style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <button className="action-btn action-view" title="View Payslip" onClick={() => setPayslipModal(s)}><i className="fa-solid fa-eye"></i></button>
                        {s.status !== 'Paid' && <button className="action-btn action-edit" title="Mark Paid" style={{ background: '#dcfce7' }} onClick={() => handleMarkPaid(s._id)}><i className="fa-solid fa-check"></i></button>}
                        <button className="action-btn action-delete" onClick={() => handleDelete(s._id)} title="Delete"><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan="9"><div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}><i className="fa-solid fa-money-bill-wave" style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '10px', display: 'block' }}></i><p>No payslips generated yet.</p></div></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Generate Payslip Modal */}
      {modal && (
        <div className="modal-overlay active" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Generate Payslip</h3><button className="modal-close" onClick={() => setModal(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="form-group">
                <label>Employee</label>
                <select value={form.userId} onChange={(e) => handleEmployeeChange(e.target.value)} required>
                  <option value="">Select Employee</option>
                  {employees.map((e) => <option key={e._id} value={e._id}>{e.firstName ? `${e.firstName} ${e.lastName}` : e.username} ({roleDisplay(e.role)})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Salary Month</label><input type="month" required value={form.salaryMonth} onChange={(e) => setForm({ ...form, salaryMonth: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group">
                  <label>Basic Amount (₹)</label>
                  <input type="number" step="0.01" required value={form.basicAmount} onChange={(e) => setForm({ ...form, basicAmount: e.target.value })} />
                  {form.userId && employees.find((e) => e._id === form.userId)?.salary > 0 && (
                    <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Monthly salary: {fmtINR0(employees.find((e) => e._id === form.userId).salary)}</small>
                  )}
                </div>
                <div className="form-group"><label>Deductions (₹)</label><input type="number" step="0.01" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} required /></div>
              </div>
              <div className="form-group">
                <label>Net Amount (₹)</label>
                <input type="text" readOnly value={fmtINR(netAmount)} style={{ fontWeight: 700, color: '#15803d', background: '#f0fdf4' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleGenerate}><i className="fa-solid fa-save"></i> Generate</button>
            </div>
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      {payslipModal && (
        <div className="modal-overlay active" onClick={() => setPayslipModal(null)}>
          <div className="modal" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payslip #PAY{String(salaries.findIndex((s) => s._id === payslipModal._id) + 1).padStart(3, '0')}</h3>
              <button className="modal-close" onClick={() => setPayslipModal(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body" style={{ padding: 0 }}>
              <div style={{ fontFamily: "'Poppins',sans-serif", padding: '32px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--primary)', paddingBottom: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-graduation-cap" style={{ color: '#fff', fontSize: '1.5rem' }}></i>
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>EduNex College</h2>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>Excellence in Education Since 1995</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Payslip No.</p>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', margin: '2px 0 0' }}>#PAY{String(salaries.findIndex((s) => s._id === payslipModal._id) + 1).padStart(3, '0')}</p>
                  </div>
                </div>

                {/* Employee Info */}
                <div style={{ background: 'var(--bg-light, #f8fafc)', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee Name</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{payslipModal.employeeName}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Designation</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{payslipModal.designation || roleDisplay(payslipModal.role)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pay Period</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{fmtMonthFull(payslipModal.salaryMonth)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</p>
                    <span className={`badge ${payslipModal.status === 'Paid' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.8rem' }}>{payslipModal.status}</span>
                  </div>
                </div>

                {/* Earnings Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, borderRadius: '8px 0 0 0' }}>Earnings</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 600, borderRadius: '0 8px 0 0' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '0.88rem' }}>Basic Salary</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.88rem', textAlign: 'right', fontWeight: 600 }}>{Number(payslipModal.basicAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '0.88rem' }}>Total Earnings</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.88rem', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>{Number(payslipModal.basicAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Deductions Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ background: '#fee2e2', color: '#b91c1c' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, borderRadius: '8px 0 0 0' }}>Deductions</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 600, borderRadius: '0 8px 0 0' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '0.88rem' }}>Total Deductions</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.88rem', textAlign: 'right', fontWeight: 600 }}>{Number(payslipModal.deductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Net Pay Box */}
                <div style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Net Payable Salary</p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: '2px 0 0' }}>In Words: {inWords(Number(payslipModal.netAmount || 0))}</p>
                  </div>
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>{fmtINR(payslipModal.netAmount)}</p>
                </div>

                {/* Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '8px', width: '180px' }}>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Employee Signature</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '2px dashed var(--primary)', paddingTop: '8px', width: '180px' }}>
                      <p style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, margin: 0 }}>Authorised Signatory</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>This is a computer-generated payslip and does not require a physical signature.</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>EduNex College | Contact: info@edunexcollege.edu | www.edunexcollege.edu</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setPayslipModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
