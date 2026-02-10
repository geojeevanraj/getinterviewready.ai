import api from '../utils/axios';

// Start new interview
export const startInterview = async (interviewData) => {
  const response = await api.post('/interview/start', interviewData);
  return response.data;
};

// Get interview history
export const getInterviewHistory = async (params = {}) => {
  const { status, limit, page } = params;
  const queryParams = new URLSearchParams();
  
  if (status) queryParams.append('status', status);
  if (limit) queryParams.append('limit', limit);
  if (page) queryParams.append('page', page);
  
  const response = await api.get(`/interview/history?${queryParams.toString()}`);
  return response.data;
};

// Get interview by ID
export const getInterviewById = async (id) => {
  const response = await api.get(`/interview/${id}`);
  return response.data;
};

// Submit answer for a question
export const submitAnswer = async (interviewId, answerData) => {
  const response = await api.put(`/interview/${interviewId}/answer`, answerData);
  return response.data;
};

// Complete interview
export const completeInterview = async (interviewId) => {
  const response = await api.put(`/interview/${interviewId}/complete`);
  return response.data;
};

// Delete interview
export const deleteInterview = async (interviewId) => {
  const response = await api.delete(`/interview/${interviewId}`);
  return response.data;
};

// Submit interview for AI evaluation
export const submitInterview = async (interviewId, answers, confidenceMetrics = null) => {
  const payload = {
    interviewId,
    answers
  };
  
  // Include confidence metrics if provided
  if (confidenceMetrics) {
    payload.confidenceMetrics = confidenceMetrics;
  }
  
  const response = await api.post('/interview/submit', payload);
  return response.data;
};
