import { useState, useEffect, useMemo } from 'react';
import API from '../../services/api.js';

const avatarColors = ['#2563eb', '#7c3aed', '#db2777', '#d97706', '#15803d', '#0891b2', '#b91c1c', '#4f46e5'];
const yearsList = ['1st Year', '2nd Year', '3rd Year', 'Final Year'];
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dowNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Convert a Date to YYYY-MM-DD in local timezone (IST)
const localDateStr = (d) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

export default function AdminAttendance() {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [courseFilter, setCourseFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [viewMode, setViewMode] = useState('calendar');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, secRes, attRes] = await Promise.all([
        API.get('/students'),
        API.get('/classes/sections'),
        API.get(`/attendance?month=${month}`),
      ]);
      setStudents(stuRes.data);
      setSections(secRes.data);
      setRecords(attRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [month]);

  const courses = useMemo(() => [...new Set(students.map((s) => s.course).filter(Boolean))].sort(), [students]);

  // Build attendance map: { studentId: { 'YYYY-MM-DD': status } }
  const attendanceData = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const sid = r.studentId?._id || r.studentId;
      if (!sid) return;
      const ds = localDateStr(r.attendanceDate);
      if (!map[sid]) map[sid] = {};
      map[sid][ds] = r.status;
    });
    return map;
  }, [records]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (s.status !== 'Active') return false;
      if (courseFilter && s.course !== courseFilter) return false;
      if (yearFilter && s.year !== yearFilter) return false;
      if (sectionFilter && String(s.sectionId) !== String(sectionFilter)) return false;
      return true;
    });
  }, [students, courseFilter, yearFilter, sectionFilter]);

  // Calendar calculations
  const calYear = parseInt(month.slice(0, 4));
  const calMonthNum = parseInt(month.slice(5, 7));
  const daysInMonth = new Date(calYear, calMonthNum, 0).getDate();
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const monthStart = `${month}-01`;

  // Today's stats
  const todayStats = useMemo(() => {
    const total = filteredStudents.length;
    let present = 0, absent = 0, late = 0;
    filteredStudents.forEach((s) => {
      const st = attendanceData[s._id]?.[todayStr];
      if (st === 'Present') present++;
      else if (st === 'Absent') absent++;
      else if (st === 'Late') late++;
    });
    return { total, present, absent, late, notMarked: total - present - absent - late };
  }, [filteredStudents, attendanceData, todayStr]);

  // Month stats
  const monthStats = useMemo(() => {
    let present = 0, absent = 0, late = 0, total = 0;
    Object.values(attendanceData).forEach((days) => {
      Object.entries(days).forEach(([ds, st]) => {
        if (ds >= monthStart && ds < `${month}-${String(daysInMonth).padStart(2, '0')}`.slice(0, 8) + String(daysInMonth + 1).padStart(2, '0')) {
          total++;
          if (st === 'Present') present++;
          else if (st === 'Absent') absent++;
          else if (st === 'Late') late++;
        }
      });
    });
    // Simpler: just count all records in this month
    total = 0; present = 0; absent = 0; late = 0;
    records.forEach((r) => {
      const ds = localDateStr(r.attendanceDate);
      if (ds >= monthStart && ds <= `${month}-${String(daysInMonth).padStart(2, '0')}`) {
        total++;
        if (r.status === 'Present') present++;
        else if (r.status === 'Absent') absent++;
        else if (r.status === 'Late') late++;
      }
    });
    const pct = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { total, present, absent, late, pct };
  }, [attendanceData, records, month, monthStart, daysInMonth]);

  // Low attendance students
  const lowAttendance = useMemo(() => {
    const result = [];
    filteredStudents.forEach((s) => {
      let present = 0, absent = 0, late = 0, totalMarked = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const ds = `${month}-${String(d).padStart(2, '0')}`;
        if (ds > todayStr) break;
        const st = attendanceData[s._id]?.[ds];
        if (st === 'Present') { present++; totalMarked++; }
        else if (st === 'Absent') { absent++; totalMarked++; }
        else if (st === 'Late') { late++; totalMarked++; }
      }
      const pct = totalMarked > 0 ? Math.round(((present + late) / totalMarked) * 100) : 100;
      if (totalMarked > 0 && pct < 75) {
        result.push({ name: `${s.firstName} ${s.lastName}`, course: s.course, year: s.year, pct, present, absent, late, total: totalMarked });
      }
    });
    return result;
  }, [filteredStudents, attendanceData, month, daysInMonth, todayStr]);

  // List view records
  const listRecords = useMemo(() => {
    return records
      .map((r) => {
        const stu = r.studentId;
        if (!stu || typeof stu === 'string') return null;
        if (courseFilter && stu.course !== courseFilter) return null;
        if (yearFilter && stu.year !== yearFilter) return null;
        const ds = localDateStr(r.attendanceDate);
        if (ds < monthStart || ds > `${month}-${String(daysInMonth).padStart(2, '0')}`) return null;
        return r;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate));
  }, [records, courseFilter, yearFilter, month, monthStart, daysInMonth]);

  const sectionLabel = (s) => {
    const cls = s.classId?.name || '';
    return `${cls} - ${s.name}`;
  };

  return (
    <>
      <style>{`
        .att-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:25px; }
        .att-stat-card { background:var(--white); border:1px solid var(--border); border-radius:var(--radius-lg); padding:16px 18px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:12px; }
        .att-stat-icon { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0; }
        .att-stat-card h4 { font-size:1.4rem; font-weight:700; margin:0; }
        .att-stat-card p { font-size:0.72rem; color:var(--text-muted); margin:2px 0 0; }
        .att-filters { display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; margin-bottom:20px; }
        .att-filters .form-group { flex:1; min-width:130px; margin-bottom:0; }
        .att-filters .form-group label { font-size:0.75rem; font-weight:600; color:var(--text-muted); margin-bottom:5px; display:block; }
        .att-filters .form-group select, .att-filters .form-group input { width:100%; padding:9px 12px; border:1px solid var(--border); border-radius:var(--radius-md); font-size:0.82rem; font-family:inherit; background:var(--white); color:var(--secondary); }
        .att-filters .form-group select:focus, .att-filters .form-group input:focus { outline:none; border-color:var(--primary); }
        .att-table-wrap { overflow-x:auto; }
        .att-table { min-width:800px; }
        .att-table th, .att-table td { text-align:center; font-size:0.78rem; padding:7px 5px; }
        .att-table th:first-child, .att-table td:first-child { text-align:left; min-width:170px; }
        .att-status-P { background:#dcfce7; color:#15803d; font-weight:600; }
        .att-status-A { background:#fee2e2; color:#dc2626; font-weight:600; }
        .att-status-L { background:#fef3c7; color:#b45309; font-weight:600; }
        .att-status-N { background:#f1f5f9; color:#cbd5e1; }
        .att-legend { display:flex; gap:18px; margin-bottom:15px; font-size:0.78rem; align-items:center; }
        .att-legend span { display:flex; align-items:center; gap:6px; }
        .att-legend .dot { width:14px; height:14px; border-radius:4px; }
        .att-avatar { width:28px; height:28px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:0.68rem; font-weight:700; color:#fff; flex-shrink:0; }
        .att-student-cell { display:flex; align-items:center; gap:8px; }
        .att-student-cell strong { font-size:0.8rem; display:block; }
        .att-student-cell small { font-size:0.68rem; color:var(--text-muted); }
        .att-progress { width:60px; height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden; display:inline-block; vertical-align:middle; }
        .att-progress-fill { height:100%; border-radius:3px; }
        .view-toggle { display:inline-flex; border:1px solid var(--border); border-radius:8px; overflow:hidden; }
        .view-toggle button { padding:8px 16px; border:none; background:var(--white); font-size:0.78rem; font-weight:600; cursor:pointer; font-family:inherit; color:var(--secondary); }
        .view-toggle button.active { background:var(--primary); color:#fff; }
        .alert-card { background:#fff7ed; border:1px solid #fed7aa; border-radius:var(--radius-lg); padding:16px 20px; margin-bottom:20px; }
        .alert-card h4 { color:#c2410c; font-size:0.9rem; margin:0 0 10px; }
        .alert-item { display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-bottom:1px solid #ffedd5; font-size:0.8rem; }
        .alert-item:last-child { border-bottom:none; }
        @media(max-width:768px){ .att-stats{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:480px){ .att-stats{grid-template-columns:1fr;} }
      `}</style>

      {/* Stats Cards */}
      <div className="att-stats">
        <div className="att-stat-card">
          <div className="att-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><i className="fa-solid fa-users"></i></div>
          <div><h4>{filteredStudents.length}</h4><p>Total Students</p></div>
        </div>
        <div className="att-stat-card">
          <div className="att-stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}><i className="fa-solid fa-check"></i></div>
          <div><h4 style={{ color: '#15803d' }}>{todayStats.present}</h4><p>Present Today</p></div>
        </div>
        <div className="att-stat-card">
          <div className="att-stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}><i className="fa-solid fa-xmark"></i></div>
          <div><h4 style={{ color: '#dc2626' }}>{todayStats.absent}</h4><p>Absent Today</p></div>
        </div>
        <div className="att-stat-card">
          <div className="att-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><i className="fa-solid fa-clock"></i></div>
          <div><h4 style={{ color: '#d97706' }}>{todayStats.late}</h4><p>Late Today</p></div>
        </div>
        <div className="att-stat-card">
          <div className="att-stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><i className="fa-solid fa-chart-line"></i></div>
          <div><h4 style={{ color: '#7c3aed' }}>{monthStats.pct}%</h4><p>Month Avg</p></div>
        </div>
      </div>

      {/* Low Attendance Alert */}
      {lowAttendance.length > 0 && (
        <div className="alert-card">
          <h4><i className="fa-solid fa-triangle-exclamation"></i> Low Attendance Alert — {lowAttendance.length} student(s) below 75%</h4>
          {lowAttendance.slice(0, 5).map((la, i) => (
            <div className="alert-item" key={i}>
              <div><strong>{la.name}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{la.course} · {la.year}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>P:{la.present} A:{la.absent} L:{la.late}</span>
                <div className="att-progress"><div className="att-progress-fill" style={{ width: `${la.pct}%`, background: la.pct < 50 ? '#dc2626' : '#d97706' }}></div></div>
                <strong style={{ color: la.pct < 50 ? '#dc2626' : '#d97706' }}>{la.pct}%</strong>
              </div>
            </div>
          ))}
          {lowAttendance.length > 5 && <p style={{ fontSize: '0.75rem', color: '#c2410c', marginTop: 8 }}>+ {lowAttendance.length - 5} more student(s) with low attendance</p>}
        </div>
      )}

      {/* Filters & Calendar/List View */}
      <div className="panel">
        <div className="panel-header">
          <h3><i className="fa-solid fa-calendar-days" style={{ color: 'var(--primary)' }}></i> Attendance — {monthNames[calMonthNum - 1]} {calYear}</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="view-toggle">
              <button className={viewMode === 'calendar' ? 'active' : ''} onClick={() => setViewMode('calendar')}>Calendar</button>
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>List</button>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div className="att-filters">
            <div className="form-group">
              <label>Month</label>
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Course</label>
              <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                <option value="">All Courses</option>
                {courses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                <option value="">All Years</option>
                {yearsList.map((yr) => <option key={yr} value={yr}>{yr}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Section</label>
              <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
                <option value="">All Sections</option>
                {sections.map((s) => <option key={s._id} value={s._id}>{sectionLabel(s)}</option>)}
              </select>
            </div>
          </div>

          <div className="att-legend">
            <span><div className="dot att-status-P"></div> Present</span>
            <span><div className="dot att-status-A"></div> Absent</span>
            <span><div className="dot att-status-L"></div> Late</span>
            <span><div className="dot att-status-N"></div> Not Marked</span>
          </div>

          {loading ? (
            <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i><p>Loading attendance...</p></div>
          ) : viewMode === 'calendar' ? (
            /* Calendar View */
            <div className="att-table-wrap">
              <table className="data-table att-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                      const ds = `${month}-${String(d).padStart(2, '0')}`;
                      const dow = new Date(calYear, calMonthNum - 1, d).getDay();
                      const isWeekend = dow === 0 || dow === 6;
                      const isToday = ds === todayStr;
                      return (
                        <th key={d} style={{ background: isWeekend ? '#fef3c7' : undefined, borderBottom: isToday ? '3px solid var(--primary)' : undefined }}>
                          {d}<br /><span style={{ fontSize: '0.62rem', fontWeight: 400, color: 'var(--text-muted)' }}>{dowNames[dow]}</span>
                        </th>
                      );
                    })}
                    <th style={{ minWidth: 90 }}>Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr><td colSpan={daysInMonth + 2} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '2rem', opacity: 0.3, display: 'block', marginBottom: 10 }}></i>No students found for selected filters.
                    </td></tr>
                  ) : (
                    filteredStudents.map((stu, i) => {
                      const color = avatarColors[i % avatarColors.length];
                      const initials = ((stu.firstName?.[0] || '') + (stu.lastName?.[0] || '')).toUpperCase();
                      let present = 0, absent = 0, late = 0, totalMarked = 0;
                      const cells = [];
                      for (let d = 1; d <= daysInMonth; d++) {
                        const ds = `${month}-${String(d).padStart(2, '0')}`;
                        const dow = new Date(calYear, calMonthNum - 1, d).getDay();
                        const isWeekend = dow === 0 || dow === 6;
                        const isFuture = ds > todayStr;
                        const attStatus = attendanceData[stu._id]?.[ds] || '';
                        if (!isFuture) {
                          if (attStatus === 'Present') { present++; totalMarked++; }
                          else if (attStatus === 'Absent') { absent++; totalMarked++; }
                          else if (attStatus === 'Late') { late++; totalMarked++; }
                        }
                        let cellClass = 'att-status-N';
                        let cellText = '—';
                        if (!isFuture) {
                          if (attStatus === 'Present') { cellClass = 'att-status-P'; cellText = 'P'; }
                          else if (attStatus === 'Absent') { cellClass = 'att-status-A'; cellText = 'A'; }
                          else if (attStatus === 'Late') { cellClass = 'att-status-L'; cellText = 'L'; }
                        }
                        cells.push(
                          <td key={d} className={cellClass} style={{
                            opacity: isWeekend ? 0.6 : 1,
                            boxShadow: ds === todayStr ? 'inset 0 0 0 2px var(--primary)' : undefined,
                          }}>{cellText}</td>
                        );
                      }
                      const pct = totalMarked > 0 ? Math.round(((present + late) / totalMarked) * 100) : 0;
                      return (
                        <tr key={stu._id}>
                          <td>
                            <div className="att-student-cell">
                              <div className="att-avatar" style={{ background: color }}>{initials}</div>
                              <div>
                                <strong>{stu.firstName} {stu.lastName}</strong>
                                <small>{stu.course} · {stu.year}</small>
                              </div>
                            </div>
                          </td>
                          {cells}
                          <td style={{ fontSize: '0.68rem', lineHeight: 1.4 }}>
                            {totalMarked > 0 ? (
                              <>
                                <span style={{ color: '#15803d' }}>P: {present}</span>{' '}
                                <span style={{ color: '#dc2626' }}>A: {absent}</span>{' '}
                                <span style={{ color: '#b45309' }}>L: {late}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                                  <div className="att-progress"><div className="att-progress-fill" style={{ width: `${pct}%`, background: pct >= 75 ? '#15803d' : pct >= 50 ? '#d97706' : '#dc2626' }}></div></div>
                                  <strong style={{ color: pct >= 75 ? '#15803d' : pct >= 50 ? '#d97706' : '#dc2626' }}>{pct}%</strong>
                                </div>
                              </>
                            ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* List View */
            <div className="att-table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Day</th><th>Student</th><th>Course</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {listRecords.length > 0 ? listRecords.map((r, i) => (
                    <tr key={i}>
                      <td>{new Date(r.attendanceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(r.attendanceDate).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' })}</td>
                      <td><strong>{r.studentId?.firstName} {r.studentId?.lastName}</strong></td>
                      <td style={{ fontSize: '0.78rem' }}>{r.studentId?.course} · {r.studentId?.year}</td>
                      <td><span className={`badge ${r.status === 'Present' ? 'badge-success' : r.status === 'Late' ? 'badge-warning' : 'badge-danger'}`}>{r.status}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '2rem', opacity: 0.3, display: 'block', marginBottom: 10 }}></i>No attendance records for this month.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
