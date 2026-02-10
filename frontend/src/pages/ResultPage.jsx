import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';

const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    if (location.state?.resultData) {
      setResultData(location.state.resultData);
    } else {
      setAlert({ type: 'error', message: 'No result data found' });
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  }, [location, navigate]);

  if (!resultData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />

        {/* Results Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Interview Results {getScoreEmoji(resultData.averageScore)}
            </h2>
            <p className="text-gray-600 mb-6">
              Role: <span className="font-semibold">{resultData.role}</span>
              {' • '}
              Level: <span className="font-semibold">{resultData.level}</span>
            </p>

            {/* Score Display Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Average Score */}
              <div className="inline-block">
                <div className={`text-6xl font-bold px-8 py-6 rounded-2xl ${getScoreColor(resultData.averageScore)}`}>
                  {resultData.averageScore}/10
                </div>
                <p className="text-gray-600 mt-3 font-medium">Answer Quality</p>
              </div>

              {/* Confidence Score */}
              {resultData.confidenceScore && (
                <div className="inline-block">
                  <div className={`text-6xl font-bold px-8 py-6 rounded-2xl ${
                    resultData.confidenceScore >= 80 ? 'text-green-600 bg-green-100' :
                    resultData.confidenceScore >= 60 ? 'text-yellow-600 bg-yellow-100' :
                    'text-orange-600 bg-orange-100'
                  }`}>
                    {resultData.confidenceScore}/100
                  </div>
                  <p className="text-gray-600 mt-3 font-medium">Confidence Score</p>
                </div>
              )}
            </div>

            {/* Score Interpretation */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-900 font-medium">
                {resultData.averageScore >= 8 && '🎯 Excellent! You demonstrated strong knowledge and skills.'}
                {resultData.averageScore >= 6 && resultData.averageScore < 8 && '✨ Good job! Keep practicing to improve further.'}
                {resultData.averageScore < 6 && '💪 Keep learning! Review the feedback below to strengthen your skills.'}
              </p>
            </div>
          </div>
        </div>

        {/* Confidence Analysis Section */}
        {resultData.confidenceScore && resultData.confidenceFeedback && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-8 mb-6 text-white">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <h3 className="text-2xl font-bold">
                📹 Confidence Analysis
              </h3>
            </div>

            {/* Confidence Level Badge */}
            <div className="mb-6">
              <div className="inline-block bg-white bg-opacity-20 px-6 py-3 rounded-full">
                <span className="text-xl font-bold">
                  {resultData.confidenceFeedback.confidenceLevel}
                </span>
              </div>
            </div>

            {/* AI Feedback */}
            <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-6 backdrop-blur-sm">
              <p className="text-lg leading-relaxed">
                {resultData.confidenceFeedback.feedback}
              </p>
            </div>

            {/* Detailed Metrics */}
            {resultData.confidenceMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-sm opacity-90 mb-1">Eye Contact</div>
                  <div className="text-3xl font-bold">{resultData.confidenceMetrics.eyeContact}%</div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
                    <div
                      className="bg-white h-2 rounded-full"
                      style={{ width: `${resultData.confidenceMetrics.eyeContact}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-sm opacity-90 mb-1">Stability</div>
                  <div className="text-3xl font-bold">{resultData.confidenceMetrics.stability}%</div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
                    <div
                      className="bg-white h-2 rounded-full"
                      style={{ width: `${resultData.confidenceMetrics.stability}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-sm opacity-90 mb-1">Expression</div>
                  <div className="text-3xl font-bold">{resultData.confidenceMetrics.expression}%</div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
                    <div
                      className="bg-white h-2 rounded-full"
                      style={{ width: `${resultData.confidenceMetrics.expression}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Improvement Tips */}
            {resultData.confidenceFeedback.improvementTips && resultData.confidenceFeedback.improvementTips.length > 0 && (
              <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
                <h4 className="font-bold text-lg mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Improvement Tips
                </h4>
                <ul className="space-y-2">
                  {resultData.confidenceFeedback.improvementTips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-300 mr-2 mt-1">▸</span>
                      <span className="flex-1">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Detailed Results */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Detailed Evaluation
          </h3>

          {resultData.questions.map((question, index) => {
            const answer = resultData.answers.find(a => a.questionId === question.id);
            const evaluation = resultData.evaluations.find(e => e.questionId === question.id);

            return (
              <div
                key={question.id}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                {/* Question Header */}
                <div className="flex items-start mb-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {question.difficulty}
                      </span>
                      <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${getScoreColor(evaluation.score)}`}>
                        {evaluation.score}/10
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      {question.question}
                    </h4>
                  </div>
                </div>

                {/* User's Answer */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Your Answer:
                  </p>
                  <p className="text-gray-800">
                    {answer?.userAnswer || 'No answer provided'}
                  </p>
                </div>

                {/* Evaluation Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Strengths */}
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <p className="font-semibold text-green-900 mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Strengths
                    </p>
                    <p className="text-green-800 text-sm">{evaluation.strengths}</p>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <p className="font-semibold text-yellow-900 mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Areas for Improvement
                    </p>
                    <p className="text-yellow-800 text-sm">{evaluation.weaknesses}</p>
                  </div>
                </div>

                {/* Improved Answer */}
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-blue-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    Suggested Improved Answer
                  </p>
                  <p className="text-blue-800 text-sm">{evaluation.improvedAnswer}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            onClick={() => navigate('/interview/start')}
            className="flex-1"
          >
            Start New Interview
          </Button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Motivational Message */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-lg">
          <h4 className="text-purple-900 font-bold mb-2">🚀 Keep Growing!</h4>
          <p className="text-purple-800 text-sm">
            Remember, every interview is a learning opportunity. Review the feedback, 
            practice regularly, and you'll continue to improve. You've got this! 💪
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
