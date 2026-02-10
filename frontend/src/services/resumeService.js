import api from '../utils/axios';

// Upload resume for analysis
export const uploadResume = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await api.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  });

  return response.data;
};

// Get resume history
export const getResumeHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/resume/history', {
    params: { page, limit }
  });
  return response.data;
};

// Get single resume analysis
export const getResumeById = async (resumeId) => {
  const response = await api.get(`/resume/${resumeId}`);
  return response.data;
};

// Delete resume
export const deleteResume = async (resumeId) => {
  const response = await api.delete(`/resume/${resumeId}`);
  return response.data;
};
