import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../services/api.js';

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user?.id) API.get(`/students/${user.id}`).then(({ data }) => setProfile(data)).catch(() => {});
  }, [user]);

  if (!profile) return <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div>;

  return (
    <div className="panel">
      <div className="panel-header"><h3>My Profile</h3></div>
      <div className="panel-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div><strong>First Name:</strong> {profile.firstName}</div>
          <div><strong>Last Name:</strong> {profile.lastName}</div>
          <div><strong>Email:</strong> {profile.email}</div>
          <div><strong>Phone:</strong> {profile.phone || '-'}</div>
          <div><strong>Course:</strong> {profile.course}</div>
          <div><strong>Year:</strong> {profile.year}</div>
          <div><strong>Roll Number:</strong> {profile.rollNumber || '-'}</div>
          <div><strong>Gender:</strong> {profile.gender || '-'}</div>
          <div><strong>Parent Name:</strong> {profile.parentName || '-'}</div>
          <div><strong>Parent Phone:</strong> {profile.parentPhone || '-'}</div>
          <div><strong>Address:</strong> {profile.address || '-'}</div>
          <div><strong>Status:</strong> <span className={`badge ${profile.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{profile.status}</span></div>
        </div>
      </div>
    </div>
  );
}
