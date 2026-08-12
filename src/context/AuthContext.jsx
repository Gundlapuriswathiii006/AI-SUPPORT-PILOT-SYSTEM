import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('supportpilot_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('supportpilot_token') || '';
  });

  const [loading, setLoading] = useState(true);

  // Set Authorization header whenever token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  // Restore user session on page refresh
  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        localStorage.setItem(
          'supportpilot_user',
          JSON.stringify(userData)
        );
      } catch (error) {
        console.log('No active session.');

        setUser(null);
        setToken('');

        localStorage.removeItem('supportpilot_user');
        localStorage.removeItem('supportpilot_token');

        delete api.defaults.headers.common.Authorization;
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  // Login
  const login = async (credentials) => {
    const data = await authService.login(credentials);

    setUser(data.user);
    setToken(data.token);

    localStorage.setItem(
      'supportpilot_user',
      JSON.stringify(data.user)
    );
    localStorage.setItem(
      'supportpilot_token',
      data.token
    );

    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

    return data.user;
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken('');

    localStorage.removeItem('supportpilot_user');
    localStorage.removeItem('supportpilot_token');

    delete api.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        setLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};