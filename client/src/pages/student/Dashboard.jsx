import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../services/api.js';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);

  useEffect(() => {
    if (user?.id) API.get(`/dashboard/student/${user.entityId || user.id}`).then(({ data }) => setDashData(data)).catch(() => {});
  }, [user]);

  const s = dashData?.stats || {};
  const student = dashData?.student || {};
  const monthLabel = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)',
        borderRadius: '16px', padding: '32px', marginBottom: '24px', color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-30%', right: '-10%', width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%',
        }}></div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, position: 'relative', margin: 0 }}>
          Hello, {(student.firstName || user?.firstName || 'Student').split(' ')[0]}! 👋
        </h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '6px', position: 'relative' }}>Here's your academic overview at a glance</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px', position: 'relative' }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 18px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><i className="fa-solid fa-book"></i> {student.course || user?.course || ''}</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 18px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><i className="fa-solid fa-clock"></i> {student.year || user?.year || ''}</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 18px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><i className="fa-solid fa-envelope"></i> {student.email || user?.email || ''}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {/* Attendance % */}
        <div style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #22c55e, #15803d)' }}></div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', marginBottom: '14px', background: 'linear-gradient(135deg, #22c55e, #15803d)' }}><i className="fa-solid fa-calendar-check"></i></div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>{s.attPct || 0}%</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>Attendance ({monthLabel})</p>
          <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '50px', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{ height: '100%', borderRadius: '50px', transition: 'width 0.5s', width: `${s.attPct || 0}%`, background: (s.attPct || 0) >= 75 ? '#22c55e' : (s.attPct || 0) >= 50 ? '#f59e0b' : '#ef4444' }}></div>
          </div>
        </div>
        {/* Days Present */}
        <div style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)' }}></div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', marginBottom: '14px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}><i className="fa-solid fa-circle-check"></i></div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>{s.present || 0}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>Days Present</p>
        </div>
        {/* Days Absent */}
        <div style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #ef4444, #dc2626)' }}></div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', marginBottom: '14px', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}><i className="fa-solid fa-circle-xmark"></i></div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>{s.absent || 0}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>Days Absent</p>
        </div>
        {/* Days Late */}
        <div style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}></div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', marginBottom: '14px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><i className="fa-solid fa-clock"></i></div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>{s.late || 0}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>Days Late</p>
        </div>
      </div>

      {/* Academic Summary Panel */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header">
          <h3><i className="fa-solid fa-chart-line" style={{ color: 'var(--primary)' }}></i> Academic Summary</h3>
        </div>
        <div className="panel-body">
          {/* Year stats row */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'space-around', marginBottom: '16px' }}>
            {[
              { val: `${s.totalMarks || 0}/${s.maxMarks || 0}`, lbl: 'Total Marks', color: 'var(--secondary)' },
              { val: `${s.overallPct || 0}%`, lbl: 'Overall %', color: 'var(--primary)' },
              { val: `${s.overallCgpa || 0}`, lbl: 'CGPA', color: '#7c3aed' },
              { val: s.overallGrade || '—', lbl: 'Grade', color: (s.overallPct || 0) >= 80 ? '#22c55e' : (s.overallPct || 0) >= 60 ? '#3b82f6' : (s.overallPct || 0) >= 40 ? '#f59e0b' : '#ef4444' },
              { val: s.yearCount || 0, lbl: 'Years', color: 'var(--secondary)' },
            ].map((st) => (
              <div key={st.lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: st.color }}>{st.val}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{st.lbl}</div>
              </div>
            ))}
          </div>
          {/* Per-year badges */}
          {dashData?.yearStats && Object.keys(dashData.yearStats).length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {Object.entries(dashData.yearStats).map(([yr, ys]) => (
                <div key={yr} style={{ padding: '8px 16px', background: 'var(--bg-light)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)' }}>
                  <span>{yr}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{ys.pct}%</span>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, color: '#fff', background: ys.pct >= 80 ? '#22c55e' : ys.pct >= 60 ? '#3b82f6' : ys.pct >= 40 ? '#f59e0b' : '#ef4444' }}>{ys.grade}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Tests Panel */}
      {dashData?.upcomingTests?.length > 0 && (
        <div className="panel">
          <div className="panel-header">
            <h3><i className="fa-solid fa-flask" style={{ color: 'var(--primary)' }}></i> Upcoming Tests</h3>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
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
          </div>
        </div>
      )}
    </>
  );
}
