import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startInterview } from '../services/interviewService';
import Button from '../components/Button';
import Alert from '../components/Alert';

const InterviewStart = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: '',
    level: 'Beginner'
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Predefined role options
  const roles = [
    'MERN Developer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'React Developer',
    'Node.js Developer',
    'JavaScript Developer',
    'DevOps Engineer',
    'Software Engineer',
    'Data Scientist',
    'Machine Learning Engineer'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const { role, level } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setAlert({ type: '', message: '' });
  };

  const validateForm = () => {
    if (!role.trim()) {
      setAlert({ type: 'error', message: 'Please select or enter a role' });
      return false;
    }
    if (!level) {
      setAlert({ type: 'error', message: 'Please select a difficulty level' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await startInterview({ role, level });
      
      if (response.success) {
        setAlert({ 
          type: 'success', 
          message: `Interview started! Generated ${response.data.questionCount} questions.` 
        });
        
        // Navigate to interview session page with interview data
        setTimeout(() => {
          navigate('/interview/session', { 
            state: { 
              interviewData: response.data 
            } 
          });
        }, 1500);
      }
    } catch (error) {
      const message = error.response?.data?.message || 
        'Failed to start interview. Please check your API key and try again.';
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">
                AI Interview Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/interview/history')}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                History
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Start Your AI Interview
          </h2>
          <p className="text-xl text-gray-600">
            Choose your role and difficulty to generate personalized questions
          </p>
        </div>

        {/* Interview Setup Form */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: '', message: '' })}
          />

          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Select Your Role
              </label>
              <select
                name="role"
                value={role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a role --</option>
                {roles.map((r, index) => (
                  <option key={index} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <p className="text-gray-500 text-xs mt-1">
                Or you can type a custom role in the field above
              </p>
            </div>

            {/* Custom Role Input */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Or Enter Custom Role
              </label>
              <input
                type="text"
                name="role"
                value={role}
                onChange={handleChange}
                placeholder="e.g., Senior React Developer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Difficulty Level */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-4">
                {levels.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setFormData({ ...formData, level: l })}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                      level === l
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mt-0.5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="text-blue-900 font-semibold mb-1">
                    What to expect:
                  </h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• 5 AI-generated questions based on your selection</li>
                    <li>• Questions tailored to the role and difficulty level</li>
                    <li>• Opportunity to practice and improve your skills</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" loading={loading}>
              {loading ? 'Generating Questions...' : 'Start Interview'}
            </Button>
          </form>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">AI Powered</h3>
            <p className="text-gray-600 text-sm">
              Questions generated using Google Gemini AI
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Personalized</h3>
            <p className="text-gray-600 text-sm">
              Questions tailored to your role and level
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Instant</h3>
            <p className="text-gray-600 text-sm">
              Get your questions in seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewStart;
