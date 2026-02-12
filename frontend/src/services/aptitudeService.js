import api from '../utils/axios';

/**
 * Start a new aptitude test
 * @param {string} category - Category (Quantitative Aptitude, Logical Reasoning, Verbal Ability)
 * @param {string} difficulty - Difficulty (Easy, Medium, Hard)
 * @param {number} count - Number of questions (5-50)
 */
export const startAptitudeTest = async (category, difficulty, count) => {
  const response = await api.post('/aptitude/start', {
    category,
    difficulty,
    count
  });
  return response.data;
};

/**
 * Submit aptitude test answers
 * @param {object} testData - Test submission data
 */
export const submitAptitudeTest = async (testData) => {
  const response = await api.post('/aptitude/submit', testData);
  return response.data;
};

/**
 * Get aptitude test history
 */
export const getAptitudeHistory = async () => {
  const response = await api.get('/aptitude/history');
  return response.data;
};

/**
 * Get specific test result by ID
 * @param {string} resultId - Result ID
 */
export const getAptitudeResult = async (resultId) => {
  const response = await api.get(`/aptitude/result/${resultId}`);
  return response.data;
};

/**
 * Get aptitude statistics for dashboard
 */
export const getAptitudeStats = async () => {
  const response = await api.get('/aptitude/stats');
  return response.data;
};
