import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../services/api.js';

export default function StudentProfessors() {
  const { user } = useAuth();
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      API.get(`/dashboard/student/${user.entityId || user.id}`).then(({ data }) => {
        setProfessors(data?.professors || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  const avatarColors = ['#6366f1', '#7c3aed', '#db2777', '#d97706', '#15803d', '#0891b2', '#b91c1c', '#4f46e5'];

  return (
    <>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 50%, #155e75 100%)',
        borderRadius: '16px', padding: '32px', marginBottom: '24px', color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, position: 'relative' }}>My Professors 👨‍🏫</h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '6px', position: 'relative' }}>Faculty teaching your courses this semester</p>
      </div>

      <div className="panel">
        <div className="panel-header"><h3><i className="fa-solid fa-chalkboard-user" style={{ color: 'var(--primary)' }}></i> Faculty List</h3></div>
        <div className="panel-body" style={{ padding: 0 }}>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : professors.length === 0 ? (
            <div className="empty-state"><i className="fa-solid fa-chalkboard-user"></i><p>No professors assigned to your courses yet.</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Professor</th><th>Department</th><th>Subject</th><th>Email</th></tr></thead>
              <tbody>
                {professors.map((p, i) => {
                  const initials = p.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                  const color = avatarColors[i % avatarColors.length];
                  return (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff', background: color, flexShrink: 0 }}>{initials}</div>
                          <strong>{p.name}</strong>
                        </div>
                      </td>
                      <td>{p.department || '—'}</td>
                      <td><span className="badge badge-info">{p.subject}</span></td>
                      <td>{p.email || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
