import { useState, useEffect } from 'react';
import { getRecommendations, completeChallenge, clearCache } from '../services/recommendationsService';
import { useNavigate } from 'react-router-dom';

const Recommendations = () => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');
  const [completingChallenge, setCompletingChallenge] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getRecommendations();
      
      if (data.success) {
        setRecommendations(data.data);
        setIsCached(data.cached || false);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.response?.data?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshChallenge = async () => {
    setShowConfirmModal(true);
  };

  const confirmRefresh = async () => {
    setShowConfirmModal(false);

    try {
      setRefreshing(true);
      await clearCache();
      await fetchRecommendations();
      setSuccessMessage('✨ New challenge generated!');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error refreshing challenge:', err);
      setError(err.response?.data?.message || 'Failed to refresh challenge');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCompleteChallenge = async () => {
    if (!recommendations?._id) return;

    try {
      setCompletingChallenge(true);
      const data = await completeChallenge(recommendations._id);
      
      if (data.success) {
        setRecommendations(data.data);
        setSuccessMessage('🎉 Challenge completed! Great job!');
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Error completing challenge:', err);
      setError(err.response?.data?.message || 'Failed to complete challenge');
    } finally {
      setCompletingChallenge(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
          <p className="text-gray-600 mt-2">
            Personalized learning paths and daily challenges based on your interview performance
          </p>
          {isCached && (
            <div className="mt-2 flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Loaded from cache (instant)
            </div>
          )}
        </div>
        <button
          onClick={handleRefreshChallenge}
          disabled={refreshing}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {refreshing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Refreshing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Force New Challenge
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weak Topics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Weak Topics</h2>
          </div>
          
          {recommendations?.weakTopics?.length > 0 ? (
            <div className="space-y-2">
              {recommendations.weakTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-800 capitalize">{topic.topic}</span>
                  <span className="px-2 py-1 text-xs font-semibold bg-red-200 text-red-800 rounded-full">
                    {topic.frequency}x
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Complete interviews to identify areas for improvement
            </p>
          )}
        </div>

        {/* Recommended Topics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Recommended Learning</h2>
          </div>
          
          {recommendations?.recommendedTopics?.length > 0 ? (
            <div className="space-y-2">
              {recommendations.recommendedTopics.map((topic, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <span className="inline-block w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-800">{topic}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              AI will suggest topics based on your weak areas
            </p>
          )}
        </div>

        {/* Daily Challenge */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white lg:col-span-1">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-xl font-semibold">Daily Challenge</h2>
          </div>

          {recommendations?.dailyChallenge ? (
            <div className="space-y-4">
              <div>
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(recommendations.dailyChallenge.difficulty)} mb-3`}>
                  {recommendations.dailyChallenge.difficulty}
                </span>
                <h3 className="text-lg font-semibold mb-2">
                  {recommendations.dailyChallenge.title}
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  {recommendations.dailyChallenge.description}
                </p>
              </div>

              {!recommendations.completed ? (
                <button
                  onClick={handleCompleteChallenge}
                  disabled={completingChallenge}
                  className="w-full mt-4 px-4 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {completingChallenge ? 'Completing...' : 'Mark as Completed'}
                </button>
              ) : (
                <div className="mt-4 p-3 bg-white/20 rounded-lg text-center">
                  <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-semibold">Challenge Completed!</p>
                  <p className="text-sm text-white/80 mt-1">
                    Come back tomorrow for a new challenge
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-white/80 text-sm">
              Complete interviews to unlock daily challenges
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          View Dashboard
        </button>
        <button
          onClick={() => navigate('/interview/start')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Start New Interview
        </button>
      </div>

      {/* Info Card */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">How Recommendations Work</h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              Our AI analyzes your interview performance to identify weak topics. Based on this analysis, 
              we recommend focused learning areas and generate a personalized daily challenge. 
              Challenges refresh every 24 hours to keep you consistently improving.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/90 border border-white/20 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Action</h3>
              <p className="text-gray-700 leading-relaxed">
                This will clear your current challenge and generate a new one. Continue?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmRefresh}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/90 border border-white/20 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {successMessage}
              </p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-green-500/50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
