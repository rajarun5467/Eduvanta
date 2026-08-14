import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../services/api.js';

export default function StudentTests() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      API.get(`/dashboard/student/${user.entityId || user.id}`).then(({ data }) => {
        setTests(data?.upcomingTests || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  return (
    <>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
        borderRadius: '16px', padding: '32px', marginBottom: '24px', color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, position: 'relative' }}>Upcoming Tests 📝</h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '6px', position: 'relative' }}>Stay prepared for your upcoming examinations</p>
      </div>

      <div className="panel">
        <div className="panel-header"><h3><i className="fa-solid fa-flask" style={{ color: 'var(--primary)' }}></i> Test Schedule</h3></div>
        <div className="panel-body" style={{ padding: 0 }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : tests.length === 0 ? (
            <div className="empty-state"><i className="fa-solid fa-flask"></i><p>No upcoming tests scheduled.</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Test Name</th><th>Subject</th><th>Course</th><th>Year</th><th>Date</th><th>Max Marks</th><th>Days Left</th></tr></thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t._id}>
                    <td><strong>{t.testName}</strong></td>
                    <td>{t.subject}</td>
                    <td>{t.course}</td>
                    <td>{t.year}</td>
                    <td>{new Date(t.testDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>{t.maxMarks}</td>
                    <td><span className={`badge ${t.daysLeft <= 3 ? 'badge-danger' : t.daysLeft <= 7 ? 'badge-warning' : 'badge-info'}`}>{t.daysLeft}d</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
