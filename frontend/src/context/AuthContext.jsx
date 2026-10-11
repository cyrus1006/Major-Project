import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('nutriai-token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('nutriai-user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const currentUser = response.data?.data?.user || response.data?.user || null;
        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem('nutriai-user', JSON.stringify(currentUser));
        } else {
          logout();
        }
      } catch (error) {
        console.warn('Could not refresh session:', error?.response?.data?.message || error.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [token]);

  const login = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem('nutriai-token', nextToken);
    localStorage.setItem('nutriai-user', JSON.stringify(nextUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nutriai-token');
    localStorage.removeItem('nutriai-user');
  };

  const value = useMemo(
    () => ({ token, user, loading, login, logout, setUser }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
