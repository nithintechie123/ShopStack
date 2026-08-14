import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getMe, loginWithGoogle as apiLoginWithGoogle } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // On mount, refresh user from backend
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      getMe()
        .then((res) => {
          setUser(res.data);
          sessionStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiLogin(email, password);
    const { token, ...userInfo } = res.data;
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    const res = await apiLoginWithGoogle(idToken);
    const { token, ...userInfo } = res.data;
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  }, []);

  const register = useCallback(async (data) => {
    const res = await apiRegister(data);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateUser = useCallback((newUserInfo) => {
    setUser((prev) => {
      const updated = { ...prev, ...newUserInfo };
      sessionStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
