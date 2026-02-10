import api from '../utils/axios';

// Get daily recommendations
export const getRecommendations = async () => {
  const response = await api.get('/recommendations');
  return response.data;
};

// Complete a challenge
export const completeChallenge = async (recommendationId) => {
  const response = await api.put(`/recommendations/challenge/${recommendationId}/complete`);
  return response.data;
};

// Get challenge history
export const getChallengeHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/recommendations/history', {
    params: { page, limit }
  });
  return response.data;
};

// Clear user's cache (force new challenge)
export const clearCache = async () => {
  const response = await api.delete('/recommendations/cache');
  return response.data;
};

// Get cache statistics
export const getCacheStats = async () => {
  const response = await api.get('/recommendations/cache/stats');
  return response.data;
};
