import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import { Card, Badge, PageContainer, PageHeader, InfoPanel, OptionCard } from '../components/ui';

const AptitudeResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    // Get result data from navigation state
    if (location.state?.resultData) {
      setResultData(location.state.resultData);
    } else {
      // If no result data, redirect back
      navigate('/aptitude');
    }
  }, [location, navigate]);

  if (!resultData) {
    return null;
  }

  const { score, correctAnswers, totalQuestions, answers } = resultData;
  const percentage = score;
  const incorrectAnswers = totalQuestions - correctAnswers;

  // Determine performance level
  let performanceLevel = '';
  let performanceVariant = '';
  let performanceMessage = '';

  if (percentage >= 80) {
    performanceLevel = 'Excellent';
    performanceVariant = 'success';
    performanceMessage = 'Outstanding performance! Keep it up!';
  } else if (percentage >= 60) {
    performanceLevel = 'Good';
    performanceVariant = 'info';
    performanceMessage = 'Good job! Keep practicing to improve further.';
  } else if (percentage >= 40) {
    performanceLevel = 'Average';
    performanceVariant = 'warning';
    performanceMessage = 'You can do better! Focus on weak areas.';
  } else {
    performanceLevel = 'Needs Improvement';
    performanceVariant = 'error';
    performanceMessage = 'Keep practicing! Review concepts and try again.';
  }

  const getPerformanceBadgeVariant = () => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'error';
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Test Results"
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/aptitude')}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Take Another Test
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">

          {/* Score Card */}
          <Card className="mb-6 text-center">
            {/* Achievement Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-xl">
                <svg className="w-10 h-10 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Test Completed!
            </h2>

            <div className="mb-5">
              <Badge variant={getPerformanceBadgeVariant()} size="lg">
                {performanceLevel}
              </Badge>
            </div>

            {/* Score Circle */}
            <div className="flex justify-center mb-5">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                <svg className="transform -rotate-90 w-full h-full">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="44%"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="44%"
                    stroke="url(#scoreGradient)"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - percentage / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                      {percentage}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Score</div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {performanceMessage}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{correctAnswers}</span>
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Correct</div>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{incorrectAnswers}</span>
                </div>
                <div className="text-xs text-rose-700 dark:text-rose-300 font-medium">Incorrect</div>
              </div>
            </div>
          </Card>

          {/* Detailed Answers */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Answer Review
            </h3>

            <div className="space-y-4">
              {answers.map((answer, index) => (
                <Card key={index}>
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg w-8 h-8 flex items-center justify-center font-semibold text-sm border border-gray-200 dark:border-gray-700">
                        {index + 1}
                      </span>
                      <Badge variant={answer.isCorrect ? 'success' : 'error'} size="sm">
                        {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </Badge>
                    </div>
                  </div>

                  {/* Question */}
                  <p className="text-base font-medium text-gray-900 dark:text-white mb-4 leading-relaxed">
                    {answer.question}
                  </p>

                  {/* Your Answer */}
                  <div className={`p-3 rounded-xl mb-3 border text-sm ${
                    answer.isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800'
                  }`}>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Your Answer</span>
                    <p className={`mt-1 font-medium ${
                      answer.isCorrect
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-rose-700 dark:text-rose-300'
                    }`}>
                      {answer.userAnswer || 'Not answered'}
                    </p>
                  </div>

                  {/* Correct Answer (if wrong) */}
                  {!answer.isCorrect && (
                    <div className="p-3 rounded-xl mb-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-sm">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Correct Answer</span>
                      <p className="mt-1 font-medium text-emerald-700 dark:text-emerald-300">
                        {answer.correctAnswer}
                      </p>
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Explanation</span>
                    <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {answer.explanation}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/aptitude')}
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Take Another Test
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="secondary"
              size="lg"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AptitudeResults;
