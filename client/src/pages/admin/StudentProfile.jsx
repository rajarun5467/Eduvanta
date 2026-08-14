import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api.js';

const fmtINR = (n) => '₹' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const gradeFor = (pct) => pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
const gradeClass = (g) => 'grade-' + g.replace('+', '_plus');
const gradeCircleClass = (g) => 'grade-circle-' + g.replace('+', '_plus');
const barColor = (pct) => pct >= 80 ? '#22c55e' : pct >= 60 ? '#3b82f6' : pct >= 40 ? '#f59e0b' : '#ef4444';

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function StudentProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calMonth, setCalMonth] = useState(new Date().toISOString().slice(0, 7));
  const [feeReceipt, setFeeReceipt] = useState(null);

  useEffect(() => {
    API.get(`/students/${id}/profile`).then(({ data }) => {
      setData(data);
      const months = data.availMonths;
      if (months && months.length > 0) setCalMonth(months[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i><p>Loading profile...</p></div>;
  if (!data) return <div className="empty-state"><i className="fa-solid fa-circle-exclamation"></i><p>Student not found</p></div>;

  const { student, fees, feeStats, attSummary, attPct, attCalendar, marks, marksBySubject, totalMax, totalObtained, overallPct, grade, resultStatus, cgpa, placement, availMonths } = data;

  const initials = (student.firstName?.[0] || '') + (student.lastName?.[0] || '');
  const stuId = '#STU' + String(student._id.toString().replace(/\D/g, '').slice(-6)).padStart(3, '0');

  // Calendar
  const calYear = parseInt(calMonth.slice(0, 4));
  const calMonthNum = parseInt(calMonth.slice(5, 7));
  const daysInMonth = new Date(calYear, calMonthNum, 0).getDate();
  const firstDay = new Date(calYear, calMonthNum - 1, 1).getDay(); // 0=Sun
  const firstDayMon = firstDay === 0 ? 6 : firstDay - 1; // 0=Mon
  const todayStr = new Date().toISOString().slice(0, 10);

  let monthPres = 0, monthAbs = 0, monthLate = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${calYear}-${String(calMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const st = attCalendar[ds];
    if (st === 'Present') monthPres++;
    else if (st === 'Absent') monthAbs++;
    else if (st === 'Late') monthLate++;
  }
  const monthTotal = monthPres + monthAbs + monthLate;
  const monthPct = monthTotal > 0 ? Math.round(((monthPres + monthLate) / monthTotal) * 100) : 0;

  // Fee counts
  let feePaid = 0, feePartial = 0, feeUnpaid = 0;
  fees.forEach((f) => {
    if (f.status === 'Paid') feePaid++;
    else if (f.status === 'Partial') feePartial++;
    else feeUnpaid++;
  });

  // Result stats
  const totalSubjects = Object.keys(marksBySubject).length;
  let passedSubjects = 0;
  Object.entries(marksBySubject).forEach(([subj, mlist]) => {
    let sm = 0, so = 0;
    mlist.forEach((m) => { sm += m.maxMarks; so += m.obtainedMarks; });
    if (sm > 0 && (so / sm * 100) >= 40) passedSubjects++;
  });

  const ringColor = overallPct >= 80 ? '#22c55e' : overallPct >= 60 ? '#3b82f6' : overallPct >= 40 ? '#f59e0b' : '#ef4444';
  const ringCircumference = 2 * Math.PI * 42;
  const ringOffset = ringCircumference - (ringCircumference * overallPct / 100);

  const monthAttRecords = data.attendance.filter((a) => new Date(a.attendanceDate).toISOString().slice(0, 7) === calMonth).sort((a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate));

  return (
    <>
      <style>{`
        .profile-header { background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: var(--radius-lg); padding: 30px; color: #fff; display: flex; align-items: center; gap: 24px; margin-bottom: 30px; }
        .profile-avatar { width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; flex-shrink: 0; }
        .profile-header h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; }
        .profile-header p { font-size: 0.9rem; opacity: 0.9; }
        .profile-header .badges { display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap; }
        .profile-header .pbadge { background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 50px; font-size: 0.78rem; font-weight: 600; }
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .info-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; }
        .info-card h4 { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 14px; font-weight: 600; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 0.85rem; }
        .info-row:last-child { border-bottom: none; }
        .info-row .label { color: var(--text-muted); font-weight: 500; }
        .info-row .value { font-weight: 600; color: var(--secondary); }
        .stat-mini-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
        .stat-mini { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; text-align: center; }
        .stat-mini h3 { font-size: 1.6rem; font-weight: 700; margin-bottom: 4px; }
        .stat-mini p { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
        .progress-bar { height: 8px; background: var(--bg-light); border-radius: 50px; overflow: hidden; margin-top: 8px; }
        .progress-fill { height: 100%; border-radius: 50px; transition: width 0.8s ease; }
        .profile-section { margin-bottom: 30px; }
        .back-link { display: inline-flex; align-items: center; gap: 8px; color: var(--primary); font-weight: 600; font-size: 0.88rem; margin-bottom: 20px; text-decoration: none; }
        .back-link:hover { text-decoration: underline; }
        .profile-actions { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .btn-download { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: var(--radius-md); font-size: 0.82rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.25s; text-decoration: none; }
        .btn-download-excel { background: #dcfce7; color: #15803d; }
        .btn-download-excel:hover { background: #22c55e; color: #fff; }
        .btn-download-pdf { background: #fee2e2; color: #dc2626; }
        .btn-download-pdf:hover { background: #ef4444; color: #fff; }
        .result-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; margin-bottom: 24px; }
        .result-card-header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #fff; padding: 24px 30px; text-align: center; position: relative; }
        .result-card-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #2563eb, #7c3aed, #db2777); }
        .result-card-header .rc-logo { width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 8px; }
        .result-card-header h3 { font-size: 1.3rem; font-weight: 800; letter-spacing: 2px; margin-bottom: 2px; }
        .result-card-header .rc-subtitle { font-size: 0.82rem; opacity: 0.7; letter-spacing: 1px; text-transform: uppercase; }
        .result-card-header .rc-session { font-size: 0.75rem; opacity: 0.6; margin-top: 6px; }
        .result-student-bar { display: flex; flex-wrap: wrap; gap: 0; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .result-student-bar .rsb-item { flex: 1; min-width: 150px; padding: 12px 20px; border-right: 1px solid #e2e8f0; }
        .result-student-bar .rsb-item:last-child { border-right: none; }
        .result-student-bar .rsb-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600; margin-bottom: 3px; }
        .result-student-bar .rsb-value { font-size: 0.88rem; font-weight: 700; color: var(--secondary); }
        .result-body { padding: 24px 30px; }
        .result-subject-card { border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px; overflow: hidden; transition: box-shadow 0.2s; }
        .result-subject-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .result-subject-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: linear-gradient(135deg, #eff6ff, #f0f9ff); border-bottom: 1px solid #e2e8f0; }
        .result-subject-header .rsh-name { font-size: 0.92rem; font-weight: 700; color: var(--secondary); display: flex; align-items: center; gap: 8px; }
        .result-subject-header .rsh-name i { color: var(--primary); }
        .result-subject-header .rsh-score { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); }
        .result-subject-header .rsh-score strong { color: var(--secondary); font-size: 0.95rem; }
        .result-subject-header .rsh-grade { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 800; color: #fff; margin-left: 12px; }
        .result-test-row { display: flex; align-items: center; gap: 14px; padding: 10px 18px; border-bottom: 1px solid #f1f5f9; }
        .result-test-row:last-child { border-bottom: none; }
        .result-test-row .rtr-name { flex: 0 0 180px; font-size: 0.82rem; font-weight: 500; color: var(--secondary); }
        .result-test-row .rtr-date { flex: 0 0 80px; font-size: 0.75rem; color: var(--text-muted); }
        .result-test-row .rtr-bar { flex: 1; height: 8px; background: #f1f5f9; border-radius: 50px; overflow: hidden; }
        .result-test-row .rtr-bar-fill { height: 100%; border-radius: 50px; transition: width 1s ease; }
        .result-test-row .rtr-marks { flex: 0 0 70px; text-align: right; font-size: 0.82rem; font-weight: 700; color: var(--secondary); }
        .result-test-row .rtr-pct { flex: 0 0 50px; text-align: right; font-size: 0.78rem; font-weight: 600; }
        .result-test-row .rtr-grade { flex: 0 0 36px; text-align: center; }
        .result-test-row .rtr-grade span { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; }
        .result-summary { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; padding: 24px 30px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-top: 2px solid #e2e8f0; }
        .result-ring-wrap { display: flex; align-items: center; gap: 20px; }
        .result-ring { position: relative; width: 100px; height: 100px; }
        .result-ring svg { transform: rotate(-90deg); }
        .result-ring .ring-bg { fill: none; stroke: #e2e8f0; stroke-width: 8; }
        .result-ring .ring-fill { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1.5s ease; }
        .result-ring .ring-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
        .result-ring .ring-text .rt-val { font-size: 1.5rem; font-weight: 800; color: var(--secondary); }
        .result-ring .ring-text .rt-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .result-stats-grid { display: flex; gap: 24px; flex-wrap: wrap; }
        .result-stat { text-align: center; }
        .result-stat .rs-val { font-size: 1.5rem; font-weight: 800; }
        .result-stat .rs-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        .result-grade-circle { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; color: #fff; }
        .result-stamp { display: inline-flex; align-items: center; justify-content: center; padding: 8px 24px; border: 3px solid; border-radius: 8px; font-size: 1.1rem; font-weight: 800; letter-spacing: 2px; transform: rotate(-3deg); text-transform: uppercase; }
        .result-stamp.pass { border-color: #15803d; color: #15803d; background: rgba(220,252,231,0.5); }
        .result-stamp.fail { border-color: #dc2626; color: #dc2626; background: rgba(254,226,226,0.5); }
        .grade-A_plus, .grade-A { background: #dcfce7; color: #15803d; }
        .grade-B_plus, .grade-B { background: #dbeafe; color: #1d4ed8; }
        .grade-C, .grade-D { background: #fef3c7; color: #b45309; }
        .grade-F { background: #fee2e2; color: #dc2626; }
        .grade-circle-A_plus, .grade-circle-A { background: #22c55e; }
        .grade-circle-B_plus, .grade-circle-B { background: #3b82f6; }
        .grade-circle-C, .grade-circle-D { background: #f59e0b; }
        .grade-circle-F { background: #ef4444; }
        .att-legend { display: flex; gap: 15px; margin-bottom: 15px; font-size: 0.8rem; flex-wrap: wrap; align-items: center; }
        .att-legend span { display: flex; align-items: center; gap: 6px; }
        .att-legend .dot { width: 14px; height: 14px; border-radius: 4px; }
        .att-status-P { background: #dcfce7; color: #15803d; font-weight: 600; }
        .att-status-A { background: #fee2e2; color: #dc2626; font-weight: 600; }
        .att-status-L { background: #fef3c7; color: #b45309; font-weight: 600; }
        .att-status-N { background: #f1f5f9; color: #cbd5e1; }
        .att-table-wrap { overflow-x: auto; margin-bottom: 20px; }
        .att-month-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
        .att-month-nav select { padding: 8px 14px; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 0.85rem; font-family: inherit; cursor: pointer; }
        .att-month-nav select:focus { outline: none; border-color: var(--primary); }
        @media (max-width: 768px) { .info-grid { grid-template-columns: 1fr; } .stat-mini-grid { grid-template-columns: repeat(2, 1fr) !important; } .profile-header { flex-direction: column; text-align: center; } .result-student-bar { flex-direction: column; } .result-student-bar .rsb-item { border-right: none; border-bottom: 1px solid #e2e8f0; } .result-test-row { flex-direction: column; gap: 6px; align-items: flex-start; } .result-test-row .rtr-name, .result-test-row .rtr-date, .result-test-row .rtr-marks { flex: none; } .result-subject-header { flex-direction: column; gap: 8px; align-items: flex-start; } .att-month-nav { flex-direction: column; align-items: stretch; } }
        @media (max-width: 480px) { .stat-mini-grid { grid-template-columns: 1fr !important; } .profile-header { padding: 16px 14px; } .profile-header h2 { font-size: 1.2rem; } }
      `}</style>

      <Link to="/admin/students" className="back-link"><i className="fa-solid fa-arrow-left"></i> Back to Students</Link>

      <div className="profile-header">
        <div className="profile-avatar">{initials.toUpperCase()}</div>
        <div>
          <h2>{student.firstName} {student.lastName}</h2>
          <p>{student.course} · {student.year} · Roll: {student.rollNumber || 'N/A'}</p>
          <div className="badges">
            <span className="pbadge"><i className="fa-solid fa-id-card"></i> {stuId}</span>
            <span className="pbadge"><i className={`fa-solid fa-${student.status === 'Active' ? 'circle-check' : 'circle-exclamation'}`}></i> {student.status}</span>
            {placement && <span className="pbadge"><i className="fa-solid fa-briefcase"></i> Placed @ {placement.company}</span>}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stat-mini-grid">
        <div className="stat-mini">
          <h3 style={{ color: '#15803d' }}>{attSummary.Present + attSummary.Late}</h3>
          <p>Days Present</p>
        </div>
        <div className="stat-mini">
          <h3 style={{ color: '#dc2626' }}>{attSummary.Absent}</h3>
          <p>Days Absent</p>
        </div>
        <div className="stat-mini">
          <h3 style={{ color: attPct >= 75 ? '#15803d' : '#dc2626' }}>{attPct}%</h3>
          <p>Attendance</p>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${attPct}%`, background: attPct >= 75 ? '#22c55e' : '#ef4444' }}></div></div>
        </div>
        <div className="stat-mini">
          <h3 style={{ color: '#dc2626' }}>₹{Number(feeStats.due || 0).toLocaleString('en-US')}</h3>
          <p>Fee Due</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="info-grid">
        <div className="info-card">
          <h4><i className="fa-solid fa-user"></i> Personal Information</h4>
          <div className="info-row"><span className="label">Full Name</span><span className="value">{student.firstName} {student.lastName}</span></div>
          <div className="info-row"><span className="label">Email</span><span className="value">{student.email}</span></div>
          <div className="info-row"><span className="label">Phone</span><span className="value">{student.phone || '—'}</span></div>
          <div className="info-row"><span className="label">DOB</span><span className="value">{fmtDate(student.dob)}</span></div>
          <div className="info-row"><span className="label">Gender</span><span className="value">{student.gender || '—'}</span></div>
          <div className="info-row"><span className="label">Address</span><span className="value">{student.address || '—'}</span></div>
        </div>
        <div className="info-card">
          <h4><i className="fa-solid fa-graduation-cap"></i> Academic Information</h4>
          <div className="info-row"><span className="label">Student ID</span><span className="value">{stuId}</span></div>
          <div className="info-row"><span className="label">Roll Number</span><span className="value">{student.rollNumber || '—'}</span></div>
          <div className="info-row"><span className="label">Course</span><span className="value">{student.course}</span></div>
          <div className="info-row"><span className="label">Year</span><span className="value">{student.year}</span></div>
          <div className="info-row"><span className="label">Class</span><span className="value">{student.classId?.name || '—'}</span></div>
          <div className="info-row"><span className="label">Section</span><span className="value">{student.sectionId?.name || '—'}</span></div>
          <div className="info-row"><span className="label">Status</span><span className="value">{student.status}</span></div>
        </div>
        <div className="info-card">
          <h4><i className="fa-solid fa-users"></i> Parent / Guardian</h4>
          <div className="info-row"><span className="label">Parent Name</span><span className="value">{student.parentName || '—'}</span></div>
          <div className="info-row"><span className="label">Parent Phone</span><span className="value">{student.parentPhone || '—'}</span></div>
          <div className="info-row"><span className="label">Parent Email</span><span className="value">{student.parentEmail || '—'}</span></div>
          {placement && (
            <>
              <div className="info-row" style={{ marginTop: 10, borderTop: '2px solid var(--border)', paddingTop: 12 }}><span className="label">Placement</span><span className="value" style={{ color: '#15803d' }}>{placement.company}</span></div>
              <div className="info-row"><span className="label">Package</span><span className="value">{placement.package}</span></div>
              <div className="info-row"><span className="label">Role</span><span className="value">{placement.role || '—'}</span></div>
            </>
          )}
        </div>
      </div>

      {/* Fee Details */}
      <div className="profile-section">
        <div className="panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3><i className="fa-solid fa-indian-rupee-sign"></i> Fee Details</h3>
          </div>
          <div className="panel-body">
            <div className="stat-mini-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
              <div className="stat-mini"><h3 style={{ color: '#f59e0b' }}>₹{Number(feeStats.total || 0).toLocaleString('en-US')}</h3><p>Total Fees</p></div>
              <div className="stat-mini"><h3 style={{ color: '#15803d' }}>₹{Number(feeStats.paid || 0).toLocaleString('en-US')}</h3><p>Paid</p></div>
              <div className="stat-mini"><h3 style={{ color: '#dc2626' }}>₹{Number(feeStats.due || 0).toLocaleString('en-US')}</h3><p>Due</p></div>
              <div className="stat-mini">
                <h3 style={{ color: feeStats.total > 0 && (feeStats.paid / feeStats.total * 100) >= 75 ? '#15803d' : '#dc2626' }}>
                  {feeStats.total > 0 ? Math.round(feeStats.paid / feeStats.total * 100) : 0}%
                </h3>
                <p>Payment Done</p>
                <div className="progress-bar" style={{ marginTop: 6 }}>
                  <div className="progress-fill" style={{ width: `${feeStats.total > 0 ? Math.round(feeStats.paid / feeStats.total * 100) : 0}%`, background: feeStats.total > 0 && (feeStats.paid / feeStats.total * 100) >= 75 ? '#22c55e' : '#f59e0b' }}></div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <span className="badge badge-success">{feePaid} Paid</span>
              <span className="badge badge-warning">{feePartial} Partial</span>
              <span className="badge badge-danger">{feeUnpaid} Unpaid</span>
            </div>

            {fees.length > 0 ? (
              <table className="data-table">
                <thead><tr><th>Fee Type</th><th>Total Amount</th><th>Paid Amount</th><th>Due Amount</th><th>Payment Date</th><th>Status</th><th>Progress</th><th>Action</th></tr></thead>
                <tbody>
                  {fees.map((f) => {
                    const fPct = f.totalAmount > 0 ? Math.round(f.paidAmount / f.totalAmount * 100) : 0;
                    return (
                      <tr key={f._id}>
                        <td><strong>{f.feeType}</strong></td>
                        <td>{fmtINR(f.totalAmount)}</td>
                        <td style={{ color: '#15803d', fontWeight: 600 }}>{fmtINR(f.paidAmount)}</td>
                        <td style={{ color: '#dc2626', fontWeight: 600 }}>{fmtINR(f.dueAmount)}</td>
                        <td>{fmtDate(f.paymentDate)}</td>
                        <td><span className={`badge ${f.status === 'Paid' ? 'badge-success' : f.status === 'Partial' ? 'badge-warning' : 'badge-danger'}`}>{f.status}</span></td>
                        <td style={{ minWidth: 100 }}>
                          <div className="progress-bar" style={{ height: 6, margin: 0 }}>
                            <div className="progress-fill" style={{ width: `${fPct}%`, background: fPct >= 100 ? '#22c55e' : fPct >= 50 ? '#f59e0b' : '#ef4444' }}></div>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>{fPct}%</span>
                        </td>
                        <td>
                          <button className="action-btn action-view" onClick={() => setFeeReceipt(f)} title="View Receipt"><i className="fa-solid fa-eye"></i></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 700 }}>
                    <td>Total</td>
                    <td>{fmtINR(feeStats.total)}</td>
                    <td style={{ color: '#15803d' }}>{fmtINR(feeStats.paid)}</td>
                    <td style={{ color: '#dc2626' }}>{fmtINR(feeStats.due)}</td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-receipt" style={{ fontSize: '2rem', marginBottom: 10, opacity: 0.3 }}></i>
                <p>No fee records found for this student.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Card */}
      {totalSubjects > 0 ? (
        <div className="profile-section">
          <div className="result-card">
            <div className="result-card-header">
              <div className="rc-logo"><i className="fa-solid fa-graduation-cap"></i></div>
              <h3>EDUNEX COLLEGE</h3>
              <div className="rc-subtitle">Academic Result Statement</div>
              <div className="rc-session">Session 2025-26 · Generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
            <div className="result-student-bar">
              <div className="rsb-item"><div className="rsb-label">Student Name</div><div className="rsb-value">{student.firstName} {student.lastName}</div></div>
              <div className="rsb-item"><div className="rsb-label">Roll Number</div><div className="rsb-value">{student.rollNumber || 'N/A'}</div></div>
              <div className="rsb-item"><div className="rsb-label">Course</div><div className="rsb-value">{student.course}</div></div>
              <div className="rsb-item"><div className="rsb-label">Year</div><div className="rsb-value">{student.year}</div></div>
              <div className="rsb-item"><div className="rsb-label">Student ID</div><div className="rsb-value">{stuId}</div></div>
            </div>
            <div className="result-body">
              {Object.entries(marks).map(([yr, subjList]) => {
                let yrMax = 0, yrObt = 0;
                Object.values(subjList).forEach((mlist) => mlist.forEach((m) => { yrMax += m.maxMarks; yrObt += m.obtainedMarks; }));
                const yrPct = yrMax > 0 ? Math.round(yrObt / yrMax * 100 * 10) / 10 : 0;
                const yrGrade = gradeFor(yrPct);
                const yrBar = barColor(yrPct);
                const isCurrentYr = yr === student.year;
                return (
                  <div key={yr} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'linear-gradient(135deg, #f1f5f9, #f8fafc)', borderRadius: 10, marginBottom: 12, border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <i className="fa-solid fa-calendar" style={{ color: 'var(--primary)' }}></i>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary)' }}>{yr}</span>
                        {isCurrentYr && <span style={{ fontSize: '0.65rem', background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: 50, fontWeight: 600 }}>CURRENT</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}><strong style={{ color: 'var(--secondary)' }}>{yrObt}</strong>/{yrMax} · {yrPct}%</span>
                        <span style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, color: '#fff', background: yrBar }}>{yrGrade}</span>
                      </div>
                    </div>
                    {Object.entries(subjList).map(([subj, mlist]) => {
                      let subjMax = 0, subjObt = 0;
                      mlist.forEach((m) => { subjMax += m.maxMarks; subjObt += m.obtainedMarks; });
                      const subjPct = subjMax > 0 ? Math.round(subjObt / subjMax * 100 * 10) / 10 : 0;
                      const subjGrade = gradeFor(subjPct);
                      const subjBar = barColor(subjPct);
                      return (
                        <div className="result-subject-card" key={subj}>
                          <div className="result-subject-header">
                            <div className="rsh-name"><i className="fa-solid fa-book"></i> {subj}</div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div className="rsh-score"><strong>{subjObt}</strong>/{subjMax} · {subjPct}%</div>
                              <div className={`rsh-grade ${gradeCircleClass(subjGrade)}`}>{subjGrade}</div>
                            </div>
                          </div>
                          {mlist.map((m, i) => {
                            const pct = m.maxMarks > 0 ? Math.round(m.obtainedMarks / m.maxMarks * 100) : 0;
                            const tgrade = gradeFor(pct);
                            const tBar = barColor(pct);
                            return (
                              <div className="result-test-row" key={i}>
                                <div className="rtr-name">{m.testName}</div>
                                <div className="rtr-date">{fmtDate(m.testDate)}</div>
                                <div className="rtr-bar"><div className="rtr-bar-fill" style={{ width: `${pct}%`, background: tBar }}></div></div>
                                <div className="rtr-marks">{m.obtainedMarks}/{m.maxMarks}</div>
                                <div className="rtr-pct" style={{ color: tBar }}>{pct}%</div>
                                <div className="rtr-grade"><span className={gradeClass(tgrade)}>{tgrade}</span></div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div className="result-summary">
              <div className="result-ring-wrap">
                <div className="result-ring">
                  <svg width="100" height="100">
                    <circle className="ring-bg" cx="50" cy="50" r="42" />
                    <circle className="ring-fill" cx="50" cy="50" r="42" stroke={ringColor} strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} />
                  </svg>
                  <div className="ring-text">
                    <div className="rt-val">{overallPct}%</div>
                    <div className="rt-label">Overall</div>
                  </div>
                </div>
                <div className="result-stats-grid">
                  <div className="result-stat"><div className="rs-val" style={{ color: 'var(--secondary)' }}>{totalObtained}/{totalMax}</div><div className="rs-label">Total Marks</div></div>
                  <div className="result-stat"><div className="rs-val" style={{ color: '#7c3aed' }}>{cgpa}</div><div className="rs-label">CGPA</div></div>
                  <div className="result-stat"><div className="rs-val" style={{ color: '#2563eb' }}>{totalSubjects}</div><div className="rs-label">Subjects</div></div>
                  <div className="result-stat"><div className="rs-val" style={{ color: '#15803d' }}>{passedSubjects}/{totalSubjects}</div><div className="rs-label">Passed</div></div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div className={`result-grade-circle ${gradeCircleClass(grade)}`}>{grade}</div>
                <div className={`result-stamp ${resultStatus === 'PASS' ? 'pass' : 'fail'}`}>{resultStatus}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="profile-section">
          <div className="panel"><div className="panel-body" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-clipboard-list" style={{ fontSize: '2rem', marginBottom: 10, opacity: 0.3 }}></i>
            <p>No marks records found for this student.</p>
          </div></div>
        </div>
      )}

      {/* Attendance */}
      <div className="profile-section">
        <div className="panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3><i className="fa-solid fa-calendar-check"></i> Attendance Record</h3>
          </div>
          <div className="panel-body">
            <div className="stat-mini-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
              <div className="stat-mini"><h3 style={{ color: '#15803d' }}>{attSummary.Present}</h3><p>Present</p></div>
              <div className="stat-mini"><h3 style={{ color: '#dc2626' }}>{attSummary.Absent}</h3><p>Absent</p></div>
              <div className="stat-mini"><h3 style={{ color: '#b45309' }}>{attSummary.Late}</h3><p>Late</p></div>
              <div className="stat-mini"><h3 style={{ color: attPct >= 75 ? '#15803d' : '#dc2626' }}>{attPct}%</h3><p>Overall %</p></div>
            </div>

            <div className="att-month-nav">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--secondary)' }}>Monthly View — {monthNames[calMonthNum - 1]} {calYear}</h4>
              <select value={calMonth} onChange={(e) => setCalMonth(e.target.value)}>
                {availMonths.length > 0 ? availMonths.map((ym) => {
                  const mn = parseInt(ym.slice(5, 7));
                  return <option key={ym} value={ym}>{monthNames[mn - 1]} {ym.slice(0, 4)}</option>;
                }) : <option value={new Date().toISOString().slice(0, 7)}>{monthNames[new Date().getMonth()]} {new Date().getFullYear()}</option>}
              </select>
            </div>

            <div className="att-legend">
              <span><div className="dot att-status-P"></div> Present</span>
              <span><div className="dot att-status-A"></div> Absent</span>
              <span><div className="dot att-status-L"></div> Late</span>
              <span><div className="dot att-status-N"></div> Not Marked</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Present: <strong style={{ color: '#15803d' }}>{monthPres}</strong> | Absent: <strong style={{ color: '#dc2626' }}>{monthAbs}</strong> | Late: <strong style={{ color: '#b45309' }}>{monthLate}</strong> | Total: <strong>{monthTotal}</strong> | %: <strong style={{ color: monthPct >= 75 ? '#15803d' : '#dc2626' }}>{monthPct}%</strong></span>
            </div>

            <div className="att-table-wrap">
              <table className="data-table" style={{ minWidth: 800 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 120 }}>Date</th>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                      const ds = `${calYear}-${String(calMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                      const dow = new Date(calYear, calMonthNum - 1, d).getDay();
                      const isWeekend = dow === 0 || dow === 6;
                      return <th key={d} style={{ textAlign: 'center', padding: '8px 6px', fontSize: '0.72rem', background: isWeekend ? '#fef3c7' : undefined }}>{d}<br /><span style={{ fontSize: '0.6rem', fontWeight: 400, color: 'var(--text-muted)' }}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dow]}</span></th>;
                    })}
                    <th style={{ textAlign: 'center', minWidth: 60 }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>{student.firstName} {student.lastName}</strong><br /><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{student.course}</span></td>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                      const ds = `${calYear}-${String(calMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                      const dow = new Date(calYear, calMonthNum - 1, d).getDay();
                      const isWeekend = dow === 0 || dow === 6;
                      const isFuture = ds > todayStr;
                      const st = attCalendar[ds] || '';
                      let cellClass = 'att-status-N';
                      if (st === 'Present') cellClass = 'att-status-P';
                      else if (st === 'Absent') cellClass = 'att-status-A';
                      else if (st === 'Late') cellClass = 'att-status-L';
                      if (isWeekend) return <td key={d} style={{ textAlign: 'center', padding: 6, fontSize: '0.72rem', background: '#f1f5f9', color: '#94a3b8' }} title="Weekend">—</td>;
                      if (isFuture) return <td key={d} style={{ textAlign: 'center', padding: 6, fontSize: '0.72rem', color: '#cbd5e1' }} title="Future date">—</td>;
                      return <td key={d} style={{ textAlign: 'center', padding: 6, fontSize: '0.72rem' }} className={cellClass} title={`${ds} — ${st || 'Not Marked'}`}>{st ? st[0] : '—'}</td>;
                    })}
                    <td style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 600, color: monthTotal > 0 ? (monthPct >= 75 ? '#15803d' : '#dc2626') : 'var(--text-muted)' }}>
                      {monthTotal > 0 ? `${monthPct}%` : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '20px 0 12px', color: 'var(--secondary)' }}><i className="fa-solid fa-list-ul"></i> Detailed Attendance Records — {monthNames[calMonthNum - 1]} {calYear}</h4>
            <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <table className="data-table">
                <thead><tr><th>Date</th><th>Day</th><th>Status</th></tr></thead>
                <tbody>
                  {monthAttRecords.length > 0 ? monthAttRecords.map((a, i) => (
                    <tr key={i}>
                      <td>{fmtDate(a.attendanceDate)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{new Date(a.attendanceDate).toLocaleDateString('en-IN', { weekday: 'long' })}</td>
                      <td><span className={`badge ${a.status === 'Present' ? 'badge-success' : a.status === 'Late' ? 'badge-warning' : 'badge-danger'}`}>{a.status}</span></td>
                    </tr>
                  )) : <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>No attendance records for this month.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Receipt Modal */}
      {feeReceipt && (
        <div className="modal-overlay active" onClick={() => setFeeReceipt(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-receipt"></i> Fee Receipt</h3>
              <button className="modal-close" onClick={() => setFeeReceipt(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div style={{ border: '2px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ background: '#1e293b', color: '#fff', textAlign: 'center', padding: 16 }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: 1, margin: 0 }}>EDUNEX COLLEGE</h2>
                  <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: '4px 0 0' }}>FEE PAYMENT RECEIPT</p>
                </div>
                <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 10 }}>Receipt No: <strong>EDU-FR-{String(feeReceipt._id).replace(/\D/g, '').slice(-5).padStart(5, '0')}</strong></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.82rem' }}>
                    <div><span style={{ color: '#64748b' }}>Name:</span> <strong>{student.firstName} {student.lastName}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Roll No:</span> <strong>{student.rollNumber || 'N/A'}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Course:</span> <strong>{student.course}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Year:</span> <strong>{student.year}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Email:</span> {student.email}</div>
                    <div><span style={{ color: '#64748b' }}>Phone:</span> {student.phone || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.82rem', marginBottom: 12 }}>
                    <div><span style={{ color: '#64748b' }}>Fee Type:</span> <strong>{feeReceipt.feeType}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Payment Date:</span> <strong>{fmtDate(feeReceipt.paymentDate)}</strong></div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <tbody>
                      <tr style={{ background: '#f1f5f9' }}><th style={{ textAlign: 'left', padding: '8px 12px' }}>Total Amount</th><th style={{ textAlign: 'left', padding: '8px 12px' }}>Paid Amount</th><th style={{ textAlign: 'left', padding: '8px 12px' }}>Due Amount</th></tr>
                      <tr>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{fmtINR(feeReceipt.totalAmount)}</td>
                        <td style={{ padding: '10px 12px', color: '#15803d', fontWeight: 700 }}>{fmtINR(feeReceipt.paidAmount)}</td>
                        <td style={{ padding: '10px 12px', color: '#dc2626', fontWeight: 700 }}>{fmtINR(feeReceipt.dueAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: 16, textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 30, alignItems: 'center', marginBottom: 10 }}>
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>{feeReceipt.totalAmount > 0 ? Math.round(feeReceipt.paidAmount / feeReceipt.totalAmount * 100) : 0}%</div><div style={{ fontSize: '0.7rem', color: '#64748b' }}>Payment Done</div></div>
                    <div><span className={`badge ${feeReceipt.status === 'Paid' ? 'badge-success' : feeReceipt.status === 'Partial' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.9rem', padding: '6px 20px' }}>{feeReceipt.status}</span></div>
                  </div>
                  {feeReceipt.dueAmount > 0 && <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>Note: {fmtINR(feeReceipt.dueAmount)} is still pending.</div>}
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 10 }}>This is a computer-generated receipt.<br />Generated on {new Date().toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setFeeReceipt(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
