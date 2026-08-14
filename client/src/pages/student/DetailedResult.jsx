import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../services/api.js';

const gradeScale = [
  { grade: 'A+', range: '90-100', gp: 10, color: '#16a34a' },
  { grade: 'A', range: '80-89', gp: 9, color: '#0d9488' },
  { grade: 'B+', range: '70-79', gp: 8, color: '#2563eb' },
  { grade: 'B', range: '60-69', gp: 7, color: '#9333ea' },
  { grade: 'C', range: '50-59', gp: 6, color: '#d97706' },
  { grade: 'D', range: '40-49', gp: 5, color: '#ea580c' },
  { grade: 'F', range: '<40', gp: 0, color: '#dc2626' },
];

const computeGrade = (pct) => {
  if (pct >= 90) return gradeScale[0];
  if (pct >= 80) return gradeScale[1];
  if (pct >= 70) return gradeScale[2];
  if (pct >= 60) return gradeScale[3];
  if (pct >= 50) return gradeScale[4];
  if (pct >= 40) return gradeScale[5];
  return gradeScale[6];
};

export default function StudentDetailedResult() {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [selectedYear, setSelectedYear] = useState('1st Year');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      API.get('/marks', { params: { studentId: user.entityId || user.id } }).then(({ data }) => {
        setMarks(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  // Group marks by year -> semester -> subject
  const yearMarks = marks.filter((m) => (m.year || 'Current') === selectedYear);
  const semData = {};
  yearMarks.forEach((m) => {
    const sem = m.semester || 1;
    const code = m.subjectCode || m.subject;
    if (!semData[sem]) semData[sem] = {};
    if (!semData[sem][code]) {
      semData[sem][code] = { subject: m.subject, subjectCode: m.subjectCode || '', subjectType: m.subjectType || 'Theory', credits: m.credits || 4, tests: [], totalMax: 0, totalObt: 0 };
    }
    semData[sem][code].tests.push(m);
    semData[sem][code].totalMax += m.maxMarks;
    semData[sem][code].totalObt += m.obtainedMarks;
  });

  // Compute stats
  let totalCredits = 0, totalWeightedGp = 0, totalMax = 0, totalObt = 0, hasFail = false;
  Object.values(semData).forEach((subjects) => {
    Object.values(subjects).forEach((subj) => {
      const pct = subj.totalMax > 0 ? Math.round((subj.totalObt / subj.totalMax) * 100 * 100) / 100 : 0;
      const g = computeGrade(pct);
      subj.pct = pct;
      subj.grade = g.grade;
      subj.gp = g.gp;
      subj.color = g.color;
      totalCredits += subj.credits;
      totalWeightedGp += subj.gp * subj.credits;
      totalMax += subj.totalMax;
      totalObt += subj.totalObt;
      if (g.grade === 'F') hasFail = true;
    });
  });
  const overallPct = totalMax > 0 ? Math.round((totalObt / totalMax) * 100 * 100) / 100 : 0;
  const sgpa = totalCredits > 0 ? Math.round((totalWeightedGp / totalCredits) * 100) / 100 : 0;
  const overallGrade = computeGrade(overallPct);

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year'];

  return (
    <>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
        borderRadius: '16px', padding: '32px', marginBottom: '24px', color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, position: 'relative' }}>Detailed Result 📊</h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '6px', position: 'relative' }}>Complete academic transcript with grades and SGPA</p>
      </div>

      {/* Year selector */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid var(--border)', overflowX: 'auto' }}>
        {years.map((yr) => (
          <button
            key={yr}
            onClick={() => setSelectedYear(yr)}
            style={{
              padding: '12px 24px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
              border: 'none', background: 'none', borderBottom: '3px solid transparent', marginBottom: '-2px',
              whiteSpace: 'nowrap', transition: 'all 0.25s', fontFamily: 'inherit',
              color: selectedYear === yr ? 'var(--primary)' : 'var(--text-muted)',
              borderBottomColor: selectedYear === yr ? 'var(--primary)' : 'transparent',
            }}
          >
            {yr}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div>
      ) : Object.keys(semData).length === 0 ? (
        <div className="panel">
          <div className="panel-body">
            <div className="empty-state"><i className="fa-solid fa-file-lines"></i><p>No marks available for {selectedYear}.</p></div>
          </div>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
            <div className="stat-card" style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>{totalObt}/{totalMax}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Total Marks</p>
            </div>
            <div className="stat-card" style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>{overallPct}%</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Overall Percentage</p>
            </div>
            <div className="stat-card" style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7c3aed', margin: 0 }}>{sgpa}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>SGPA</p>
            </div>
            <div className="stat-card" style={{ background: 'var(--white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: overallGrade.color, margin: 0 }}>{overallGrade.grade}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Grade {hasFail ? '(Has Fail)' : ''}</p>
            </div>
          </div>

          {/* Semester-wise results */}
          {Object.keys(semData).sort((a, b) => a - b).map((sem) => (
            <div key={sem} className="panel" style={{ marginBottom: '24px' }}>
              <div className="panel-header"><h3><i className="fa-solid fa-layer-group" style={{ color: 'var(--primary)' }}></i> Semester {sem}</h3></div>
              <div className="panel-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead><tr><th>Subject</th><th>Code</th><th>Type</th><th>Credits</th><th>Obtained</th><th>Max</th><th>%</th><th>Grade</th><th>GP</th></tr></thead>
                  <tbody>
                    {Object.values(semData[sem]).map((subj, i) => (
                      <tr key={i}>
                        <td><strong>{subj.subject}</strong></td>
                        <td>{subj.subjectCode || '—'}</td>
                        <td><span className="badge badge-info">{subj.subjectType}</span></td>
                        <td>{subj.credits}</td>
                        <td>{subj.totalObt}</td>
                        <td>{subj.totalMax}</td>
                        <td style={{ fontWeight: 600 }}>{subj.pct}%</td>
                        <td><span style={{ padding: '4px 12px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 600, color: '#fff', background: subj.color }}>{subj.grade}</span></td>
                        <td>{subj.gp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Grade Scale */}
          <div className="panel">
            <div className="panel-header"><h3><i className="fa-solid fa-scale-balanced" style={{ color: 'var(--primary)' }}></i> Grade Scale</h3></div>
            <div className="panel-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
                {gradeScale.map((g) => (
                  <div key={g.grade} style={{ textAlign: 'center', padding: '14px 8px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-light)' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#fff', background: g.color, margin: '0 auto 8px' }}>{g.grade}</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--secondary)' }}>{g.range}%</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>GP: {g.gp}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
