import { useState, useEffect, useMemo } from 'react';
import API from '../../services/api.js';

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Management', 'Sciences', 'Humanities', 'Placements'];
const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Placement Head'];
const avatarColors = ['#2563eb', '#7c3aed', '#db2777', '#d97706', '#15803d', '#0891b2', '#b91c1c', '#4f46e5'];

const roleDisplay = (role) => (role || 'teacher').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const badgeRole = (role) => role === 'admin' ? 'badge-danger' : (role === 'class_teacher' ? 'badge-warning' : 'badge-info');
const badgeStatus = (status) => status === 'Active' ? 'badge-success' : 'badge-warning';

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [profileFaculty, setProfileFaculty] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', department: 'Computer Science', designation: 'Professor',
    email: '', experience: '', phone: '', education: '', role: 'teacher', salary: 0, joiningDate: '',
  });

  const fetchFaculty = async () => {
    setLoading(true);
    try { const { data } = await API.get('/faculty'); setFaculty(data); } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchFaculty(); }, []);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const handleAdd = async () => {
    if (!form.firstName || !form.lastName || !form.email) { showMessage('Please fill required fields', 'error'); return; }
    try {
      await API.post('/faculty', { ...form, salary: Number(form.salary) || 0 });
      showMessage('Faculty and login added successfully!', 'success');
      setModal(false);
      setForm({ firstName: '', lastName: '', department: 'Computer Science', designation: 'Professor', email: '', experience: '', phone: '', education: '', role: 'teacher', salary: 0, joiningDate: '' });
      fetchFaculty();
    } catch (e) { showMessage(e.response?.data?.message || 'Error adding faculty', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this faculty member?')) return;
    try { await API.delete(`/faculty/${id}`); showMessage('Faculty deleted!', 'success'); fetchFaculty(); }
    catch (e) { showMessage('Error deleting faculty', 'error'); }
  };

  const stats = useMemo(() => {
    const total = faculty.length;
    const active = faculty.filter((f) => f.status === 'Active').length;
    const inactive = faculty.filter((f) => f.status !== 'Active').length;
    const depts = new Set(faculty.map((f) => f.department).filter(Boolean)).size;
    const avgSalary = total > 0 ? faculty.reduce((a, f) => a + (f.salary || 0), 0) / total : 0;
    return { total, active, inactive, depts, avgSalary };
  }, [faculty]);

  const deptList = useMemo(() => {
    const map = {};
    faculty.forEach((f) => { if (f.department) map[f.department] = (map[f.department] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [faculty]);

  const filtered = useMemo(() => {
    return faculty.filter((f) => {
      if (deptFilter && f.department !== deptFilter) return false;
      if (!search) return true;
      const text = `${f.firstName} ${f.lastName} ${f.email} ${f.phone || ''} ${f.department || ''}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [faculty, search, deptFilter]);

  return (
    <>
      {msg && (
        <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500, background: msgType === 'success' ? '#dcfce7' : '#fee2e2', color: msgType === 'success' ? '#15803d' : '#dc2626' }}>
          <i className={`fa-solid fa-${msgType === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i> {msg}
        </div>
      )}

      {/* Stats */}
      <div className="fac-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '16px', marginBottom: '25px' }}>
        {[
          { icon: 'users', bg: '#dbeafe', color: '#2563eb', value: stats.total, label: 'Total Faculty' },
          { icon: 'user-check', bg: '#dcfce7', color: '#15803d', value: stats.active, label: 'Active' },
          { icon: 'user-slash', bg: '#fef3c7', color: '#d97706', value: stats.inactive, label: 'Inactive' },
          { icon: 'building', bg: '#ede9fe', color: '#7c3aed', value: stats.depts, label: 'Departments' },
          { icon: 'indian-rupee-sign', bg: '#fce7f3', color: '#db2777', value: `₹${(stats.avgSalary / 1000).toFixed(1)}K`, label: 'Avg Salary' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: s.bg, color: s.color, flexShrink: 0 }}><i className={`fa-solid fa-${s.icon}`}></i></div>
            <div><h4 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--secondary)', margin: 0, lineHeight: 1.2 }}>{s.value}</h4><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Department Filter */}
      <div className="dept-filter" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div className={`dept-chip ${deptFilter === '' ? 'active' : ''}`} onClick={() => setDeptFilter('')} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: deptFilter === '' ? 'var(--primary)' : 'var(--white)', color: deptFilter === '' ? '#fff' : 'var(--secondary)', transition: 'all 0.2s' }}>All Departments</div>
        {deptList.map(([dept, count]) => (
          <div key={dept} className={`dept-chip ${deptFilter === dept ? 'active' : ''}`} onClick={() => setDeptFilter(dept)} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: deptFilter === dept ? 'var(--primary)' : 'var(--white)', color: deptFilter === dept ? '#fff' : 'var(--secondary)', transition: 'all 0.2s' }}>{dept} ({count})</div>
        ))}
      </div>

      {/* Faculty Table */}
      <div className="panel">
        <div className="panel-header">
          <h3>Faculty Members</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-box"><i className="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Search faculty..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><i className="fa-solid fa-plus"></i> Add Faculty</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            <table className="data-table">
              <thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Role</th><th>Experience</th><th>Salary</th><th>Joining Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((f, i) => {
                  const initials = ((f.firstName?.[0] || '') + (f.lastName?.[0] || '')).toUpperCase();
                  const color = avatarColors[i % avatarColors.length];
                  return (
                    <tr key={f._id}>
                      <td>#FAC{String(i + 1).padStart(2, '0')}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff', background: color, flexShrink: 0 }}>{initials}</div>
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.85rem' }}>{f.firstName} {f.lastName}</strong>
                            <small style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.email}</small>
                            <small style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.phone || '—'}</small>
                          </div>
                        </div>
                      </td>
                      <td>{f.department}</td>
                      <td>{f.designation}</td>
                      <td><span className={`badge ${badgeRole(f.role)}`}>{roleDisplay(f.role)}</span></td>
                      <td>{f.experience || 0} yrs</td>
                      <td style={{ fontWeight: 600 }}>₹{Number(f.salary || 0).toLocaleString('en-IN')}</td>
                      <td>{f.joiningDate ? new Date(f.joiningDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</td>
                      <td><span className={`badge ${badgeStatus(f.status)}`}>{f.status}</span></td>
                      <td style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <button className="action-btn action-view" title="View Profile" onClick={() => setProfileFaculty(f)}><i className="fa-solid fa-eye"></i></button>
                        <button className="action-btn action-delete" onClick={() => handleDelete(f._id)} title="Delete"><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan="10" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No faculty found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Faculty Modal */}
      {modal && (
        <div className="modal-overlay active" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Faculty</h3>
              <button className="modal-close" onClick={() => setModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>First Name</label><input type="text" placeholder="Enter first name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                <div className="form-group"><label>Last Name</label><input type="text" placeholder="Enter last name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Department</label><select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>{departments.map((d) => <option key={d}>{d}</option>)}</select></div>
                <div className="form-group"><label>Designation</label><select value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}>{designations.map((d) => <option key={d}>{d}</option>)}</select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Role</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="teacher">Teacher</option><option value="class_teacher">Class Teacher</option><option value="admin">Admin</option></select></div>
                <div className="form-group"><label>Salary (₹)</label><input type="number" step="0.01" placeholder="e.g. 50000" required value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Email</label><input type="email" placeholder="Enter email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label>Education</label><input type="text" placeholder="e.g. Ph.D. in Computer Science" required value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Experience (Years)</label><input type="number" placeholder="e.g. 10" min="0" required value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></div>
                <div className="form-group"><label>Phone</label><input type="tel" placeholder="Enter phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="form-group"><label>Joining Date</label><input type="date" required value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleAdd}>Add Faculty</button>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Profile Modal */}
      {profileFaculty && (
        <div className="modal-overlay active" onClick={() => setProfileFaculty(null)}>
          <div className="modal" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-user-tie"></i> Faculty Profile</h3>
              <button className="modal-close" onClick={() => setProfileFaculty(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              {(() => {
                const f = profileFaculty;
                const idx = faculty.findIndex((x) => x._id === f._id);
                const initials = ((f.firstName?.[0] || '') + (f.lastName?.[0] || '')).toUpperCase();
                const color = avatarColors[idx % avatarColors.length];
                const joinDate = f.joiningDate ? new Date(f.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                return (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff', background: color, margin: '0 auto 12px' }}>{initials}</div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{f.firstName} {f.lastName}</h2>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>{f.designation} &middot; {f.department}</p>
                      <div style={{ marginTop: '8px' }}>
                        <span className={`badge ${badgeRole(f.role)}`} style={{ marginRight: '6px' }}>{roleDisplay(f.role)}</span>
                        <span className={`badge ${badgeStatus(f.status)}`}>{f.status}</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem' }}>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: '4px' }}><i className="fa-solid fa-envelope"></i> Email</div>
                        <strong>{f.email}</strong>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: '4px' }}><i className="fa-solid fa-phone"></i> Phone</div>
                        <strong>{f.phone || '—'}</strong>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: '4px' }}><i className="fa-solid fa-graduation-cap"></i> Education</div>
                        <strong>{f.education || '—'}</strong>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: '4px' }}><i className="fa-solid fa-briefcase"></i> Experience</div>
                        <strong>{f.experience || 0} Years</strong>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: '4px' }}><i className="fa-solid fa-indian-rupee-sign"></i> Salary</div>
                        <strong style={{ color: '#15803d' }}>₹{Number(f.salary || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</strong>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: '4px' }}><i className="fa-solid fa-calendar"></i> Joining Date</div>
                        <strong>{joinDate}</strong>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setProfileFaculty(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
