import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api.js';

const years = ['1st Year', '2nd Year', '3rd Year', 'Final Year'];
const courses = ['B.Tech CSE', 'B.Tech ECE', 'BCA', 'MBA', 'MCA', 'B.Sc', 'Diploma'];

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [activeYear, setActiveYear] = useState(0);
  const [modal, setModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', course: 'B.Tech CSE', year: '1st Year',
    phone: '', dob: '', gender: 'Male', classId: '', sectionId: '', rollNumber: '',
    parentName: '', parentPhone: '', parentEmail: '', address: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, clsRes, secRes] = await Promise.all([API.get('/students'), API.get('/classes'), API.get('/classes/sections')]);
      setStudents(stuRes.data);
      setClasses(clsRes.data);
      setSections(secRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const handleAdd = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.course) {
      showMessage('Please fill in all required fields.', 'error');
      return;
    }
    try {
      await API.post('/students', form);
      showMessage('Student added successfully!', 'success');
      setModal(false);
      setForm({ firstName: '', lastName: '', email: '', course: 'B.Tech CSE', year: '1st Year', phone: '', dob: '', gender: 'Male', classId: '', sectionId: '', rollNumber: '', parentName: '', parentPhone: '', parentEmail: '', address: '' });
      fetchData();
    } catch (e) {
      showMessage(e.response?.data?.message || 'Error adding student', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try {
      await API.delete(`/students/${id}`);
      showMessage('Student deleted successfully!', 'success');
      fetchData();
    } catch (e) { showMessage('Error deleting student', 'error'); }
  };

  // Group students by year and course
  const studentsByYear = useMemo(() => {
    const grouped = {};
    years.forEach((yr) => { grouped[yr] = {}; });
    students.forEach((s) => {
      const yr = s.year || '1st Year';
      if (!grouped[yr]) grouped[yr] = {};
      const crs = s.course || 'Unknown';
      if (!grouped[yr][crs]) grouped[yr][crs] = [];
      grouped[yr][crs].push(s);
    });
    return grouped;
  }, [students]);

  // Filter students within active year
  const filteredByYear = useMemo(() => {
    const yr = years[activeYear];
    const yearData = studentsByYear[yr] || {};
    const result = {};
    Object.entries(yearData).forEach(([crs, stuList]) => {
      if (courseFilter && crs !== courseFilter) return;
      const filtered = stuList.filter((s) => {
        if (!search) return true;
        const text = `${s.firstName} ${s.lastName} ${s.email} ${s.phone || ''} ${s.rollNumber || ''} ${s.parentName || ''}`.toLowerCase();
        return text.includes(search.toLowerCase());
      });
      if (filtered.length > 0) result[crs] = filtered;
    });
    return result;
  }, [studentsByYear, activeYear, search, courseFilter]);

  const className = (id) => classes.find((c) => c._id === id)?.name || '—';
  const sectionName = (id) => sections.find((s) => s._id === id)?.name || '—';

  // Distinct courses from actual student data (matches PHP's SELECT DISTINCT course)
  const distinctCourses = useMemo(() => {
    const set = new Set(students.map((s) => s.course).filter(Boolean));
    return Array.from(set).sort();
  }, [students]);

  const badgeClass = (status) => {
    if (status === 'Active') return 'badge-success';
    if (status === 'Suspended') return 'badge-warning';
    return 'badge-danger';
  };

  const stuId = (s) => {
    const num = s._id ? s._id.toString().replace(/\D/g, '').slice(-6) : '000';
    return '#STU' + String(num).padStart(3, '0');
  };

  return (
    <>
      {msg && (
        <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500, background: msgType === 'success' ? '#dcfce7' : '#fee2e2', color: msgType === 'success' ? '#15803d' : '#dc2626' }}>
          <i className={`fa-solid fa-${msgType === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i> {msg}
        </div>
      )}

      <div className="top-action-bar">
        <div className="left-controls">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="course-filter" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="">All Courses</option>
            {distinctCourses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><i className="fa-solid fa-plus"></i> Add Student</button>
      </div>

      <div className="year-tabs">
        {years.map((yr, idx) => {
          const count = studentsByYear[yr] ? Object.values(studentsByYear[yr]).reduce((a, b) => a + b.length, 0) : 0;
          return (
            <button key={yr} className={`year-tab ${activeYear === idx ? 'active' : ''}`} onClick={() => setActiveYear(idx)}>
              {yr} <span className="count">{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i><p>Loading students...</p></div>
      ) : Object.keys(filteredByYear).length === 0 ? (
        <div className="panel"><div className="panel-body" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-user-graduate" style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.3 }}></i>
          <p>No students in {years[activeYear]}</p>
        </div></div>
      ) : (
        Object.entries(filteredByYear).map(([crs, stuList]) => (
          <div className="branch-section" key={crs}>
            <div className="branch-header">
              <i className="fa-solid fa-book"></i>
              <h4>{crs}</h4>
              <span className="branch-count">{stuList.length} students</span>
            </div>
            <div className="panel">
              <table className="data-table">
                <thead>
                  <tr><th>ID</th><th>Roll</th><th>Name</th><th>Email</th><th>Phone</th><th>Class</th><th>Section</th><th>Parent</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {stuList.map((s) => (
                    <tr key={s._id}>
                      <td>{stuId(s)}</td>
                      <td><Link to={`/admin/students/${s._id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{s.rollNumber || 'View'}</Link></td>
                      <td>{s.firstName} {s.lastName}</td>
                      <td>{s.email}</td>
                      <td>{s.phone || '—'}</td>
                      <td>{className(s.classId)}</td>
                      <td>{sectionName(s.sectionId)}</td>
                      <td>{s.parentName || '—'}</td>
                      <td><span className={`badge ${badgeClass(s.status)}`}>{s.status}</span></td>
                      <td>
                        <Link to={`/admin/students/${s._id}`} className="action-btn action-view" title="View Profile"><i className="fa-solid fa-eye"></i></Link>
                        <button className="action-btn action-delete" onClick={() => handleDelete(s._id)} title="Delete"><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {modal && (
        <div className="modal-overlay active" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Student</h3>
              <button className="modal-close" onClick={() => setModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>First Name</label><input type="text" placeholder="Enter first name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                <div className="form-group"><label>Last Name</label><input type="text" placeholder="Enter last name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Email</label><input type="email" placeholder="Enter email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group">
                  <label>Course</label>
                  <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                    {courses.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                    {years.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>DOB</label><input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Class</label>
                  <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
                    <option value="">Select Class</option>
                    {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <select value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })}>
                    <option value="">Select Section</option>
                    {sections.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Roll Number</label><input type="text" placeholder="e.g. 101" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group"><label>Phone</label><input type="tel" placeholder="Enter phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Parent Name</label><input type="text" placeholder="Parent/Guardian name" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Parent Phone</label><input type="tel" placeholder="Parent phone" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} /></div>
                <div className="form-group"><label>Parent Email</label><input type="email" placeholder="Parent email" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Address</label><textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleAdd}>Add Student</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
