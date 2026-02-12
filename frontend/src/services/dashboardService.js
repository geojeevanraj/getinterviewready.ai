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

// Get streak and activity heatmap data
export const getStreakData = async () => {
  const response = await api.get('/dashboard/streak');
  return response.data;
};
