import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin') || 'null'); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  async function login(username, password) {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      if (data.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        setAdmin(data.admin);
      }
      return data;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
  }

  useEffect(() => {
    // On first load, try fetching /me to validate token (silently)
    const token = localStorage.getItem('token');
    if (token && !admin) {
      api.get('/auth/me')
        .then(({ data }) => {
          if (data.ok) {
            localStorage.setItem('admin', JSON.stringify(data.admin));
            setAdmin(data.admin);
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
