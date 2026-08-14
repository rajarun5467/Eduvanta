import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../services/api.js';

export default function StudentAttendance() {
  const { user } = useAuth();
  const [calendar, setCalendar] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    if (user?.id) API.get(`/attendance/student/${user.entityId || user.id}/calendar?month=${month}`).then(({ data }) => setCalendar(data)).catch(() => {});
  }, [user, month]);

  if (!calendar) return <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div>;

  const s = calendar.stats;
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstDayWeek = new Date(y, m - 1, 1).getDay();
  const lastDayWeek = new Date(y, m - 1, daysInMonth).getDay();
  const todayStr = new Date().toISOString().slice(0, 10);
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Build cells with leading + trailing empties
  const cells = [];
  for (let i = 0; i < firstDayWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    const isWeekend = dayName === 'Sat' || dayName === 'Sun';
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;
    const status = calendar.calendar[dateStr];
    cells.push({ day: d, dateStr, dayName, isWeekend, isToday, isFuture, status });
  }
  for (let i = 0; i < (6 - lastDayWeek); i++) cells.push(null);

  const cellStyle = (c) => {
    if (!c) return { background: 'transparent', border: 'none', boxShadow: 'none' };
    if (c.isFuture) return { background: 'transparent', border: '2px dashed var(--border)', color: 'var(--text-muted)' };
    if (c.status === 'Present') return { background: '#22c55e', color: '#fff', border: '2px solid #16a34a' };
    if (c.status === 'Absent') return { background: '#ef4444', color: '#fff', border: '2px solid #dc2626' };
    if (c.status === 'Late') return { background: '#fef9c3', color: '#854d0e', border: '2px solid #fde047' };
    return { background: '#e2e8f0', color: '#475569', border: '2px solid #cbd5e1' }; // Not Marked
  };

  const statusLabel = (c) => {
    if (!c) return '';
    if (c.isFuture) return 'Upcoming';
    if (c.status === 'Present') return 'Present';
    if (c.status === 'Absent') return 'Absent';
    if (c.status === 'Late') return 'Late';
    if (c.isWeekend) return 'Holiday';
    return 'Not Marked';
  };

  const prevMonth = () => {
    const d = new Date(y, m - 2, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const nextMonth = () => {
    const d = new Date(y, m, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <>
      {/* Welcome Banner — Green */}
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        borderRadius: '16px', padding: '32px', marginBottom: '24px', color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, position: 'relative' }}><i className="fa-solid fa-calendar-check"></i> Attendance Tracker</h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '6px', position: 'relative' }}>Track your daily attendance and stay updated</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {/* Attendance Rate */}
        <div style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #22c55e, #15803d)' }}></div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', marginBottom: '14px', background: 'linear-gradient(135deg, #22c55e, #15803d)' }}><i className="fa-solid fa-percent"></i></div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>{s.percentage}%</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>Attendance Rate</p>
          <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '50px', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{ height: '100%', borderRadius: '50px', transition: 'width 0.5s', width: `${s.percentage}%`, background: s.percentage >= 75 ? '#22c55e' : s.percentage >= 50 ? '#f59e0b' : '#ef4444' }}></div>
          </div>
        </div>
        {/* Days Present */}
        <div style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)' }}></div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', marginBottom: '14px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}><i className="fa-solid fa-check"></i></div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>{s.present}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>Days Present</p>
        </div>
        {/* Days Absent */}
        <div style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #ef4444, #dc2626)' }}></div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', marginBottom: '14px', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}><i className="fa-solid fa-xmark"></i></div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>{s.absent}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>Days Absent</p>
        </div>
        {/* Days Late */}
        <div style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}></div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', marginBottom: '14px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><i className="fa-solid fa-clock"></i></div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>{s.late}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>Days Late</p>
        </div>
      </div>

      {/* Calendar Panel */}
      <div className="panel">
        <div className="panel-header">
          <h3><i className="fa-solid fa-calendar-days" style={{ color: 'var(--primary)' }}></i> Monthly Calendar — {monthLabel}</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={prevMonth} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-light)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', cursor: 'pointer', transition: 'all 0.2s' }}><i className="fa-solid fa-chevron-left"></i></button>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontFamily: 'inherit' }} />
            <button onClick={nextMonth} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-light)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', cursor: 'pointer', transition: 'all 0.2s' }}><i className="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
        <div className="panel-body">
          {/* Legend */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#22c55e' }}></div> Present</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#ef4444' }}></div> Absent</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#fef9c3', border: '1px solid #fde047' }}></div> Late</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#e2e8f0' }}></div> Not Marked</span>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => <div key={w}>{w}</div>)}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', rowGap: '20px' }}>
            {cells.map((c, i) => (
              <div
                key={i}
                style={{
                  borderRadius: '50%', textAlign: 'center', height: '56px', width: '56px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s', cursor: c ? 'default' : 'inherit',
                  border: '2px solid transparent', position: 'relative', margin: '0 auto',
                  ...cellStyle(c),
                  ...(c?.isToday ? { border: '2px solid var(--primary)', boxShadow: '0 0 8px rgba(99,102,241,0.3)' } : {}),
                  ...(c?.isToday && c.isFuture ? { border: '2px dashed var(--primary)' } : {}),
                }}
                onMouseEnter={(e) => {
                  if (!c) return;
                  e.currentTarget.style.transform = 'scale(1.15)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.zIndex = '2';
                }}
                onMouseLeave={(e) => {
                  if (!c) return;
                  e.currentTarget.style.transform = '';
                  if (!c.isToday) e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.zIndex = '';
                }}
                title={c ? statusLabel(c) : ''}
              >
                {c && (
                  <>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>{c.day}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 600, opacity: 0.8, marginTop: '2px' }}>{statusLabel(c)}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
