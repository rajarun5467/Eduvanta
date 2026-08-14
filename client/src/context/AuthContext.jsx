import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await API.post('/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const studentLogin = useCallback(async (email, dob) => {
    const { data } = await API.post('/auth/student-login', { email, dob });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ ...data.student, role: 'student' }));
    setUser({ ...data.student, role: 'student' });
    return data;
  }, []);

  const logout = useCallback(async () => {
    const activityId = user?.activityId;
    try { await API.post('/auth/logout', { activityId }); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, [user]);

  const value = { user, loading, login, studentLogin, logout, setUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
