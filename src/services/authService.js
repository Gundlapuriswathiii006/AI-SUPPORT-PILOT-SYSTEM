// Real auth — calls the Spring Boot backend at VITE_API_URL.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
const TOKEN_KEY = 'supportpilot_token';
const USER_KEY = 'supportpilot_user';

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(data?.message || 'Request failed.');
    err.response = { status: res.status, data };
    throw err;
  }
  return data;
}

function persistSession(authResponse) {
  // Backend AuthService.login/register is expected to return
  // something like { token, user } or { token, ...userFields }.
  const token = authResponse?.token;
  const user = authResponse?.user || authResponse;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { token, user };
}

export const authService = {
  register: async (userData) => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return persistSession(res);
  },

  registerAdmin: async (userData) => {
    const res = await request('/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return persistSession(res);
  },

  login: async ({ email, password }) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return persistSession(res);
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser: async () => {
    // Prefer asking the backend so the session is always validated against
    // the real DB / token, but fall back to the cached copy if offline.
    try {
      const user = await request('/auth/me');
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (e) {
      const stored = localStorage.getItem(USER_KEY);
      if (!stored) throw new Error('No session');
      return JSON.parse(stored);
    }
  },

  forgotPassword: async (email) => {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Admin-facing helpers. If your backend doesn't yet expose these as
  // /api/users endpoints, wire them up there — these calls assume it does.
  getAllUsers: async () => {
    return request('/users');
  },

  updateProfile: async (userId, updates) => {
    return request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  toggleUserStatus: async (userId) => {
    return request(`/users/${userId}/toggle-status`, {
      method: 'PUT',
    });
  },

  deleteUser: async (userId) => {
    return request(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
};
