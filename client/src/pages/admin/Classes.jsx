import { useState, useEffect, useMemo } from 'react';
import API from '../../services/api.js';

const avatarColors = ['#2563eb', '#7c3aed', '#db2777', '#d97706', '#15803d', '#0891b2', '#b91c1c', '#4f46e5'];

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  const [classModal, setClassModal] = useState(false);
  const [editClassModal, setEditClassModal] = useState(null);
  const [sectionModal, setSectionModal] = useState(false);
  const [editSectionModal, setEditSectionModal] = useState(null);

  const [classForm, setClassForm] = useState({ name: '', department: '', status: 'Active' });
  const [sectionForm, setSectionForm] = useState({ classId: '', name: '', classTeacherUserId: '', status: 'Active' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clsRes, secRes, stuRes, facRes, teaRes] = await Promise.all([
        API.get('/classes'),
        API.get('/classes/sections'),
        API.get('/students'),
        API.get('/faculty'),
        API.get('/classes/teachers'),
      ]);
      setClasses(clsRes.data);
      setAllSections(secRes.data);
      setStudents(stuRes.data);
      setFaculty(facRes.data);
      setTeachers(teaRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const handleAddClass = async () => {
    if (!classForm.name) { showMessage('Class name required', 'error'); return; }
    try {
      await API.post('/classes', classForm);
      showMessage('Class added successfully!', 'success');
      setClassModal(false);
      setClassForm({ name: '', department: '', status: 'Active' });
      fetchData();
    } catch (e) { showMessage('Error adding class', 'error'); }
  };

  const handleEditClass = async () => {
    if (!editClassModal?.name) { showMessage('Class name required', 'error'); return; }
    try {
      await API.put(`/classes/${editClassModal._id}`, { name: editClassModal.name, department: editClassModal.department, status: editClassModal.status });
      showMessage('Class updated successfully!', 'success');
      setEditClassModal(null);
      fetchData();
    } catch (e) { showMessage('Error updating class', 'error'); }
  };

  const handleDeleteClass = async (id) => {
    if (!confirm('Delete this class and all its sections? Students will be unassigned.')) return;
    try { await API.delete(`/classes/${id}`); showMessage('Class and its sections deleted!', 'success'); fetchData(); }
    catch (e) { showMessage('Error deleting class', 'error'); }
  };

  const handleAddSection = async () => {
    if (!sectionForm.classId || !sectionForm.name) { showMessage('Section name required', 'error'); return; }
    try {
      await API.post('/classes/sections', sectionForm);
      showMessage('Section added successfully!', 'success');
      setSectionModal(false);
      setSectionForm({ classId: '', name: '', classTeacherUserId: '', status: 'Active' });
      fetchData();
    } catch (e) { showMessage('Error adding section', 'error'); }
  };

  const handleEditSection = async () => {
    if (!editSectionModal?.name) { showMessage('Section name required', 'error'); return; }
    try {
      await API.put(`/classes/sections/${editSectionModal._id}`, {
        name: editSectionModal.name,
        classTeacherUserId: editSectionModal.classTeacherUserId || null,
        status: editSectionModal.status,
      });
      showMessage('Section updated successfully!', 'success');
      setEditSectionModal(null);
      fetchData();
    } catch (e) { showMessage('Error updating section', 'error'); }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Delete this section? Students will be unassigned.')) return;
    try { await API.delete(`/classes/sections/${sectionId}`); showMessage('Section deleted!', 'success'); fetchData(); }
    catch (e) { showMessage('Error deleting section', 'error'); }
  };

  const stats = useMemo(() => {
    const totalClasses = classes.length;
    const activeClasses = classes.filter((c) => c.status === 'Active').length;
    const totalSections = allSections.length;
    const assignedStudents = students.filter((s) => s.classId).length;
    const totalFaculty = faculty.filter((f) => f.status === 'Active').length;
    return { totalClasses, activeClasses, totalSections, assignedStudents, totalFaculty };
  }, [classes, allSections, students, faculty]);

  const filtered = useMemo(() => {
    if (!search) return classes;
    return classes.filter((c) => `${c.name} ${c.department}`.toLowerCase().includes(search.toLowerCase()));
  }, [classes, search]);

  const teacherLabel = (t) => t.firstName ? `${t.firstName} ${t.lastName} (${t.department})` : `${t.username} (${t.department || ''})`;
  const sectionTeacherName = (sec) => {
    if (sec.firstName) return `${sec.firstName} ${sec.lastName}`;
    return sec.teacherName || 'Not assigned';
  };

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
          { icon: 'building', bg: '#dbeafe', color: '#2563eb', value: stats.totalClasses, label: 'Total Classes' },
          { icon: 'layer-group', bg: '#dcfce7', color: '#15803d', value: stats.totalSections, label: 'Total Sections' },
          { icon: 'user-graduate', bg: '#fef3c7', color: '#d97706', value: stats.assignedStudents, label: 'Assigned Students' },
          { icon: 'chalkboard-user', bg: '#ede9fe', color: '#7c3aed', value: stats.totalFaculty, label: 'Active Faculty' },
          { icon: 'circle-check', bg: '#fce7f3', color: '#db2777', value: stats.activeClasses, label: 'Active Classes' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', background: s.bg, color: s.color, flexShrink: 0 }}><i className={`fa-solid fa-${s.icon}`}></i></div>
            <div><h4 style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</h4><p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Classes & Sections Panel */}
      <div className="panel">
        <div className="panel-header">
          <h3><i className="fa-solid fa-building" style={{ color: 'var(--primary)' }}></i> Classes & Sections</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-box"><i className="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Search classes..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setClassModal(true)}><i className="fa-solid fa-plus"></i> New Class</button>
          </div>
        </div>
        <div className="panel-body">
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            filtered.map((c, i) => {
              const color = avatarColors[i % avatarColors.length];
              const initials = c.name?.slice(0, 2).toUpperCase() || '';
              const sections = c.sections || [];
              return (
                <div key={c._id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '16px', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#fff', background: color, flexShrink: 0 }}>{initials}</div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{c.name}</h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 0' }}><i className="fa-solid fa-building"></i> {c.department}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span>
                      <button className="action-btn action-edit" title="Edit Class" onClick={() => setEditClassModal(c)}><i className="fa-solid fa-pen"></i></button>
                      <button className="action-btn action-delete" title="Delete Class" onClick={() => handleDeleteClass(c._id)}><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fa-solid fa-layer-group"></i> Sections: <strong style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>{sections.length}</strong></div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fa-solid fa-user-graduate"></i> Students: <strong style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>{c.studentCount || 0}</strong></div>
                  </div>
                  {sections.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                      {sections.map((sec) => (
                        <span key={sec._id} className="sec-pill" title={`Teacher: ${sectionTeacherName(sec)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, margin: '4px 4px 4px 0' }}>
                          Section {sec.name}
                          <span style={{ background: 'var(--primary)', color: '#fff', padding: '1px 7px', borderRadius: '10px', fontSize: '0.68rem' }}>{sec.studentCount || 0}</span>
                          <button type="button" onClick={() => setEditSectionModal(sec)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.7rem', padding: 0 }} title="Edit Section"><i className="fa-solid fa-pen"></i></button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      No sections yet. <button onClick={() => { setSectionForm({ classId: c._id, name: '', classTeacherUserId: '', status: 'Active' }); setSectionModal(true); }} style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' }}>Add one →</button>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {!loading && filtered.length === 0 && <div className="empty-state"><i className="fa-solid fa-building"></i><p>No classes found</p></div>}
        </div>
      </div>

      {/* All Sections Table */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-header">
          <h3><i className="fa-solid fa-layer-group" style={{ color: 'var(--primary)' }}></i> All Sections</h3>
          <button className="btn btn-primary btn-sm" onClick={() => { setSectionForm({ classId: '', name: '', classTeacherUserId: '', status: 'Active' }); setSectionModal(true); }}><i className="fa-solid fa-plus"></i> New Section</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Class</th><th>Section</th><th>Class Teacher</th><th>Students</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {allSections.map((s, i) => (
                <tr key={s._id}>
                  <td>#SEC{String(i + 1).padStart(3, '0')}</td>
                  <td><strong>{s.className}</strong><br /><small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{s.classDept}</small></td>
                  <td><span className="sec-pill" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>Section {s.name}</span></td>
                  <td>
                    {s.teacherName || s.firstName ? (
                      <><strong>{sectionTeacherName(s)}</strong></>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Not assigned</span>
                    )}
                  </td>
                  <td><strong>{s.studentCount || 0}</strong></td>
                  <td><span className={`badge ${s.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
                  <td style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <button className="action-btn action-edit" title="Edit Section" onClick={() => setEditSectionModal(s)}><i className="fa-solid fa-pen"></i></button>
                    <button className="action-btn action-delete" title="Delete Section" onClick={() => handleDeleteSection(s._id)}><i className="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              ))}
              {allSections.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sections found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Class Modal */}
      {classModal && (
        <div className="modal-overlay active" onClick={() => setClassModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Add New Class</h3><button className="modal-close" onClick={() => setClassModal(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Class Name</label><input type="text" placeholder="e.g. B.Tech CSE" required value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} /></div>
              <div className="form-group"><label>Department</label><input type="text" placeholder="e.g. Computer Science & Engineering" value={classForm.department} onChange={(e) => setClassForm({ ...classForm, department: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setClassModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddClass}><i className="fa-solid fa-save"></i> Save Class</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {editClassModal && (
        <div className="modal-overlay active" onClick={() => setEditClassModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Edit Class</h3><button className="modal-close" onClick={() => setEditClassModal(null)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Class Name</label><input type="text" required value={editClassModal.name} onChange={(e) => setEditClassModal({ ...editClassModal, name: e.target.value })} /></div>
              <div className="form-group"><label>Department</label><input type="text" value={editClassModal.department || ''} onChange={(e) => setEditClassModal({ ...editClassModal, department: e.target.value })} /></div>
              <div className="form-group"><label>Status</label><select value={editClassModal.status} onChange={(e) => setEditClassModal({ ...editClassModal, status: e.target.value })}><option>Active</option><option>Inactive</option></select></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditClassModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEditClass}><i className="fa-solid fa-save"></i> Update Class</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {sectionModal && (
        <div className="modal-overlay active" onClick={() => setSectionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Add New Section</h3><button className="modal-close" onClick={() => setSectionModal(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="form-group">
                <label>Class</label>
                <select value={sectionForm.classId} onChange={(e) => setSectionForm({ ...sectionForm, classId: e.target.value })} required>
                  <option value="">Select Class</option>
                  {classes.filter((c) => c.status === 'Active').map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Section Name</label><input type="text" placeholder="e.g. A" required value={sectionForm.name} onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })} /></div>
              <div className="form-group">
                <label>Class Teacher</label>
                <select value={sectionForm.classTeacherUserId} onChange={(e) => setSectionForm({ ...sectionForm, classTeacherUserId: e.target.value })}>
                  <option value="">No Teacher Assigned</option>
                  {teachers.map((t) => <option key={t._id} value={t._id}>{teacherLabel(t)}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSectionModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddSection}><i className="fa-solid fa-save"></i> Save Section</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {editSectionModal && (
        <div className="modal-overlay active" onClick={() => setEditSectionModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Edit Section</h3><button className="modal-close" onClick={() => setEditSectionModal(null)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Section Name</label><input type="text" required value={editSectionModal.name} onChange={(e) => setEditSectionModal({ ...editSectionModal, name: e.target.value })} /></div>
              <div className="form-group">
                <label>Class Teacher</label>
                <select value={editSectionModal.classTeacherUserId || ''} onChange={(e) => setEditSectionModal({ ...editSectionModal, classTeacherUserId: e.target.value })}>
                  <option value="">No Teacher Assigned</option>
                  {teachers.map((t) => <option key={t._id} value={t._id}>{teacherLabel(t)}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Status</label><select value={editSectionModal.status} onChange={(e) => setEditSectionModal({ ...editSectionModal, status: e.target.value })}><option>Active</option><option>Inactive</option></select></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditSectionModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEditSection}><i className="fa-solid fa-save"></i> Update Section</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
