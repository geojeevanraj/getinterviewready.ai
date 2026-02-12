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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI Recommendations</h1>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </header>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500/20 border-t-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI Recommendations</h1>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </header>
        <div className="flex justify-center items-center min-h-[400px] px-4">
          <div className="bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-lg p-6 text-center max-w-md">
            <p className="text-sm text-rose-600 dark:text-rose-400 mb-3">{error}</p>
            <button 
              onClick={fetchRecommendations} 
              className="bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-4 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header Bar */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI Recommendations</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Personalized learning paths based on your performance</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              {isCached && (
                <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Loaded from cache
                </div>
              )}
            </div>
            <button
              onClick={handleRefreshChallenge}
              disabled={refreshing}
              className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white py-2.5 px-4 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  New Challenge
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Weak Topics */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow transition-all p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Weak Topics</h2>
            </div>
            
            {recommendations?.weakTopics?.length > 0 ? (
              <div className="space-y-2">
                {recommendations.weakTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-md">
                    <span className="text-sm text-gray-900 dark:text-white capitalize">{topic.topic}</span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-300 rounded-full">
                      {topic.frequency}x
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Complete interviews to identify areas for improvement
              </p>
            )}
          </div>

          {/* Recommended Topics */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow transition-all p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recommended Learning</h2>
            </div>
            
            {recommendations?.recommendedTopics?.length > 0 ? (
              <div className="space-y-2">
                {recommendations.recommendedTopics.map((topic, index) => (
                  <div key={index} className="flex items-start gap-2.5 p-3 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-md">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-xs font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">{topic}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI will suggest topics based on your weak areas
              </p>
            )}
          </div>

          {/* Daily Challenge */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 border-2 border-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-white">Daily Challenge</h2>
            </div>
            
            {recommendations?.dailyChallenge ? (
              <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-md p-3.5">
                  <p className="text-sm font-medium text-white/70 mb-1.5">Challenge</p>
                  <p className="text-base font-semibold text-white">
                    {recommendations.dailyChallenge.title}
                  </p>
                  {recommendations.dailyChallenge.description && (
                    <p className="text-sm text-white/80 mt-2 leading-relaxed">
                      {recommendations.dailyChallenge.description}
                    </p>
                  )}
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-md p-3.5">
                  <p className="text-sm font-medium text-white mb-2.5">Difficulty</p>
                  <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                    recommendations.dailyChallenge.difficulty === 'Easy' 
                      ? 'bg-emerald-500 text-white'
                      : recommendations.dailyChallenge.difficulty === 'Medium'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}>
                    {recommendations.dailyChallenge.difficulty}
                  </span>
                </div>
                
                {!recommendations.completed && (
                  <button
                    onClick={handleCompleteChallenge}
                    disabled={completingChallenge}
                    className="w-full bg-white hover:bg-gray-50 text-indigo-600 py-2.5 px-4 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {completingChallenge ? 'Completing...' : 'Mark as Completed'}
                  </button>
                )}
                
                {recommendations.completed && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-md">
                    <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-white">Challenge Completed!</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/70">
                New challenges are generated after completing interviews
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-6 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all"
          >
            View Dashboard
          </button>
          <button
            onClick={() => navigate('/interview/start')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-6 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all"
          >
            Start New Interview
          </button>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-1.5">How Recommendations Work</h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                Our AI analyzes your interview performance to identify weak topics. Based on this analysis, 
                we recommend focused learning areas and generate a personalized daily challenge. 
                Challenges refresh every 24 hours to keep you consistently improving.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-rose-600 rounded-lg flex items-center justify-center mx-auto mb-3.5">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Confirm Action</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                This will clear your current challenge and generate a new one. Continue?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-6 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmRefresh}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-6 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all"
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
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3.5">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {successMessage}
              </p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-6 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all"
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
