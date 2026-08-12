// Admin service — local-storage backed, consistent with authService/ticketService.
// (There is no real backend in this project; everything runs client-side.)

import { authService } from './authService';
import { ticketService } from './ticketService';
import { knowledgeBaseService } from './knowledgeBaseService';

const SETTINGS_KEY = 'supportpilot_settings';

const DEFAULT_SETTINGS = {
  siteName: 'SupportPilot',
  supportEmail: 'support@supportpilot.ai',
  autoAssignTickets: true,
  aiClassificationEnabled: true,
};

export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const tickets = await ticketService.getAllTickets();
    const users = await authService.getAllUsers();

    const openTickets = tickets.filter((t) => t.status === 'open').length;
    const resolvedTickets = tickets.filter((t) => t.status === 'resolved').length;
    const slaBreached = tickets.filter((t) => t.status === 'open' && t.priority === 'High').length;
    const aiResolved = tickets.filter((t) => t.status === 'resolved' && t.aiClassified).length;

    return {
      totalTickets: tickets.length,
      openTickets,
      resolvedTickets,
      slaBreached,
      totalUsers: users.length,
      aiResolved,
    };
  },

  getRecentTickets: async () => {
    const tickets = await ticketService.getAllTickets();
    const users = await authService.getAllUsers();
    const userNameById = new Map(users.map((u) => [u.id, u.name]));

    return [...tickets]
      .sort((a, b) => new Date(b.createdAtISO || b.createdAt) - new Date(a.createdAtISO || a.createdAt))
      .slice(0, 5)
      .map((t) => ({
        ...t,
        raisedBy: t.raisedBy || userNameById.get(t.userId) || 'Unknown',
      }));
  },

  // User Management
  getAllUsers: async () => authService.getAllUsers(),

  createUser: async (userData) => {
    const result = await authService.register({ ...userData, password: userData.password || 'changeme123' });
    return result.user;
  },

  updateUser: async (userId, userData) => authService.updateProfile(userId, userData),

  deleteUser: async (userId) => authService.deleteUser(userId),

  toggleUserStatus: async (userId) => authService.toggleUserStatus(userId),

  // Ticket Monitoring
  getAllTickets: async () => ticketService.getAllTickets(),

  reassignTicket: async (ticketId, agentId) => ticketService.reassignTicket(ticketId, agentId),

  escalateTicket: async (ticketId) => ticketService.escalateTicket(ticketId),

  // Reports
  getReports: async (filters = {}) => {
    const tickets = await ticketService.getAllTickets();
    const byCategory = {};
    tickets.forEach((t) => {
      const key = t.category || 'Uncategorized';
      byCategory[key] = (byCategory[key] || 0) + 1;
    });
    return {
      filters,
      totalTickets: tickets.length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
      byCategory,
    };
  },

  // Knowledge Base (delegates to the shared service also used by Employee/Support)
  getKnowledgeBaseArticles: async () => knowledgeBaseService.getArticles(),

  createKnowledgeBaseArticle: async (articleData) => knowledgeBaseService.createArticle(articleData),

  updateKnowledgeBaseArticle: async (articleId, articleData) =>
    knowledgeBaseService.updateArticle(articleId, articleData),

  deleteKnowledgeBaseArticle: async (articleId) => knowledgeBaseService.deleteArticle(articleId),

  // System Settings
  getSystemSettings: async () => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  updateSystemSettings: async (settingsData) => {
    const current = await adminService.getSystemSettings();
    const updated = { ...current, ...settingsData };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  },

  // Profile
  getAdminProfile: async () => {
    const stored = localStorage.getItem('supportpilot_user');
    if (!stored) throw new Error('No session');
    return JSON.parse(stored);
  },

  updateAdminProfile: async (profileData) => {
    const stored = JSON.parse(localStorage.getItem('supportpilot_user') || 'null');
    if (!stored) throw new Error('No session');
    return authService.updateProfile(stored.id, profileData);
  },
};

export default adminService;
