import { useState, useEffect } from 'react';
import API from '../../services/api.js';

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [form, setForm] = useState({ name: '', examType: 'Internal', classId: '', subject: '', examDate: '', maxMarks: 100 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [exRes, clsRes] = await Promise.all([API.get('/exams'), API.get('/classes')]);
      setExams(exRes.data);
      setClasses(clsRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const showMessage = (m, t) => { setMsg(m); setMsgType(t); setTimeout(() => { setMsg(''); setMsgType(''); }, 4000); };

  const handleAdd = async () => {
    if (!form.name || !form.classId || !form.examDate) { showMessage('Please fill required fields', 'error'); return; }
    try { await API.post('/exams', form); showMessage('Exam added!', 'success'); setModal(false); fetchData(); }
    catch (e) { showMessage('Error adding exam', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this exam and all its results?')) return;
    try { await API.delete(`/exams/${id}`); showMessage('Exam deleted!', 'success'); fetchData(); }
    catch (e) { showMessage('Error deleting', 'error'); }
  };

  const className = (id) => classes.find((c) => c._id === id)?.name || '—';
  const examTypeClass = (t) => `exam-type-${t}`;
  const examStatusClass = (s) => `exam-status-${s}`;

  return (
    <>
      {msg && (
        <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500, background: msgType === 'success' ? '#dcfce7' : '#fee2e2', color: msgType === 'success' ? '#15803d' : '#dc2626' }}>
          <i className={`fa-solid fa-${msgType === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i> {msg}
        </div>
      )}

      <style>{`
        .exam-card { background:#fff; border:1px solid var(--border); border-radius:14px; padding:0; overflow:hidden; transition:all 0.2s; margin-bottom:16px; }
        .exam-card:hover { box-shadow:0 4px 16px rgba(0,0,0,0.08); transform:translateY(-2px); }
        .exam-card-top { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; }
        .exam-card-top .ec-left { display:flex; align-items:center; gap:14px; }
        .exam-card-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; color:#fff; flex-shrink:0; }
        .exam-card-info h4 { font-size:0.95rem; font-weight:700; color:var(--secondary); margin-bottom:2px; }
        .exam-card-info p { font-size:0.78rem; color:var(--text-muted); }
        .exam-card-badges { display:flex; gap:8px; flex-wrap:wrap; }
        .exam-type-badge { padding:3px 10px; border-radius:50px; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
        .exam-type-Internal { background:#dbeafe; color:#1d4ed8; }
        .exam-type-External { background:#fce7f3; color:#be185d; }
        .exam-type-Mid { background:#fef3c7; color:#b45309; }
        .exam-type-Final { background:#dcfce7; color:#15803d; }
        .exam-status-badge { padding:3px 10px; border-radius:50px; font-size:0.7rem; font-weight:700; }
        .exam-status-Scheduled { background:#f1f5f9; color:#64748b; }
        .exam-status-Completed { background:#fef3c7; color:#b45309; }
        .exam-status-Published { background:#dcfce7; color:#15803d; }
        .exam-card-meta { display:flex; gap:20px; padding:12px 20px; background:#f8fafc; border-top:1px solid var(--border); font-size:0.78rem; flex-wrap:wrap; }
        .exam-card-meta .ecm-item { display:flex; align-items:center; gap:6px; color:var(--text-muted); }
        .exam-card-meta .ecm-item i { font-size:0.85rem; }
        .exam-card-meta .ecm-item strong { color:var(--secondary); }
        .exam-card-actions { display:flex; gap:8px; padding:12px 20px; border-top:1px solid var(--border); }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}><i className="fa-solid fa-clipboard-list" style={{ color: 'var(--primary)' }}></i> Exams & Results</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><i className="fa-solid fa-plus"></i> New Exam</button>
      </div>

      {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
        exams.length === 0 ? <div className="empty-state"><i className="fa-solid fa-clipboard-list"></i><p>No exams created yet.</p></div> :
        exams.map((ex, i) => (
          <div className="exam-card" key={ex._id}>
            <div className="exam-card-top">
              <div className="ec-left">
                <div className="exam-card-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}><i className="fa-solid fa-clipboard-list"></i></div>
                <div className="exam-card-info">
                  <h4>{ex.name}</h4>
                  <p>{ex.subject} · {className(ex.classId)}</p>
                </div>
              </div>
              <div className="exam-card-badges">
                <span className={`exam-type-badge ${examTypeClass(ex.examType)}`}>{ex.examType}</span>
                <span className={`exam-status-badge ${examStatusClass(ex.status || 'Scheduled')}`}>{ex.status || 'Scheduled'}</span>
              </div>
            </div>
            <div className="exam-card-meta">
              <div className="ecm-item"><i className="fa-solid fa-calendar"></i> <strong>{ex.examDate ? new Date(ex.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</strong></div>
              <div className="ecm-item"><i className="fa-solid fa-star"></i> Max: <strong>{ex.maxMarks}</strong></div>
            </div>
            <div className="exam-card-actions">
              <button className="action-btn action-delete" onClick={() => handleDelete(ex._id)} title="Delete"><i className="fa-solid fa-trash"></i></button>
            </div>
          </div>
        ))
      )}

      {modal && (
        <div className="modal-overlay active" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>New Exam</h3><button className="modal-close" onClick={() => setModal(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Exam Name</label><input type="text" placeholder="e.g. Mid Term 2024" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Exam Type</label><select value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}><option>Internal</option><option>External</option><option>Mid</option><option>Final</option></select></div>
                <div className="form-group"><label>Class</label><select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} required><option value="">Select Class</option>{classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Subject</label><input type="text" placeholder="e.g. Mathematics" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
                <div className="form-group"><label>Exam Date</label><input type="date" required value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Max Marks</label><input type="number" placeholder="e.g. 100" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Exam</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
