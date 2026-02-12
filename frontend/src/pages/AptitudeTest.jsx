import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { submitAptitudeTest } from '../services/aptitudeService';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { Card, Badge, PageContainer, PageHeader, ProgressBar, OptionCard } from '../components/ui';

const AptitudeTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [testSession, setTestSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Get test session from navigation state
    if (location.state?.testSession) {
      setTestSession(location.state.testSession);
    } else {
      // If no test session, redirect back
      navigate('/aptitude');
    }
  }, [location, navigate]);

  if (!testSession) {
    return null;
  }

  const { questions, category, difficulty, totalQuestions, _fullQuestions } = testSession;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  const handleOptionSelect = (option) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: option
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');

      // Check if all questions are answered
      const unansweredCount = questions.length - Object.keys(userAnswers).length;
      if (unansweredCount > 0) {
        const confirm = window.confirm(
          `You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`
        );
        if (!confirm) return;
      }

      setLoading(true);

      // Calculate time taken (in seconds)
      const timeTaken = Math.round((Date.now() - startTime) / 1000);

      // Format answers for submission
      const formattedAnswers = Object.entries(userAnswers).map(([questionId, selectedAnswer]) => ({
        questionId: parseInt(questionId),
        selectedAnswer
      }));

      // Submit test
      const response = await submitAptitudeTest({
        category,
        difficulty,
        answers: formattedAnswers,
        fullQuestions: _fullQuestions,
        timeTaken
      });

      if (response.success) {
        // Navigate to results page
        navigate('/aptitude/results', {
          state: {
            resultData: response.data
          }
        });
      } else {
        setError(response.message || 'Failed to submit test');
      }

    } catch (err) {
      console.error('Error submitting test:', err);
      setError(err.response?.data?.message || 'Failed to submit test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(userAnswers).length;
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title={category}
        subtitle={`Difficulty: ${difficulty}`}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {getAnsweredCount()} / {totalQuestions}
              </span>
            </div>
          </div>
        }
      />

      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress Section */}
          <div className="mb-6">
            <ProgressBar
              value={progress}
              size="lg"
              showLabel
              label={`Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
            />
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          {/* Question Card */}
          <Card className="mb-6">
            {/* Question */}
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {currentQuestionIndex + 1}
                </span>
                <p className="text-gray-900 dark:text-white text-base sm:text-lg leading-relaxed flex-1 pt-1.5">
                  {currentQuestion.question}
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const optionLabel = String.fromCharCode(65 + index);
                const isSelected = userAnswers[currentQuestion.id] === option;

                return (
                  <OptionCard
                    key={index}
                    label={optionLabel}
                    selected={isSelected}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </OptionCard>
                );
              })}
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-3 mb-6">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="secondary"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
            >
              Previous
            </Button>

            <div className="flex gap-3">
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  loading={loading}
                  variant="success"
                  size="lg"
                  leftIcon={!loading ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : undefined}
                >
                  {loading ? 'Submitting...' : 'Submit Test'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  rightIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  }
                >
                  Next
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Question Navigator</h3>
            <div className="flex flex-wrap gap-2">
              {questions.map((_, index) => {
                const isAnswered = userAnswers[questions[index].id];
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`
                      w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200
                      ${isCurrent ? 'ring-2 ring-indigo-600 dark:ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900 scale-110' : ''}
                      ${
                        isAnswered
                          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-800"></span>
                Answered
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"></span>
                Unanswered
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ring-2 ring-indigo-600 dark:ring-indigo-500 ring-offset-1"></span>
                Current
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default AptitudeTest;
