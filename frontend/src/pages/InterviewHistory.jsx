import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInterviewHistory, getInterviewById, deleteInterview } from '../services/interviewService';
import { Card, CardContent, Badge, PageContainer, PageContent, EmptyState, LoadingSkeleton } from '../components/ui';
import Button from '../components/Button';

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
        state: { resultData: response.data }
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

  if (loading) {
    return (
      <PageContainer>
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Interview History</h1>
              </div>
            </div>
          </div>
        </header>
        <PageContent>
          <div className="space-y-4">
            <LoadingSkeleton variant="card" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LoadingSkeleton variant="card" />
              <LoadingSkeleton variant="card" />
            </div>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  const NoInterviewsIcon = () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <PageContainer>
      {/* Header Bar */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Interview History</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Review your past interviews and track progress</p>
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
      <PageContent>
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'completed' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </Button>
                <Button
                  variant={filter === 'started' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('started')}
                >
                  In Progress
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Interviews List */}
          {interviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviews.map((interview) => (
                  <Card
                    key={interview._id}
                    hoverable={interview.status === 'completed'}
                    onClick={() => interview.status === 'completed' && viewDetails(interview._id)}
                  >
                    <CardContent>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2.5">{interview.role}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="purple">{interview.level}</Badge>
                            <Badge variant="primary">{interview.questions?.length || 0} Questions</Badge>
                            {interview.status === 'completed' ? (
                              <Badge variant="success">✓ Completed</Badge>
                            ) : (
                              <Badge variant="warning">⏱ In Progress</Badge>
                            )}
                          </div>
                        </div>
                        {interview.status === 'completed' && interview.averageScore !== null && (
                          <div className="flex-shrink-0 ml-3">
                            <div className={`text-2xl font-semibold px-3 py-2 rounded-lg border ${
                              interview.averageScore >= 8 
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : interview.averageScore >= 6
                                ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            }`}>
                              {interview.averageScore}<span className="text-base text-gray-500 dark:text-gray-400">/10</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <div>
                            <span className="font-medium">Created:</span>{' '}
                            {new Date(interview.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          {interview.completedAt && (
                            <div>
                              <span className="font-medium">Completed:</span>{' '}
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
                          <Button variant="primary" size="md" fullWidth>
                            View Detailed Results →
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="md"
                              fullWidth
                              onClick={(e) => {
                                e.stopPropagation();
                                continueInterview(interview);
                              }}
                              leftIcon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                </svg>
                              }
                            >
                              Continue
                            </Button>
                            <Button
                              variant="danger"
                              size="md"
                              onClick={(e) => handleDeleteInterview(e, interview._id)}
                              loading={deletingId === interview._id}
                              leftIcon={
                                !deletingId && (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/interview/start')}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  Start New Interview
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<NoInterviewsIcon />}
              title="No Interviews Found"
              description={
                filter === 'all' 
                  ? "You haven't completed any interviews yet"
                  : `No ${filter} interviews found`
              }
              action={
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/interview/start')}
                >
                  Start Your First Interview
                </Button>
              }
            />
          )}
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default InterviewHistory;
