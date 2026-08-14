import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../auth.css';

export default function StudentLogin() {
  const { studentLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await studentLogin(email, dob);
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body student-bg">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-logo">
            <div className="logo-icon"><i className="fa-solid fa-user-graduate"></i></div>
            <h2>EduNex Student</h2>
            <p>Sign in to view your attendance &amp; marks</p>
          </div>
          {error && <div className="error-msg"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
          <div className="demo-creds">
            <strong>Use these exact demo credentials:</strong><br />
            Email: <strong>rahul@email.com</strong><br />
            DOB: <strong>2003-05-15</strong> (type as shown)
          </div>
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label>Email (Gmail)</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-envelope"></i>
                <input type="email" name="email" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="auth-form-group">
              <label>Date of Birth</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-cake-candles"></i>
                <input type="date" name="dob" required value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Signing In...</> : <>Sign In <i className="fa-solid fa-arrow-right"></i></>}
            </button>
          </form>
          <div className="login-footer">
            <Link to="/login"><i className="fa-solid fa-shield-halved"></i> Admin Login</Link> &nbsp;|&nbsp;
            <Link to="/"><i className="fa-solid fa-arrow-left"></i> Website</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
