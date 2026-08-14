import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../services/api.js';

export default function FacultyPanel() {
  const { activeTab, setActiveTab } = useOutletContext() || { activeTab: 'dashboard', setActiveTab: () => {} };
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [calMonth, setCalMonth] = useState(new Date().toISOString().slice(0, 7));
  const [notices, setNotices] = useState([]);
  const [students, setStudents] = useState([]);
  const [attMsg, setAttMsg] = useState('');
  const [attMsgType, setAttMsgType] = useState('');
  const [myRequests, setMyRequests] = useState([]);
  const [corrForm, setCorrForm] = useState({ requestDate: '', requestedStatus: 'Present', checkIn: '09:00', checkOut: '17:00', reason: '' });
  const [selectedDay, setSelectedDay] = useState(null);
  const [attGrid, setAttGrid] = useState(null);
  const [attCourse, setAttCourse] = useState('');
  const [attYear, setAttYear] = useState('');
  const [attMonth, setAttMonth] = useState(new Date().toISOString().slice(0, 7));
  const [marksStudents, setMarksStudents] = useState([]);
  const [marksCourse, setMarksCourse] = useState('');
  const [marksYear, setMarksYear] = useState('');
  const [marksForm, setMarksForm] = useState({ subject: '', testName: '', testDate: new Date().toISOString().slice(0, 10), maxMarks: 100 });
  const [marksValues, setMarksValues] = useState({});
  const [marksMsg, setMarksMsg] = useState('');
  const [marksMsgType, setMarksMsgType] = useState('');
  const [testsData, setTestsData] = useState({ tests: [], stats: { total: 0, upcoming: 0, done: 0 } });
  const [testForm, setTestForm] = useState({ subject: '', testName: '', course: '', year: '1st Year', testDate: new Date().toISOString().slice(0, 10), maxMarks: 100, description: '' });
  const [testMsg, setTestMsg] = useState('');
  const [testMsgType, setTestMsgType] = useState('');

  const showAttMsg = (m, t) => { setAttMsg(m); setAttMsgType(t); setTimeout(() => { setAttMsg(''); setAttMsgType(''); }, 5000); };

  const fetchCalendar = () => {
    if (user?.id) API.get(`/staff-attendance/faculty/${user.id}/calendar?month=${calMonth}`).then(({ data }) => setCalendar(data)).catch(() => {});
  };

  useEffect(() => {
    if (user?.id) API.get(`/dashboard/faculty/${user.entityId || user.id}`).then(({ data }) => setDashData(data)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (activeTab === 'myattendance' && user?.id) {
      fetchCalendar();
      API.get('/corrections/mine').then(({ data }) => setMyRequests(data.slice(0, 8))).catch(() => setMyRequests([]));
    }
    if (activeTab === 'notices') {
      API.get('/notices').then(({ data }) => setNotices(data.filter(n => n.targetRole === 'all' || n.targetRole === 'teacher'))).catch(() => {});
    }
    if (activeTab === 'mystudents') {
      API.get('/students').then(({ data }) => setStudents(data)).catch(() => {});
    }
    if (activeTab === 'attendance') {
      const params = new URLSearchParams();
      if (attCourse) params.set('course', attCourse);
      if (attYear) params.set('year', attYear);
      params.set('month', attMonth);
      API.get(`/attendance/faculty/grid?${params}`).then(({ data }) => setAttGrid(data)).catch(() => {});
    }
    if (activeTab === 'marks') {
      // Always fetch all students first (for course dropdown population), PHP shows all by default
      API.get('/students').then(({ data }) => {
        setMarksStudents(data);
        const vals = {};
        data.forEach((s) => { vals[s._id] = 0; });
        setMarksValues(vals);
      }).catch(() => {});
    }
    if (activeTab === 'tests') {
      API.get('/tests/mine').then(({ data }) => setTestsData(data)).catch(() => {});
    }
  }, [activeTab, user, calMonth, attCourse, attYear, attMonth]);

  const handleCheckIn = async () => {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    if (mins < 540 || mins > 600) {
      showAttMsg(`Check-In is only allowed between 9:00 AM and 10:00 AM. Current time: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}. If you missed the window, please submit a correction request.`, 'error');
      return;
    }
    try { const { data } = await API.post('/staff-attendance/checkin'); showAttMsg(data.message, 'success'); fetchCalendar(); }
    catch (e) { showAttMsg(e.response?.data?.message || 'Error', 'error'); }
  };

  const handleCheckOut = async () => {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    if (mins < 960 || mins > 1020) {
      showAttMsg(`Check-Out is only allowed between 4:00 PM and 5:00 PM. Current time: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}. If you missed the window, please submit a correction request.`, 'error');
      return;
    }
    try { const { data } = await API.post('/staff-attendance/checkout'); showAttMsg(data.message, 'success'); fetchCalendar(); }
    catch (e) { showAttMsg(e.response?.data?.message || 'Error', 'error'); }
  };

  const handleHalfDay = async () => {
    if (!confirm('Mark today as Half Day?')) return;
    try { const { data } = await API.post('/staff-attendance/halfday'); showAttMsg(data.message, 'success'); fetchCalendar(); }
    catch (e) { showAttMsg(e.response?.data?.message || 'Error', 'error'); }
  };

  const submitCorrection = async () => {
    if (!corrForm.requestDate || !corrForm.reason) { showAttMsg('Please fill date and reason', 'error'); return; }
    try {
      await API.post('/corrections', corrForm);
      showAttMsg('Attendance correction request has been sent to the management team.', 'success');
      setCorrForm({ requestDate: '', requestedStatus: 'Present', checkIn: '09:00', checkOut: '17:00', reason: '' });
      API.get('/corrections/mine').then(({ data }) => setMyRequests(data.slice(0, 8))).catch(() => {});
    } catch (e) { showAttMsg(e.response?.data?.message || 'Error submitting request', 'error'); }
  };

  const showMarksMsg = (m, t) => { setMarksMsg(m); setMarksMsgType(t); setTimeout(() => { setMarksMsg(''); setMarksMsgType(''); }, 5000); };

  const saveMarks = async () => {
    if (!marksForm.subject || !marksForm.testName) { showMarksMsg('Please fill subject and test name', 'error'); return; }
    const marksArr = marksStudents.map((s) => ({ studentId: s._id, obtained: Number(marksValues[s._id] || 0) }));
    try {
      const { data } = await API.post('/marks/batch', { ...marksForm, marks: marksArr });
      showMarksMsg(data.message, 'success');
    } catch (e) { showMarksMsg(e.response?.data?.message || 'Error saving marks', 'error'); }
  };

  const showTestMsg = (m, t) => { setTestMsg(m); setTestMsgType(t); setTimeout(() => { setTestMsg(''); setTestMsgType(''); }, 5000); };

  const scheduleTest = async () => {
    if (!testForm.subject || !testForm.testName || !testForm.course) { showTestMsg('Please fill all required fields', 'error'); return; }
    try {
      await API.post('/tests', testForm);
      showTestMsg(`Test scheduled: ${testForm.testName} (${testForm.subject}) on ${new Date(testForm.testDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 'success');
      setTestForm({ subject: '', testName: '', course: '', year: '1st Year', testDate: new Date().toISOString().slice(0, 10), maxMarks: 100, description: '' });
      API.get('/tests/mine').then(({ data }) => setTestsData(data)).catch(() => {});
    } catch (e) { showTestMsg(e.response?.data?.message || 'Error scheduling test', 'error'); }
  };

  const deleteTest = async (id) => {
    if (!confirm('Delete this test?')) return;
    try { await API.delete(`/tests/${id}`); showTestMsg('Test deleted', 'success'); API.get('/tests/mine').then(({ data }) => setTestsData(data)).catch(() => {}); }
    catch (e) { showTestMsg('Error deleting test', 'error'); }
  };

  const s = dashData?.stats || {};
  const today = new Date().toISOString().slice(0, 10);
  const todayStatus = calendar?.calendar?.[today] || s.todayStatus || 'Not Marked';
  const monthLabel = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const attPct = s.attPct || 0;

  return (
    <>
      {activeTab === 'dashboard' && (
        <>
          {/* Welcome Banner */}
          <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', borderRadius: '16px', padding: '30px', marginBottom: '30px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Welcome, {user?.facultyName?.split(' ')[0] || user?.username}!</h2>
              <p style={{ fontSize: '0.9rem', opacity: 0.9, margin: '4px 0 0' }}>Department: <strong>{user?.facultyDept || ''}</strong> | Manage attendance, marks & tests</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {dashData?.subjects?.length > 0 ? dashData.subjects.map((subj) => (
                <span key={subj} style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: '50px', fontSize: '0.82rem', fontWeight: 600 }}><i className="fa-solid fa-book" style={{ marginRight: '6px' }}></i>{subj}</span>
              )) : (
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600 }}><i className="fa-solid fa-building" style={{ marginRight: '6px' }}></i>{user?.facultyDept || 'Faculty'}</span>
              )}
            </div>
          </div>

          {/* First Row: 4 stat cards with progress bar */}
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', marginBottom: '30px' }}>
            <div className="stat-card" style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', transition: 'all 0.3s' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: '#fff', marginBottom: '16px', background: 'linear-gradient(135deg, #22c55e, #15803d)' }}><i className="fa-solid fa-calendar-check"></i></div>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)', margin: 0 }}>{attPct}%</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>My Attendance ({monthLabel})</p>
              <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '50px', overflow: 'hidden', marginTop: '8px' }}>
                <div style={{ height: '100%', borderRadius: '50px', transition: 'width 0.5s', width: `${attPct}%`, background: attPct >= 75 ? '#22c55e' : attPct >= 50 ? '#f59e0b' : '#ef4444' }}></div>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: '#fff', marginBottom: '16px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}><i className="fa-solid fa-user-graduate"></i></div>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)', margin: 0 }}>{s.totalStudents || 0}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>Total Students</p>
            </div>
            <div className="stat-card" style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: '#fff', marginBottom: '16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><i className="fa-solid fa-book"></i></div>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)', margin: 0 }}>{s.totalSubjects || 0}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>My Subjects</p>
            </div>
            <div className="stat-card" style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: '#fff', marginBottom: '16px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><i className="fa-solid fa-flask"></i></div>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)', margin: 0 }}>{s.totalTests || 0}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>Tests Created</p>
            </div>
          </div>

          {/* Second Row: attendance breakdown + today's status */}
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', marginBottom: '30px' }}>
            <div className="stat-card" style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: '#fff', marginBottom: '16px', background: 'linear-gradient(135deg, #22c55e, #15803d)' }}><i className="fa-solid fa-check"></i></div>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)', margin: 0 }}>{s.present || 0}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>Days Present</p>
            </div>
            <div className="stat-card" style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: '#fff', marginBottom: '16px', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}><i className="fa-solid fa-xmark"></i></div>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)', margin: 0 }}>{s.absent || 0}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>Days Absent</p>
            </div>
            <div className="stat-card" style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: '#fff', marginBottom: '16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><i className="fa-solid fa-clock"></i></div>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)', margin: 0 }}>{s.late || 0}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>Days Late</p>
            </div>
            <div className="stat-card" style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: '#fff', marginBottom: '16px', background: todayStatus === 'Present' ? 'linear-gradient(135deg, #22c55e, #15803d)' : todayStatus === 'Absent' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #64748b, #475569)' }}><i className="fa-solid fa-user-clock"></i></div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--secondary)', margin: 0 }}>{todayStatus}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>Today's Status</p>
            </div>
          </div>

          {/* Two-column: Upcoming Tests + Recent Marks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
            <div className="panel">
              <div className="panel-header"><h3><i className="fa-solid fa-flask" style={{ color: 'var(--primary)' }}></i> Upcoming Tests</h3></div>
              <div className="panel-body">
                {dashData?.upcomingTests?.length > 0 ? (
                  <table className="data-table">
                    <thead><tr><th>Test</th><th>Subject</th><th>Date</th><th>Days Left</th></tr></thead>
                    <tbody>
                      {dashData.upcomingTests.map((t) => (
                        <tr key={t._id}>
                          <td><strong>{t.testName}</strong></td>
                          <td>{t.subject}</td>
                          <td>{new Date(t.testDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td><span className={`badge ${t.daysLeft <= 3 ? 'badge-danger' : t.daysLeft <= 7 ? 'badge-warning' : 'badge-info'}`}>{t.daysLeft}d</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <div className="empty-state"><i className="fa-solid fa-flask"></i><p>No upcoming tests.</p></div>}
              </div>
            </div>
            <div className="panel">
              <div className="panel-header"><h3><i className="fa-solid fa-clipboard-list" style={{ color: 'var(--primary)' }}></i> Recent Marks</h3></div>
              <div className="panel-body">
                {dashData?.recentMarks?.length > 0 ? (
                  <table className="data-table">
                    <thead><tr><th>Test</th><th>Subject</th><th>Avg</th><th>Max</th><th>Min</th></tr></thead>
                    <tbody>
                      {dashData.recentMarks.map((m, i) => (
                        <tr key={i}>
                          <td><strong>{m.testName}</strong></td>
                          <td>{m.subject}</td>
                          <td>{m.avgScore}/{m.maxMarks}</td>
                          <td>{m.maxScore}</td>
                          <td>{m.minScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <div className="empty-state"><i className="fa-solid fa-clipboard-list"></i><p>No marks published recently.</p></div>}
              </div>
            </div>
          </div>

          {/* Recent Notices */}
          <div className="panel">
            <div className="panel-header"><h3><i className="fa-solid fa-bullhorn" style={{ color: 'var(--primary)' }}></i> Recent Notices</h3></div>
            <div className="panel-body">
              {dashData?.notices?.length > 0 ? (
                dashData.notices.slice(0, 3).map((n) => (
                  <div key={n._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '40px', height: '40px', background: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><i className="fa-solid fa-bell"></i></div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{n.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>{n.description}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '6px 0 0' }}><i className="fa-solid fa-clock"></i> {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                ))
              ) : <div className="empty-state"><i className="fa-solid fa-bullhorn"></i><p>No notices for you.</p></div>}
            </div>
          </div>
        </>
      )}

      {activeTab === 'myattendance' && (
        <>
          {attMsg && (
            <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500, background: attMsgType === 'success' ? '#dcfce7' : '#fee2e2', color: attMsgType === 'success' ? '#15803d' : '#dc2626' }}>
              <i className={`fa-solid fa-${attMsgType === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i> {attMsg}
            </div>
          )}

          {/* Calendar + Sidebar layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Faculty Info */}
              <div style={{ background: 'var(--white)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}><h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}><i className="fa-solid fa-user" style={{ color: 'var(--primary)', marginRight: '6px' }}></i> Faculty Info</h4></div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #2563eb, #1e40af)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>{(user?.facultyName || user?.username || 'FA').slice(0, 2).toUpperCase()}</div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{user?.facultyName || user?.username}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{user?.facultyDept || ''}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}><i className="fa-solid fa-id-badge"></i> {user?.role === 'class_teacher' ? 'Class Teacher' : 'Teacher'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Summary with Ring */}
              <div style={{ background: 'var(--white)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}><h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}><i className="fa-solid fa-chart-pie" style={{ color: 'var(--primary)', marginRight: '6px' }}></i> Attendance Summary</h4></div>
                <div style={{ padding: '20px' }}>
                  {calendar ? (
                    <>
                      <div style={{ width: '120px', height: '120px', margin: '0 auto 16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                          <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                          <circle cx="60" cy="60" r="54" fill="none" stroke="url(#gradPct)" strokeWidth="8" strokeLinecap="round" strokeDasharray="339.292" strokeDashoffset={339.292 - (339.292 * (calendar.stats.percentage || 0) / 100)} />
                          <defs><linearGradient id="gradPct" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{ stopColor: '#2563eb' }} /><stop offset="100%" style={{ stopColor: '#22c55e' }} /></linearGradient></defs>
                        </svg>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--secondary)', zIndex: 1 }}>{calendar.stats.percentage || 0}%</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', position: 'absolute', bottom: '18px' }}>{new Date(calMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
                      </div>
                      {[
                        { label: 'Present', dot: '#22c55e', val: calendar.stats.present },
                        { label: 'Absent', dot: '#ef4444', val: calendar.stats.absent },
                        { label: 'Late', dot: '#f59e0b', val: calendar.stats.late },
                        { label: 'Half Day', dot: '#8b5cf6', val: calendar.stats.half },
                        { label: 'Working Days', dot: '#64748b', val: calendar.stats.workingDays },
                      ].map((r) => (
                        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: r.dot }}></div>{r.label}</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--secondary)' }}>{r.val}</div>
                        </div>
                      ))}
                    </>
                  ) : <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div>}
                </div>
              </div>

              {/* Legend */}
              <div style={{ background: 'var(--white)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}><h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}><i className="fa-solid fa-palette" style={{ color: 'var(--primary)', marginRight: '6px' }}></i> Legend</h4></div>
                <div style={{ padding: '20px' }}>
                  {[
                    { label: 'Present', color: '#22c55e' }, { label: 'Absent', color: '#ef4444' },
                    { label: 'Late', color: '#f59e0b' }, { label: 'Half Day', color: '#8b5cf6' },
                    { label: 'Holiday', color: '#e2e8f0' }, { label: 'Weekend', color: '#f1f5f9', border: '1px solid #e2e8f0' },
                  ].map((l) => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: l.color, border: l.border || 'none', flexShrink: 0 }}></div>{l.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar Main */}
            <div style={{ background: 'var(--white)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}><i className="fa-solid fa-calendar-days" style={{ color: 'var(--primary)', marginRight: '6px' }}></i> {new Date(calMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => { const [y, m] = calMonth.split('-').map(Number); const d = new Date(y, m - 2, 1); setCalMonth(d.toISOString().slice(0, 7)); }} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-light)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', cursor: 'pointer' }}><i className="fa-solid fa-chevron-left"></i></button>
                  <input type="month" value={calMonth} onChange={(e) => setCalMonth(e.target.value)} style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }} />
                  <button onClick={() => { const [y, m] = calMonth.split('-').map(Number); const d = new Date(y, m, 1); setCalMonth(d.toISOString().slice(0, 7)); }} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-light)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', cursor: 'pointer' }}><i className="fa-solid fa-chevron-right"></i></button>
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <CalendarGridFull calendar={calendar} month={calMonth} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
              </div>
            </div>
          </div>

          {/* Today's Check-In/Check-Out Panel */}
          <div className="panel" style={{ marginBottom: '24px' }}>
            <div className="panel-header"><h3><i className="fa-solid fa-clock" style={{ color: 'var(--primary)' }}></i> Today's Check-In / Check-Out</h3></div>
            <div className="panel-body">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', background: '#fffbeb', border: '1px solid #fde68a', fontSize: '0.82rem', color: '#92400e' }}>
                <i className="fa-solid fa-clock" style={{ fontSize: '1.1rem', color: '#f59e0b' }}></i>
                <div><strong>Time Window:</strong> Check-In allowed <strong>9:00 AM – 10:00 AM</strong> &nbsp;|&nbsp; Check-Out allowed <strong>4:00 PM – 5:00 PM</strong>. Outside these hours, please submit a correction request with a valid reason.</div>
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>CHECK IN</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: calendar?.todayRecord?.checkIn ? 'var(--secondary)' : 'var(--text-muted)' }}>
                    <i className="fa-solid fa-right-to-bracket" style={{ color: '#22c55e', marginRight: '6px' }}></i>{calendar?.todayRecord?.checkIn ? new Date(`2000-01-01T${calendar.todayRecord.checkIn}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                  </div>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'var(--border)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>CHECK OUT</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: calendar?.todayRecord?.checkOut ? 'var(--secondary)' : 'var(--text-muted)' }}>
                    <i className="fa-solid fa-right-from-bracket" style={{ color: '#ef4444', marginRight: '6px' }}></i>{calendar?.todayRecord?.checkOut ? new Date(`2000-01-01T${calendar.todayRecord.checkOut}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                  </div>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'var(--border)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>STATUS</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                    {calendar?.todayRecord ? (
                      <span className={`badge ${calendar.todayRecord.status === 'Present' ? 'badge-success' : calendar.todayRecord.status === 'Half Day' ? 'badge-warning' : calendar.todayRecord.status === 'Late' && !calendar.todayRecord.checkOut ? 'badge-warning' : 'badge-success'}`}>
                        {calendar.todayRecord.status === 'Late' && !calendar.todayRecord.checkOut ? 'Checked In' : calendar.todayRecord.status}
                      </span>
                    ) : <span style={{ color: 'var(--text-muted)' }}>Not Marked</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={handleCheckIn} disabled={calendar?.todayRecord?.checkIn} style={calendar?.todayRecord?.checkIn ? { opacity: 0.5, cursor: 'not-allowed' } : {}}><i className="fa-solid fa-right-to-bracket"></i> Mark In</button>
                <button className="btn" onClick={handleCheckOut} disabled={!calendar?.todayRecord?.checkIn || calendar?.todayRecord?.checkOut} style={{ background: '#ef4444', color: '#fff', ...(!calendar?.todayRecord?.checkIn || calendar?.todayRecord?.checkOut ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}><i className="fa-solid fa-right-from-bracket"></i> Mark Out</button>
                <button className="btn" onClick={handleHalfDay} disabled={calendar?.todayRecord?.status === 'Half Day'} style={{ background: '#8b5cf6', color: '#fff', ...(calendar?.todayRecord?.status === 'Half Day' ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}><i className="fa-solid fa-hourglass-half"></i> Half Day</button>
              </div>
            </div>
          </div>

          {/* Correction Request Panel */}
          <div className="panel">
            <div className="panel-header" style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
              <h3><i className="fa-solid fa-paper-plane" style={{ color: 'var(--primary)' }}></i> Previous Attendance Correction Request</h3>
            </div>
            <div className="panel-body">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '0.82rem', color: '#1e40af' }}>
                <i className="fa-solid fa-circle-info" style={{ marginTop: '2px' }}></i>
                <div><strong>Important:</strong> Previous attendance cannot be marked or edited directly. If you missed marking attendance, submit a correction request below and the management team will review and approve it.</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}><i className="fa-regular fa-calendar"></i> Date</label><input type="date" max={new Date(Date.now() - 86400000).toISOString().slice(0, 10)} value={corrForm.requestDate} onChange={(e) => setCorrForm({ ...corrForm, requestDate: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.85rem' }} /></div>
                <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}><i className="fa-solid fa-user-clock"></i> Status</label><select value={corrForm.requestedStatus} onChange={(e) => setCorrForm({ ...corrForm, requestedStatus: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.85rem' }}><option>Present</option><option>Late</option><option>Half Day</option><option>Absent</option></select></div>
                <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}><i className="fa-solid fa-right-to-bracket"></i> Check In</label><input type="time" value={corrForm.checkIn} onChange={(e) => setCorrForm({ ...corrForm, checkIn: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.85rem' }} /></div>
                <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}><i className="fa-solid fa-right-from-bracket"></i> Check Out</label><input type="time" value={corrForm.checkOut} onChange={(e) => setCorrForm({ ...corrForm, checkOut: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.85rem' }} /></div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}><i className="fa-solid fa-pen-to-square"></i> Reason</label>
                <textarea rows="3" placeholder="Example: Network issue / biometric missed / urgent duty..." value={corrForm.reason} onChange={(e) => setCorrForm({ ...corrForm, reason: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical' }}></textarea>
              </div>
              <button className="btn btn-primary" onClick={submitCorrection}><i className="fa-solid fa-paper-plane"></i> Send Request</button>

              {/* Recent Requests */}
              <div style={{ marginTop: '24px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}><i className="fa-solid fa-list-check" style={{ color: 'var(--primary)', marginRight: '6px' }}></i> My Recent Requests</div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Date</th><th>Requested</th><th>Reason</th><th>Status</th><th>Management Response</th></tr></thead>
                    <tbody>
                      {myRequests.map((r) => (
                        <tr key={r._id}>
                          <td>{new Date(r.requestDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td><strong>{r.requestedStatus}</strong><br /><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.checkIn ? new Date(`2000-01-01T${r.checkIn}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--'} - {r.checkOut ? new Date(`2000-01-01T${r.checkOut}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--'}</span></td>
                          <td style={{ maxWidth: '200px' }}>{r.reason || '—'}</td>
                          <td><span className={`badge ${r.status === 'Approved' ? 'badge-success' : r.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{r.status}</span></td>
                          <td style={{ maxWidth: '200px' }}>{r.adminResponse || '—'}</td>
                        </tr>
                      ))}
                      {myRequests.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}><i className="fa-regular fa-clipboard" style={{ fontSize: '1.5rem', opacity: 0.3, marginBottom: '8px', display: 'block' }}></i>No correction requests yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'mystudents' && (
        <div className="panel">
          <div className="panel-header"><h3>My Students</h3></div>
          <div className="panel-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Course</th><th>Year</th><th>Status</th></tr></thead>
              <tbody>
                {students.map(st => (
                  <tr key={st._id}>
                    <td>{st.firstName} {st.lastName}</td>
                    <td>{st.email}</td>
                    <td>{st.course}</td>
                    <td>{st.year}</td>
                    <td><span className={`badge ${st.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{st.status}</span></td>
                  </tr>
                ))}
                {students.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>No students</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'notices' && (
        <div className="panel">
          <div className="panel-header"><h3>Notices</h3></div>
          <div className="panel-body">
            {notices.map(n => (
              <div key={n._id} style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>{n.title}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{n.description}</p>
                <small style={{ color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
            {notices.length === 0 && <div className="empty-state"><i className="fa-solid fa-bullhorn"></i><p>No notices</p></div>}
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="panel">
          <div className="panel-header">
            <h3><i className="fa-solid fa-calendar-check" style={{ color: 'var(--primary)' }}></i> Mark Attendance — Year & Branch Wise</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Course</label>
                <select value={attCourse} onChange={(e) => setAttCourse(e.target.value)} style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.85rem', minWidth: '160px' }}>
                  <option value="">All Courses</option>
                  {attGrid?.courseYears?.map((cy) => <option key={cy.course} value={cy.course}>{cy.course}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Year</label>
                <select value={attYear} onChange={(e) => setAttYear(e.target.value)} style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.85rem', minWidth: '140px' }}>
                  <option value="">All Years</option>
                  {attGrid?.courseYears?.filter((cy) => !attCourse || cy.course === attCourse).map((cy) => <option key={cy.year} value={cy.year}>{cy.year}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Month</label>
                <input type="month" value={attMonth} onChange={(e) => setAttMonth(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.85rem' }} />
              </div>
            </div>
          </div>
          <div className="panel-body">
            {!attGrid ? (
              <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div>
            ) : attGrid.courseYears?.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <i className="fa-solid fa-book" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                <p style={{ marginTop: '10px' }}>No subjects assigned. Add subjects in "My Subjects" tab.</p>
              </div>
            ) : !attCourse || !attYear ? (
              <div className="empty-state" style={{ padding: '50px 20px' }}>
                <i className="fa-solid fa-filter" style={{ fontSize: '2.5rem', opacity: 0.3 }}></i>
                <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '10px', color: 'var(--secondary)' }}>Select Course & Year first</p>
                <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Upar diye gaye dropdown se Course aur Year select karo, tabhi attendance calendar dikhega.</p>
              </div>
            ) : attGrid.students?.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <i className="fa-solid fa-user-slash"></i>
                <p>No students found for <strong>{attCourse} — {attYear}</strong>, or this course/year is not assigned to you.</p>
              </div>
            ) : (
              <>
                {/* Branch header */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{attCourse} — {attYear}</h4>
                  <span className="badge badge-info">{attGrid.students.length} students</span>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '15px', color: 'var(--secondary)' }}>
                  <i className="fa-solid fa-calendar-days" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
                  Attendance Calendar — {new Date(attMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '8px' }}>(Auto-saves on tick)</span>
                </h4>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#dcfce7' }}></div> Present</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#fee2e2' }}></div> Absent</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#fef3c7' }}></div> Late</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#f1f5f9' }}></div> Not Marked</span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                  <i className="fa-solid fa-info-circle"></i> Tick = Present, Untick = Absent
                </div>

                {/* Attendance Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ minWidth: '800px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '160px' }}>Student Name</th>
                        {Array.from({ length: attGrid.daysInMonth }, (_, i) => {
                          const d = i + 1;
                          const dateStr = `${attMonth}-${String(d).padStart(2, '0')}`;
                          const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
                          const isWeekend = dayName === 'Sat' || dayName === 'Sun';
                          return (
                            <th key={d} style={{ textAlign: 'center', padding: '8px 6px', fontSize: '0.72rem', background: isWeekend ? '#fef3c7' : 'inherit' }}>
                              {d}<br /><span style={{ fontSize: '0.6rem', fontWeight: 400, color: 'var(--text-muted)' }}>{dayName}</span>
                            </th>
                          );
                        })}
                        <th style={{ textAlign: 'center', minWidth: '80px' }}>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attGrid.students.map((stu) => {
                        const sid = stu._id;
                        const stuAtt = attGrid.attendance[sid] || {};
                        let present = 0, absent = 0, late = 0, totalMarked = 0;
                        const todayStr = new Date().toISOString().slice(0, 10);
                        return (
                          <tr key={sid}>
                            <td>
                              <strong>{stu.firstName} {stu.lastName}</strong>
                              <br /><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stu.course}</span>
                            </td>
                            {Array.from({ length: attGrid.daysInMonth }, (_, i) => {
                              const d = i + 1;
                              const dateStr = `${attMonth}-${String(d).padStart(2, '0')}`;
                              const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
                              const isWeekend = dayName === 'Sat' || dayName === 'Sun';
                              const isFuture = dateStr > todayStr;
                              const status = stuAtt[dateStr];
                              if (!isFuture && !isWeekend) {
                                if (status === 'Present') { present++; totalMarked++; }
                                else if (status === 'Absent') { absent++; totalMarked++; }
                                else if (status === 'Late') { late++; totalMarked++; }
                              }
                              const cellBg = status === 'Present' ? '#dcfce7' : status === 'Absent' ? '#fee2e2' : status === 'Late' ? '#fef3c7' : '#f1f5f9';
                              if (isWeekend) return <td key={d} style={{ textAlign: 'center', padding: '6px', fontSize: '0.72rem', background: '#f1f5f9', color: '#94a3b8' }} title="Holiday / Weekend">—</td>;
                              if (isFuture) return <td key={d} style={{ textAlign: 'center', padding: '6px', fontSize: '0.72rem', color: '#cbd5e1' }} title="Future date">—</td>;
                              return (
                                <td key={d} style={{ textAlign: 'center', padding: '6px', fontSize: '0.72rem', background: cellBg }}>
                                  <input
                                    type="checkbox"
                                    checked={status === 'Present'}
                                    onChange={async (e) => {
                                      const newStatus = e.target.checked ? 'Present' : 'Absent';
                                      // Optimistic update
                                      setAttGrid((prev) => {
                                        const updated = { ...prev.attendance };
                                        updated[sid] = { ...(updated[sid] || {}), [dateStr]: newStatus };
                                        return { ...prev, attendance: updated };
                                      });
                                      try {
                                        await API.post('/attendance', { studentId: sid, attendanceDate: dateStr, status: newStatus });
                                      } catch (err) {
                                        alert('Failed to save attendance');
                                        setAttGrid((prev) => {
                                          const updated = { ...prev.attendance };
                                          delete updated[sid]?.[dateStr];
                                          return { ...prev, attendance: updated };
                                        });
                                      }
                                    }}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                    title={dateStr}
                                  />
                                </td>
                              );
                            })}
                            <td style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 600 }}>
                              {totalMarked > 0 ? Math.round(((present + late) / totalMarked) * 100) + '%' : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'marks' && (
        <div className="panel">
          <div className="panel-header"><h3><i className="fa-solid fa-clipboard-list" style={{ color: 'var(--primary)' }}></i> Enter Sessional Marks</h3></div>
          <div className="panel-body">
            {/* Course/Year Filter — matches PHP form-inline */}
            <div className="form-inline" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Course</label>
                <select value={marksCourse} onChange={(e) => setMarksCourse(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontFamily: 'inherit' }}>
                  <option value="">All Courses</option>
                  {[...new Set(marksStudents.map((s) => s.course).filter(Boolean))].sort().map((c) => <option key={c} value={c}>{c}</option>)}
                  {marksCourse && !marksStudents.some((s) => s.course === marksCourse) && <option value={marksCourse}>{marksCourse}</option>}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Year</label>
                <select value={marksYear} onChange={(e) => setMarksYear(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontFamily: 'inherit' }}>
                  <option value="">All Years</option>
                  {['1st Year', '2nd Year', '3rd Year', 'Final Year'].map((yr) => <option key={yr} value={yr}>{yr}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={() => {
                const params = new URLSearchParams();
                if (marksCourse) params.set('course', marksCourse);
                if (marksYear) params.set('year', marksYear);
                API.get(`/students?${params}`).then(({ data }) => {
                  setMarksStudents(data);
                  const vals = {};
                  data.forEach((s) => { vals[s._id] = 0; });
                  setMarksValues(vals);
                }).catch(() => {});
              }}><i className="fa-solid fa-filter"></i> Filter</button>
            </div>

            {marksStudents.length > 0 ? (
              <>
                {marksMsg && (
                  <div style={{ padding: '12px 18px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 500, background: marksMsgType === 'success' ? '#dcfce7' : '#fee2e2', color: marksMsgType === 'success' ? '#15803d' : '#dc2626' }}>
                    <i className={`fa-solid fa-${marksMsgType === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i> {marksMsg}
                  </div>
                )}
                {/* Test info form — matches PHP form-inline */}
                <div className="form-inline" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Subject</label>
                    <select value={marksForm.subject} onChange={(e) => setMarksForm({ ...marksForm, subject: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontFamily: 'inherit' }}>
                      {dashData?.subjects?.length > 0 ? dashData.subjects.map((s) => <option key={s} value={s}>{s}</option>) : <option value="General">General</option>}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Test Name</label>
                    <input type="text" placeholder="e.g. Sessional 1" value={marksForm.testName} onChange={(e) => setMarksForm({ ...marksForm, testName: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontFamily: 'inherit' }} />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Test Date</label>
                    <input type="date" value={marksForm.testDate} onChange={(e) => setMarksForm({ ...marksForm, testDate: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontFamily: 'inherit' }} />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Max Marks</label>
                    <input type="number" value={marksForm.maxMarks} onChange={(e) => setMarksForm({ ...marksForm, maxMarks: Number(e.target.value) })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontFamily: 'inherit' }} />
                  </div>
                </div>

                {/* Marks Table */}
                <table className="data-table">
                  <thead><tr><th>Student Name</th><th>Course</th><th>Year</th><th>Marks Obtained</th></tr></thead>
                  <tbody>
                    {marksStudents.map((stu) => (
                      <tr key={stu._id}>
                        <td><strong>{stu.firstName} {stu.lastName}</strong></td>
                        <td>{stu.course}</td>
                        <td>{stu.year}</td>
                        <td><input type="number" className="marks-input" value={marksValues[stu._id] ?? 0} min="0" step="0.5" max={marksForm.maxMarks} onChange={(e) => setMarksValues({ ...marksValues, [stu._id]: e.target.value })} style={{ width: '70px', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.82rem' }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="btn btn-primary" style={{ marginTop: '15px' }} onClick={saveMarks}><i className="fa-solid fa-save"></i> Save Marks</button>
              </>
            ) : (
              <div className="empty-state"><i className="fa-solid fa-clipboard-list"></i><p>No students found. Select a course and year first.</p></div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <>
          {/* Schedule Test Panel */}
          <div className="panel">
            <div className="panel-header"><h3><i className="fa-solid fa-flask" style={{ color: 'var(--primary)' }}></i> Schedule Test</h3></div>
            <div className="panel-body">
              {testMsg && (
                <div style={{ padding: '12px 18px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 500, background: testMsgType === 'success' ? '#dcfce7' : '#fee2e2', color: testMsgType === 'success' ? '#15803d' : '#dc2626' }}>
                  <i className={`fa-solid fa-${testMsgType === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i> {testMsg}
                </div>
              )}
              <div className="form-inline" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Subject</label>
                  <select value={testForm.subject} onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontFamily: 'inherit' }}>
                    <option value="">Select Subject</option>
                    {dashData?.subjects?.length > 0 ? dashData.subjects.map((s) => <option key={s} value={s}>{s}</option>) : <option value="General">General</option>}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Test Name</label>
                  <input type="text" placeholder="e.g. Sessional 2" value={testForm.testName} onChange={(e) => setTestForm({ ...testForm, testName: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontFamily: 'inherit' }} />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Course</label>
                  <select value={testForm.course} onChange={(e) => setTestForm({ ...testForm, course: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontFamily: 'inherit' }}>
                    <option value="">Select Course</option>
                    {[...new Set(marksStudents.map((s) => s.course).filter(Boolean))].sort().map((c) => <option key={c} value={c}>{c}</option>)}
                    <option>Computer Science</option><option>Electronics</option><option>Mechanical</option><option>Management</option><option>Sciences</option><option>Humanities</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Year</label>
                  <select value={testForm.year} onChange={(e) => setTestForm({ ...testForm, year: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontFamily: 'inherit' }}>
                    {['1st Year', '2nd Year', '3rd Year', 'Final Year'].map((yr) => <option key={yr} value={yr}>{yr}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Test Date</label>
                  <input type="date" value={testForm.testDate} onChange={(e) => setTestForm({ ...testForm, testDate: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontFamily: 'inherit' }} />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Max Marks</label>
                  <input type="number" value={testForm.maxMarks} onChange={(e) => setTestForm({ ...testForm, maxMarks: Number(e.target.value) })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontFamily: 'inherit' }} />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Description (optional)</label>
                  <input type="text" placeholder="Syllabus / chapters" value={testForm.description} onChange={(e) => setTestForm({ ...testForm, description: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontFamily: 'inherit' }} />
                </div>
                <button className="btn btn-primary" onClick={scheduleTest}><i className="fa-solid fa-plus"></i> Schedule Test</button>
              </div>
            </div>
          </div>

          {/* Scheduled Tests Panel */}
          <div className="panel">
            <div className="panel-header"><h3>Scheduled Tests</h3></div>
            <div className="panel-body">
              {/* Stats badges */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ background: '#dbeafe', color: '#2563eb', padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}><i className="fa-solid fa-flask"></i> Total: {testsData.stats.total}</div>
                <div style={{ background: '#fef3c7', color: '#d97706', padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}><i className="fa-solid fa-clock"></i> Upcoming: {testsData.stats.upcoming}</div>
                <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}><i className="fa-solid fa-circle-check"></i> Completed: {testsData.stats.done}</div>
              </div>
              {testsData.tests.length === 0 ? (
                <div className="empty-state"><i className="fa-solid fa-flask"></i><p>No tests scheduled yet.</p></div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Test</th><th>Subject</th><th>Course</th><th>Year</th><th>Date</th><th>Max Marks</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {testsData.tests.map((t) => {
                      const isUpcoming = new Date(t.testDate) >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
                      return (
                        <tr key={t._id}>
                          <td><strong>{t.testName}</strong></td>
                          <td>{t.subject}</td>
                          <td>{t.course}</td>
                          <td>{t.year}</td>
                          <td>{new Date(t.testDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td>{t.maxMarks}</td>
                          <td><span className={`badge ${isUpcoming ? 'badge-warning' : 'badge-success'}`}>{isUpcoming ? 'Upcoming' : 'Done'}</span></td>
                          <td><button onClick={() => deleteTest(t._id)} title="Delete" style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}><i className="fa-solid fa-trash"></i></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {['subjects', 'myclasses', 'payslip'].includes(activeTab) && (
        <div className="panel">
          <div className="panel-header"><h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3></div>
          <div className="panel-body">
            <div className="empty-state">
              <i className="fa-solid fa-folder-open"></i>
              <p>This module is available. Use the API endpoints to manage {activeTab}.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CalendarGridFull({ calendar, month, selectedDay, setSelectedDay }) {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstDayWeek = new Date(y, m - 1, 1).getDay();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = new Date().toISOString().slice(0, 10);
  const calData = calendar?.calendar || {};
  const fullCalData = calendar?.fullCalendar || {};

  const cells = [];
  for (let i = 0; i < firstDayWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayName = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });
    const isWeekend = dayName === 'Sat' || dayName === 'Sun';
    const status = calData[dateStr];
    const isToday = dateStr === todayStr;
    const isFuture = new Date(dateStr) > new Date(todayStr);
    const full = fullCalData[dateStr];

    let cellClass = '';
    let statusLabel = '';
    if (status === 'Present') { cellClass = 'P'; statusLabel = 'Present'; }
    else if (status === 'Absent') { cellClass = 'A'; statusLabel = 'Absent'; }
    else if (status === 'Late') {
      if (full?.checkOut) { cellClass = 'P'; statusLabel = 'Present'; }
      else { cellClass = 'L'; statusLabel = 'Checked In'; }
    }
    else if (status === 'Half Day') { cellClass = 'HD'; statusLabel = 'Half Day'; }
    else if (isFuture) { cellClass = 'future'; statusLabel = ''; }
    else if (isWeekend) { cellClass = 'weekend'; statusLabel = 'Holiday'; }
    else if (isToday) {
      const mins = new Date().getHours() * 60 + new Date().getMinutes();
      cellClass = mins < 600 ? 'NM' : 'A';
      statusLabel = mins < 600 ? 'Not Marked' : 'Absent';
    }
    else { cellClass = 'A'; statusLabel = 'Absent'; }

    cells.push({ day: d, dateStr, cellClass, statusLabel, isToday, isWeekend, isFuture, full });
  }

  const bgMap = {
    P: '#22c55e', A: '#ef4444', L: '#f59e0b', HD: '#8b5cf6',
    NM: '#f8fafc', future: 'var(--bg-light)', weekend: '#f1f5f9', empty: 'transparent',
  };
  const colorMap = { P: '#fff', A: '#fff', L: '#fff', HD: '#fff', NM: '#64748b', future: 'var(--text-muted)', weekend: '#94a3b8' };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '10px' }}>
        {weekdays.map((w) => <div key={w} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 0' }}>{w}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', rowGap: '20px' }}>
        {cells.map((c, i) => {
          if (!c) return <div key={i} style={{ width: '60px', height: '60px', margin: '0 auto' }}></div>;
          const isSelected = selectedDay?.dateStr === c.dateStr;
          return (
            <div
              key={i}
              onClick={() => !c.isFuture && setSelectedDay(c)}
              title={c.statusLabel ? `${new Date(c.dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' })} — ${c.statusLabel}${c.full?.checkIn ? ` | In: ${new Date(`2000-01-01T${c.full.checkIn}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}` : ''}${c.full?.checkOut ? ` | Out: ${new Date(`2000-01-01T${c.full.checkOut}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}` : ''}` : ''}
              style={{
                width: '60px', height: '60px', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto', cursor: c.isFuture ? 'default' : 'pointer', transition: 'all 0.2s',
                border: c.isToday ? '2px solid var(--primary)' : isSelected ? '3px solid var(--primary)' : c.cellClass === 'NM' ? '2px dashed #cbd5e1' : c.isFuture ? '2px dashed var(--border)' : c.isWeekend && !['P', 'A', 'L', 'HD'].includes(c.cellClass) ? '1px solid #e2e8f0' : '2px solid transparent',
                background: bgMap[c.cellClass] || '#f8fafc',
                color: colorMap[c.cellClass] || 'var(--secondary)',
                boxShadow: c.isToday ? '0 0 10px rgba(37,99,235,0.25)' : isSelected ? '0 0 12px rgba(37,99,235,0.4)' : 'none',
                transform: isSelected ? 'scale(1.1)' : 'none',
                opacity: c.isFuture ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { if (!c.isFuture) e.currentTarget.style.transform = isSelected ? 'scale(1.1)' : 'scale(1.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = isSelected ? 'scale(1.1)' : 'scale(1)'; }}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{c.day}</span>
            </div>
          );
        })}
      </div>

      {/* Selected Day Info */}
      {selectedDay && (
        <div style={{ marginTop: '16px', padding: '16px 20px', background: 'var(--bg-light)', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{new Date(selectedDay.dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(selectedDay.dateStr).toLocaleDateString('en-US', { weekday: 'long' })}</div>
          </div>
          {selectedDay.full?.checkIn && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}><i className="fa-solid fa-right-to-bracket" style={{ color: '#22c55e', marginRight: '4px' }}></i>{new Date(`2000-01-01T${selectedDay.full.checkIn}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>}
          {selectedDay.full?.checkOut && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}><i className="fa-solid fa-right-from-bracket" style={{ color: '#ef4444', marginRight: '4px' }}></i>{new Date(`2000-01-01T${selectedDay.full.checkOut}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>}
          <div style={{ marginLeft: 'auto', padding: '6px 18px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, background: bgMap[selectedDay.cellClass] || 'var(--bg-light)', color: colorMap[selectedDay.cellClass] || 'var(--text-muted)' }}>
            {selectedDay.statusLabel || 'Upcoming'}
          </div>
        </div>
      )}
    </>
  );
}
