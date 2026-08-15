// JIRA service — talks to the Spring Boot backend's /api/jira endpoints.
// Mirrors the request pattern used by ticketService.js.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
const TOKEN_KEY = 'supportpilot_token';

async function request(path) {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export const jiraService = {
  getStatus: async () => request('/jira/status'),
  getIssues: async () => request('/jira/issues'),
};

export default jiraService;
