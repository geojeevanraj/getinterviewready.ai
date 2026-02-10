import api from '../utils/axios';

// Get dashboard summary with analytics
export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

// Get detailed statistics
export const getDetailedStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};
