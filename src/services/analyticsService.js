import api from './api';

export const analyticsService = {
  // Retrieves data sets for chart rendering and summary components
    getReports: async () => {
    const response = await api.get('/analytics/reports');
    return response.data;
    }
};