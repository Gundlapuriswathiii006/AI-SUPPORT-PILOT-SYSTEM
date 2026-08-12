import api from './api';

const emailApiKey = import.meta.env.VITE_EMAIL_API_KEY || '';

function emailHeaders() {
  return emailApiKey ? { 'X-Email-Api-Key': emailApiKey } : {};
}

export const emailService = {
  sendNotification: async (payload) => {
    try {
      const response = await api.post('/email/notify', payload, {
        headers: emailHeaders(),
      });
      return { ...response.data, mode: response.data.mode || 'provider' };
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (!error.response) {
  throw new Error(
    'Email server is unreachable. Make sure the Java backend is running.'
  );
}
      throw error;
    }
  },

  sendTicketReply: async ({ to, subject, message, ticketId }) => {
    return emailService.sendNotification({
      email: to,
      subject,
      message,
      ticketId,
      type: 'ticket-reply',
    });
  },
};
