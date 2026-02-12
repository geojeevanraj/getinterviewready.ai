import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import { Card, CardContent, CardFooter, Badge, PageContainer, PageHeader, InfoPanel } from '../components/ui';

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
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
        </div>
      </PageContainer>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950';
    if (score >= 6) return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950';
    return 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950';
  };

  const getScoreBorder = (score) => {
    if (score >= 8) return 'border-emerald-200 dark:border-emerald-800';
    if (score >= 6) return 'border-amber-200 dark:border-amber-800';
    return 'border-rose-200 dark:border-rose-800';
  };

  const getScoreEmoji = (score) => {
    if (score >= 8) return '🎉';
    if (score >= 6) return '👍';
    return '💪';
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Interview Results"
        subtitle={`${resultData.role} · ${resultData.level}`}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
        }
      />

      <div className="p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: '', message: '' })}
          />

          {/* Score Header Card */}
          <Card className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Interview Results {getScoreEmoji(resultData.averageScore)}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Role: <span className="font-semibold text-gray-700 dark:text-gray-300">{resultData.role}</span>
              {' · '}
              Level: <span className="font-semibold text-gray-700 dark:text-gray-300">{resultData.level}</span>
            </p>

            {/* Score Display */}
            <div className={`grid grid-cols-1 ${resultData.confidenceScore != null ? 'sm:grid-cols-2' : ''} gap-4 max-w-2xl mx-auto`}>
              {/* Average Score */}
              <div className={`rounded-xl border p-6 ${getScoreColor(resultData.averageScore)} ${getScoreBorder(resultData.averageScore)}`}>
                <div className="text-5xl font-bold mb-1">
                  {resultData.averageScore}/10
                </div>
                <p className="text-sm font-medium opacity-80">Answer Quality</p>
              </div>

              {/* Confidence Score */}
              {resultData.confidenceScore != null && (
                <div className={`rounded-xl border p-6 ${
                  resultData.confidenceScore >= 80
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800'
                    : resultData.confidenceScore >= 60
                      ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
                      : 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
                }`}>
                  <div className="text-5xl font-bold mb-1">
                    {resultData.confidenceScore}/100
                  </div>
                  <p className="text-sm font-medium opacity-80">Confidence Score</p>
                </div>
              )}
            </div>

            {/* Score Interpretation */}
            <div className="mt-6">
              <InfoPanel
                variant={resultData.averageScore >= 8 ? 'success' : resultData.averageScore >= 6 ? 'info' : 'warning'}
                className="text-left"
              >
                {resultData.averageScore >= 8 && 'Excellent! You demonstrated strong knowledge and skills.'}
                {resultData.averageScore >= 6 && resultData.averageScore < 8 && 'Good job! Keep practicing to improve further.'}
                {resultData.averageScore < 6 && 'Keep learning! Review the feedback below to strengthen your skills.'}
              </InfoPanel>
            </div>
          </Card>

          {/* Confidence Analysis Section */}
          {resultData.confidenceScore != null && resultData.confidenceFeedback && (
            <Card className="mb-6 bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-800 text-white border-0">
              <div className="flex items-center gap-2.5 mb-5">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <h3 className="text-xl font-bold">Confidence Analysis</h3>
              </div>

              {/* Confidence Level Badge */}
              <div className="mb-5">
                <span className="inline-block bg-white/20 px-5 py-2 rounded-xl text-lg font-bold">
                  {resultData.confidenceFeedback.confidenceLevel}
                </span>
              </div>

              {/* AI Feedback */}
              <div className="bg-white/10 rounded-xl p-5 mb-5">
                <p className="text-base leading-relaxed">
                  {resultData.confidenceFeedback.feedback}
                </p>
              </div>

              {/* Detailed Metrics */}
              {resultData.confidenceMetrics && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Eye Contact', value: resultData.confidenceMetrics.eyeContact },
                    { label: 'Stability', value: resultData.confidenceMetrics.stability },
                    { label: 'Expression', value: resultData.confidenceMetrics.expression },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-white/10 rounded-xl p-4">
                      <div className="text-xs opacity-80 mb-1">{metric.label}</div>
                      <div className="text-2xl font-bold mb-2">{metric.value}%</div>
                      <div className="w-full bg-white/20 rounded-full h-1.5">
                        <div
                          className="bg-white h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Improvement Tips */}
              {resultData.confidenceFeedback.improvementTips && resultData.confidenceFeedback.improvementTips.length > 0 && (
                <div className="bg-white/10 rounded-xl p-5">
                  <h4 className="font-bold text-base mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Improvement Tips
                  </h4>
                  <ul className="space-y-2">
                    {resultData.confidenceFeedback.improvementTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-yellow-300 mt-0.5">▸</span>
                        <span className="opacity-90">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

          {/* Detailed Results */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detailed Evaluation
            </h3>
            <div className="space-y-4">
              {resultData.questions.map((question, index) => {
                const answer = resultData.answers?.find(a => a.questionId === question.id);
                const evaluation = resultData.evaluations?.find(e => e.questionId === question.id);
                const userAnswerText = answer?.userAnswer?.trim();

                return (
                  <Card key={question.id}>
                    {/* Question Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl w-9 h-9 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <Badge
                            variant={
                              question.difficulty === 'Easy' ? 'success' :
                              question.difficulty === 'Medium' ? 'warning' : 'error'
                            }
                            size="sm"
                          >
                            {question.difficulty}
                          </Badge>
                          <div className={`text-xl font-bold px-3 py-1 rounded-lg border ${
                            evaluation ? `${getScoreColor(evaluation.score)} ${getScoreBorder(evaluation.score)}` : 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                          }`}>
                            {evaluation ? `${evaluation.score}/10` : '-/10'}
                          </div>
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white leading-relaxed">
                          {question.question}
                        </h4>
                      </div>
                    </div>

                    {/* User's Answer */}
                    <div className={`mb-4 p-4 rounded-xl text-sm ${
                      userAnswerText
                        ? 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                        : 'bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800'
                    }`}>
                      <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1.5 text-xs uppercase tracking-wide">
                        Your Answer
                      </p>
                      <p className={userAnswerText ? 'text-gray-800 dark:text-gray-200 leading-relaxed' : 'text-rose-500 dark:text-rose-400 italic'}>
                        {userAnswerText || 'No answer provided'}
                      </p>
                    </div>

                    {/* Evaluation */}
                    {evaluation ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          {/* Strengths */}
                          <InfoPanel variant="success" title="Strengths">
                            <p>{evaluation.strengths || 'No strengths noted'}</p>
                          </InfoPanel>
                          {/* Weaknesses */}
                          <InfoPanel variant="warning" title="Areas for Improvement">
                            <p>{evaluation.weaknesses || 'No areas noted'}</p>
                          </InfoPanel>
                        </div>
                        {/* Improved Answer */}
                        <InfoPanel variant="info" title="Suggested Improved Answer">
                          <p>{evaluation.improvedAnswer || 'No suggestion available'}</p>
                        </InfoPanel>
                      </>
                    ) : (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-gray-400 dark:text-gray-500 italic text-sm">This question was not evaluated.</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              onClick={() => navigate('/interview/start')}
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Start New Interview
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="secondary"
              size="lg"
            >
              Dashboard
            </Button>
          </div>

          {/* Motivational Message */}
          <InfoPanel
            variant="tip"
            title="Keep Growing!"
            icon={
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
            }
          >
            <p>
              Remember, every interview is a learning opportunity. Review the feedback, 
              practice regularly, and you'll continue to improve. You've got this!
            </p>
          </InfoPanel>
        </div>
      </div>
    </PageContainer>
  );
};

export default ResultPage;
