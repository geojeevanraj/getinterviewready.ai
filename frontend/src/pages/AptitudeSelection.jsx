import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startAptitudeTest } from '../services/aptitudeService';
import Alert from '../components/Alert';
import Button from '../components/Button';
import { Card, CardContent, PageContainer, PageContent, Badge } from '../components/ui';

const AptitudeSelection = () => {
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countError, setCountError] = useState('');

  const categories = [
    {
      id: 'Quantitative Aptitude',
      name: 'Quantitative Aptitude',
      description: 'Numbers, Data Interpretation, Arithmetic',
      color: 'from-blue-500 to-cyan-500',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'Logical Reasoning',
      name: 'Logical Reasoning',
      description: 'Patterns, Puzzles, Analytical Thinking',
      color: 'from-purple-500 to-pink-500',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      id: 'Verbal Ability',
      name: 'Verbal Ability',
      description: 'Grammar, Vocabulary, Comprehension',
      color: 'from-green-500 to-teal-500',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    }
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleCountChange = (e) => {
    const value = e.target.value;
    setQuestionCount(value);

    // Validate count
    const num = parseInt(value);
    if (value === '') {
      setCountError('');
    } else if (isNaN(num)) {
      setCountError('Please enter a valid number');
    } else if (num < 5) {
      setCountError('Minimum 5 questions required');
    } else if (num > 50) {
      setCountError('Maximum 50 questions allowed');
    } else {
      setCountError('');
    }
  };

  const handleStartTest = async () => {
    try {
      setError('');
      setCountError('');

      // Validation
      if (!selectedCategory) {
        setError('Please select a category');
        return;
      }

      if (!selectedDifficulty) {
        setError('Please select a difficulty level');
        return;
      }

      const count = parseInt(questionCount);
      if (isNaN(count) || count < 5 || count > 50) {
        setCountError('Question count must be between 5 and 50');
        return;
      }

      setLoading(true);

      // Start test and get questions
      const response = await startAptitudeTest(selectedCategory, selectedDifficulty, count);

      if (response.success) {
        // Navigate to test page with questions
        navigate('/aptitude/test', {
          state: {
            testSession: response.data
          }
        });
      } else {
        setError(response.message || 'Failed to start test');
      }

    } catch (err) {
      console.error('Error starting test:', err);
      setError(err.response?.data?.message || 'Failed to start aptitude test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      {/* Header Bar */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Aptitude Practice</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Test your skills with AI-powered questions</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <PageContent maxWidth="6xl">
        <div className="space-y-6">
          {/* Main Card */}
          <Card hoverable>
            <CardContent>
              {error && (
                <div className="mb-5">
                  <Alert type="error" message={error} onClose={() => setError('')} />
                </div>
              )}

              {/* Category Selection */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <Badge variant="primary" size="sm">1</Badge>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Select Category</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map((category) => {
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`
                            group p-5 rounded-lg border transition-all duration-200 text-left
                            ${
                              selectedCategory === category.id
                                ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950 shadow-sm'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm'
                            }
                          `}
                        >
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                            <div className="w-6 h-6 text-white">
                              {category.icon}
                            </div>
                          </div>
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
                            {category.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {category.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <Badge variant="primary" size="sm">2</Badge>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Select Difficulty</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {difficulties.map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => setSelectedDifficulty(difficulty)}
                        className={`
                          py-2.5 px-4 text-sm font-medium rounded-lg transition-all
                          ${
                            selectedDifficulty === difficulty
                              ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }
                        `}
                      >
                        {difficulty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Count Input */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <Badge variant="primary" size="sm">3</Badge>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Number of Questions</h3>
                  </div>
                  <div className="max-w-md">
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={questionCount}
                      onChange={handleCountChange}
                      className={`
                        w-full px-3 py-2.5 text-sm rounded-lg transition-all
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                        placeholder-gray-400 dark:placeholder-gray-500
                        focus:outline-none focus:ring-2
                        ${
                          countError
                            ? 'border border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-transparent'
                            : 'border border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                      placeholder="Enter number (5-50)"
                    />
                    {countError ? (
                      <p className="mt-1.5 text-red-600 dark:text-red-400 text-xs">{countError}</p>
                    ) : (
                      <p className="mt-1.5 text-gray-500 dark:text-gray-400 text-xs">
                        Enter a number between 5 and 50
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleStartTest}
                  disabled={loading || !selectedCategory || !selectedDifficulty || !!countError || questionCount === ''}
                  loading={loading}
                >
                  {loading ? 'Generating Questions...' : 'Start Test'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg p-5">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">Test Instructions</h4>
                <ul className="space-y-1 text-sm text-indigo-700 dark:text-indigo-300">
                  <li>• Each question has 4 options with only one correct answer</li>
                  <li>• Navigate between questions using Next/Previous buttons</li>
                  <li>• You can change your answers before submitting</li>
                  <li>• Results will show your score and detailed explanations</li>
                  <li>• Your performance will be tracked in your dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default AptitudeSelection;
