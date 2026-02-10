import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInterviewHistory, getInterviewById, deleteInterview } from '../services/interviewService';

const InterviewHistory = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await getInterviewHistory(params);
      setInterviews(response.data.interviews || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (interviewId) => {
    try {
      const response = await getInterviewById(interviewId);
      navigate('/interview/result', {
        state: { resultData: response.data.interview }
      });
    } catch (error) {
      console.error('Error fetching interview:', error);
    }
  };

  const continueInterview = async (interview) => {
    try {
      navigate('/interview/session', {
        state: {
          interviewData: {
            interviewId: interview._id,
            role: interview.role,
            level: interview.level,
            questions: interview.questions,
            questionCount: interview.questions?.length || 0
          }
        }
      });
    } catch (error) {
      console.error('Error continuing interview:', error);
    }
  };

  const handleDeleteInterview = async (e, interviewId) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this interview? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(interviewId);
      await deleteInterview(interviewId);
      // Refresh the list
      fetchHistory();
    } catch (error) {
      console.error('Error deleting interview:', error);
      alert('Failed to delete interview. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreEmoji = (score) => {
    if (score >= 8) return '🎉';
    if (score >= 6) return '👍';
    return '💪';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">AI Interview Platform</h1>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">AI Interview Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview History</h2>
          <p className="text-gray-600">Review your past interviews and track your progress</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('started')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'started'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Progress
            </button>
          </div>
        </div>

        {/* Interviews List */}
        {interviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interviews.map((interview) => (
              <div
                key={interview._id}
                className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow ${
                  interview.status === 'completed' ? 'cursor-pointer' : ''
                }`}
                onClick={() => interview.status === 'completed' && viewDetails(interview._id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{interview.role}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {interview.level}
                      </span>
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {interview.questions?.length || 0} Questions
                      </span>
                      {interview.status === 'completed' ? (
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                          ✓ Completed
                        </span>
                      ) : (
                        <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                          ⏱ In Progress
                        </span>
                      )}
                    </div>
                  </div>
                  {interview.status === 'completed' && interview.averageScore !== null && (
                    <div className={`text-3xl font-bold px-4 py-2 rounded-xl ${getScoreColor(interview.averageScore)}`}>
                      {getScoreEmoji(interview.averageScore)} {interview.averageScore}/10
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>
                      <span className="font-semibold">Created:</span>{' '}
                      {new Date(interview.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    {interview.completedAt && (
                      <div>
                        <span className="font-semibold">Completed:</span>{' '}
                        {new Date(interview.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {interview.status === 'completed' ? (
                    <div className="mt-3">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
                        View Detailed Results →
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          continueInterview(interview);
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Continue Interview
                      </button>
                      <button
                        onClick={(e) => handleDeleteInterview(e, interview._id)}
                        disabled={deletingId === interview._id}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete this interview"
                      >
                        {deletingId === interview._id ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Interviews Found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't completed any interviews yet"
                : `No ${filter} interviews found`
              }
            </p>
            <button
              onClick={() => navigate('/interview/start')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Your First Interview
            </button>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/interview/start')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            + Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewHistory;
