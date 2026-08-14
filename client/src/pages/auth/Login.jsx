import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
      if (data.user.role === 'student') navigate('/student');
      else if (data.user.role === 'admin') navigate('/admin');
      else navigate('/faculty');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-logo">
            <div className="logo-icon"><i className="fa-solid fa-graduation-cap"></i></div>
            <h2>EduNex Staff</h2>
            <p>Sign in as Admin, Teacher or Class Teacher</p>
          </div>
          {error && <div className="error-msg"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
          <div className="demo-creds">
            <strong>Admin:</strong> <strong>admin</strong> / <strong>admin123</strong><br />
            <strong>Teacher:</strong> faculty email prefix / <strong>teacher123</strong>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label>Username</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-user"></i>
                <input type="text" name="username" placeholder="Enter username" required value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
            </div>
            <div className="auth-form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-lock"></i>
                <input type="password" name="password" placeholder="Enter password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Signing In...</> : <>Sign In <i className="fa-solid fa-arrow-right"></i></>}
            </button>
          </form>
          <div className="login-footer">
            <Link to="/student-login"><i className="fa-solid fa-user-graduate"></i> Student</Link> &nbsp;|&nbsp;
            <Link to="/"><i className="fa-solid fa-arrow-left"></i> Website</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
