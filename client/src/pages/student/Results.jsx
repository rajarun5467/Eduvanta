import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../services/api.js';

export default function StudentResults() {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    if (user?.id) API.get('/marks', { params: { studentId: user.id } }).then(({ data }) => setMarks(data)).catch(() => {});
  }, [user]);

  return (
    <div className="panel">
      <div className="panel-header"><h3>My Results</h3></div>
      <div className="panel-body" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>Subject</th><th>Test Name</th><th>Max Marks</th><th>Obtained</th><th>Date</th></tr></thead>
          <tbody>
            {marks.map(m => (
              <tr key={m._id}>
                <td>{m.subject}</td>
                <td>{m.testName}</td>
                <td>{m.maxMarks}</td>
                <td>{m.obtainedMarks}</td>
                <td>{new Date(m.testDate).toLocaleDateString()}</td>
              </tr>
            ))}
            {marks.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>No results available</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
