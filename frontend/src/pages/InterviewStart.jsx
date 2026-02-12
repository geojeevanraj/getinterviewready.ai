import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startInterview } from '../services/interviewService';
import Alert from '../components/Alert';
import Button from '../components/Button';
import { Card, CardHeader, CardContent, Badge, PageContainer, PageContent } from '../components/ui';

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
    <PageContainer>
      {/* Header Bar */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Start Interview</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Set up your practice session</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/interview/history')}
              >
                History
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <PageContent maxWidth="5xl">
        <div className="space-y-6">
          {/* Title Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Configure Your Interview
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose your role and difficulty level to generate personalized questions
            </p>
          </div>

          {/* Interview Setup Form */}
          <Card hoverable>
            <CardContent>
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ type: '', message: '' })}
              />

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Select Your Role
                  </label>
                  <select
                    name="role"
                    value={role}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    <option value="">-- Select a role --</option>
                    {roles.map((r, index) => (
                      <option key={index} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    Choose from preset roles or enter a custom one below
                  </p>
                </div>

                {/* Custom Role Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Or Enter Custom Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={role}
                    onChange={handleChange}
                    placeholder="e.g., Senior React Developer"
                    className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  />
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {levels.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setFormData({ ...formData, level: l })}
                        className={`py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${
                          level === l
                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-1.5">
                        What to expect
                      </h3>
                      <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
                        <li>• 5 AI-generated questions based on your selection</li>
                        <li>• Questions tailored to the role and difficulty level</li>
                        <li>• Opportunity to practice and improve your skills</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                >
                  {loading ? 'Generating Questions...' : 'Start Interview'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card hoverable>
              <CardContent>
                <div className="text-center">
                  <div className="bg-purple-100 dark:bg-purple-950 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-5 h-5 text-purple-600 dark:text-purple-400"
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
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">AI Powered</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Questions generated using Google Gemini AI
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card hoverable>
              <CardContent>
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-950 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400"
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
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">Personalized</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Questions tailored to your role and level
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card hoverable>
              <CardContent>
                <div className="text-center">
                  <div className="bg-orange-100 dark:bg-orange-950 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-5 h-5 text-orange-600 dark:text-orange-400"
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
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">Instant</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Get your questions in seconds
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default InterviewStart;
