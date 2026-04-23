import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api';
import { setOnUnauthorized } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // Auto-logout on any 401 response
  useEffect(() => {
    setOnUnauthorized(logout);
  }, [logout]);

  // Auto-login: check if cookie is still valid on page load
  useEffect(() => {
    api.getMe()
      .then((data) => setUser(data.data.user))
      .catch(() => {}) // no valid cookie, stay logged out
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.data.user);
  };

  const signup = async (fullname, email, password) => {
    await api.signup(fullname, email, password);
    await login(email, password);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
