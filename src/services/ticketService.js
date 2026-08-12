// Real ticket service — calls the Spring Boot backend at VITE_API_URL.
// This replaces the old localStorage-only mock implementation.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
const TOKEN_KEY = 'supportpilot_token';

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

// The backend Ticket model doesn't send a `conversation` array like the old
// mock did — normalize so existing UI code (TicketDetails.jsx etc.) keeps working.
function normalizeTicket(ticket) {
  if (!ticket) return ticket;
  return {
    ...ticket,
    subject: ticket.subject || ticket.title,
    conversation: Array.isArray(ticket.conversation) && ticket.conversation.length
      ? ticket.conversation
      : [{
          id: `message-${ticket.id}`,
          direction: 'inbound',
          channel: 'portal',
          sender: ticket.customerEmail || ticket.raisedBy || 'Customer',
          body: ticket.description || '',
          createdAt: ticket.createdAt || new Date().toISOString(),
        }],
  };
}

export const ticketService = {
  getAllTickets: async () => {
    const tickets = await request('/tickets');
    return (tickets || []).map(normalizeTicket);
  },

  getMyTickets: async () => {
    const tickets = await request('/tickets/my');
    return (tickets || []).map(normalizeTicket);
  },

  getEscalatedTickets: async () => {
    const tickets = await request('/tickets/escalated');
    return (tickets || []).map(normalizeTicket);
  },

  getTicketById: async (ticketId) => {
    const ticket = await request(`/tickets/${ticketId}`);
    return normalizeTicket(ticket);
  },

  // Backend TicketRequest only accepts: title, category, description, tags (a string).
  createTicket: async (ticketData) => {
    const ticket = await request('/tickets', {
      method: 'POST',
      body: JSON.stringify({
        title: ticketData.title,
        category: ticketData.category,
        description: ticketData.description,
        tags: Array.isArray(ticketData.tags) ? ticketData.tags.join(', ') : (ticketData.tags || ''),
      }),
    });
    return normalizeTicket(ticket);
  },

  resolveTicket: async (ticketId, resolutionData) => {
    const ticket = await request(`/tickets/${ticketId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify(resolutionData || {}),
    });
    return normalizeTicket(ticket);
  },

  escalateTicket: async (ticketId) => {
    const ticket = await request(`/tickets/${ticketId}/escalate`, {
      method: 'PUT',
    });
    return normalizeTicket(ticket);
  },

  reassignTicket: async (ticketId, agentId) => {
    const ticket = await request(`/tickets/${ticketId}/reassign`, {
      method: 'PUT',
      body: JSON.stringify({ agentId }),
    });
    return normalizeTicket(ticket);
  },

  deleteTicket: async (ticketId) => {
    return request(`/tickets/${ticketId}`, {
      method: 'DELETE',
    });
  },

  // NOTE: addConversationMessage had no backend equivalent in TicketController.
  // Leaving this as a soft no-op so calling code doesn't crash; wire up a real
  // endpoint (e.g. POST /api/tickets/{id}/messages) if you need this feature.
  addConversationMessage: async () => {
    console.warn('addConversationMessage: no backend endpoint wired up yet.');
    return null;
  },
};
