import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { Card, CardContent, Badge, PageContainer, ProgressBar, InfoPanel } from '../components/ui';
import { submitInterview } from '../services/interviewService';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { readQuestion, stopReading } from '../utils/textToSpeech';
import { getCompatibilityStatus, checkAllCompatibility } from '../utils/browserCompatibility';
import BrowserCompatibilityNotice, { DetailedCompatibilityReport } from '../components/BrowserCompatibilityNotice';
import CameraInterview from '../components/CameraInterview';

const InterviewSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [interviewData, setInterviewData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(null); // Track which question is being read
  const [showCompatibilityDetails, setShowCompatibilityDetails] = useState(false);
  
  // NEW: Question navigation state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [cameraPosition, setCameraPosition] = useState('left'); // 'left' or 'right'
  
  // Confidence metrics state
  const [enableCamera, setEnableCamera] = useState(false);
  const [confidenceMetrics, setConfidenceMetrics] = useState(null);
  const [showCameraSetup, setShowCameraSetup] = useState(true);
  
  // Check browser compatibility
  const compatibilityStatus = getCompatibilityStatus();
  const fullCompatibilityReport = checkAllCompatibility();
  
  // Speech recognition hook
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript
  } = useSpeechRecognition();

  useEffect(() => {
    // Get interview data from navigation state
    if (location.state?.interviewData) {
      const data = location.state.interviewData;
      setInterviewData(data);
      
      // Try to restore saved answers from localStorage
      const savedKey = `interview_answers_${data.interviewId}`;
      const savedAnswers = localStorage.getItem(savedKey);
      if (savedAnswers) {
        try {
          const parsed = JSON.parse(savedAnswers);
          setAnswers(parsed);
          setAlert({ type: 'info', message: 'Previous answers restored automatically.' });
          setTimeout(() => setAlert({ type: '', message: '' }), 3000);
        } catch {
          // Fallback: initialize empty answers
          const initialAnswers = {};
          data.questions.forEach(q => { initialAnswers[q.id] = ''; });
          setAnswers(initialAnswers);
        }
      } else {
        // Initialize empty answers
        const initialAnswers = {};
        data.questions.forEach(q => { initialAnswers[q.id] = ''; });
        setAnswers(initialAnswers);
      }
    } else {
      // Redirect if no interview data
      setAlert({ type: 'error', message: 'No interview session found' });
      setTimeout(() => navigate('/interview/start'), 2000);
    }
  }, [location, navigate]);

  // Auto-save answers to localStorage
  useEffect(() => {
    if (interviewData?.interviewId && Object.keys(answers).length > 0) {
      const hasContent = Object.values(answers).some(a => a.trim() !== '');
      if (hasContent) {
        localStorage.setItem(
          `interview_answers_${interviewData.interviewId}`,
          JSON.stringify(answers)
        );
      }
    }
  }, [answers, interviewData]);

  // Update answer when speech recognition transcript changes
  useEffect(() => {
    if (activeQuestionId && transcript) {
      setAnswers(prev => ({
        ...prev,
        [activeQuestionId]: transcript
      }));
    }
  }, [transcript, activeQuestionId]);

  // Show speech error
  useEffect(() => {
    if (speechError) {
      setAlert({ type: 'warning', message: speechError });
    }
  }, [speechError]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleStartRecording = (questionId) => {
    stopReading();
    setIsSpeaking(null);
    setTranscript(answers[questionId] || '');
    setActiveQuestionId(questionId);
    resetTranscript();
    startListening();
  };

  const handleStopRecording = () => {
    stopListening();
  };

  const handleReadQuestion = async (questionId, questionText) => {
    if (isSpeaking === questionId) {
      stopReading();
      setIsSpeaking(null);
      return;
    }
    stopReading();
    setIsSpeaking(questionId);
    try {
      await readQuestion(questionText, {
        onEnd: () => setIsSpeaking(null),
        onError: () => {
          setIsSpeaking(null);
          setAlert({ type: 'warning', message: 'Text-to-speech is not available' });
        }
      });
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const hasAnswers = Object.values(answers).some(answer => answer.trim() !== '');
      if (!hasAnswers) {
        setAlert({
          type: 'error',
          message: 'Please provide at least one answer before submitting'
        });
        return;
      }
      setIsSubmitting(true);
      setAlert({ type: 'info', message: 'Submitting your answers for AI evaluation...' });
      const formattedAnswers = Object.entries(answers).map(([questionId, userAnswer]) => ({
        questionId: parseInt(questionId),
        userAnswer
      }));
      const response = await submitInterview(
        interviewData.interviewId, 
        formattedAnswers,
        confidenceMetrics
      );
      setAlert({
        type: 'success',
        message: 'Interview evaluated successfully! Redirecting to results...'
      });
      localStorage.removeItem(`interview_answers_${interviewData.interviewId}`);
      setTimeout(() => {
        navigate('/interview/result', {
          state: { resultData: response.data }
        });
      }, 1500);
    } catch (error) {
      console.error('Submit error:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to submit interview. Please try again.'
      });
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interviewData.questions.length - 1) {
      stopReading();
      setIsSpeaking(null);
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      stopReading();
      setIsSpeaking(null);
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const currentQuestion = interviewData?.questions[currentQuestionIndex];

  if (!interviewData || !currentQuestion) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
        </div>
      </PageContainer>
    );
  }

  const questionProgress = ((currentQuestionIndex + 1) / interviewData.questions.length) * 100;

  return (
    <PageContainer>
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Interview Session
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {interviewData.role} · {interviewData.level}
              </p>
            </div>

            {/* Desktop Progress */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Question {currentQuestionIndex + 1} of {interviewData.questions.length}
                </span>
                <div className="w-32">
                  <ProgressBar value={questionProgress} size="sm" />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
            </div>
          </div>

          {/* Mobile Progress */}
          <div className="sm:hidden mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {interviewData.questions.length}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {Math.round(questionProgress)}%
              </span>
            </div>
            <ProgressBar value={questionProgress} size="sm" />
          </div>
        </div>
      </header>

      {/* Alert */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />
      </div>

      {/* Main Content - Two Column */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 sm:p-6 gap-6 overflow-hidden">
        
        {/* ─── Camera Column ─── */}
        <div className={`${cameraPosition === 'left' ? 'lg:order-1' : 'lg:order-2'} w-full lg:w-[360px] xl:w-[400px] flex-shrink-0`}>
          <div className="sticky top-24 space-y-4">

            {/* Camera Setup Card */}
            {showCameraSetup && !enableCamera && (
              <Card className="transition-all duration-200">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-xl mb-4">
                    <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    Confidence Analysis
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                    Enable your webcam for real-time AI-powered confidence feedback and body language analysis
                  </p>
                  <div className="flex flex-col gap-2.5 w-full">
                    <Button
                      onClick={() => {
                        setEnableCamera(true);
                        setShowCameraSetup(false);
                      }}
                      variant="primary"
                      fullWidth
                      leftIcon={
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      }
                    >
                      Enable Camera
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      onClick={() => setShowCameraSetup(false)}
                    >
                      Continue without camera
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Video processed locally, never stored
                  </p>
                </div>
              </Card>
            )}

            {/* Camera Component */}
            {enableCamera && (
              <Card noPadding className="overflow-hidden">
                <CameraInterview 
                  isActive={enableCamera}
                  onMetricsUpdate={(metrics) => setConfidenceMetrics(metrics)}
                />
              </Card>
            )}

            {/* Session Info Card */}
            {!enableCamera && !showCameraSetup && (
              <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Session Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Role</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{interviewData.role}</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Level</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{interviewData.level}</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Questions</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{interviewData.questionCount}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => setShowCameraSetup(true)}
                    leftIcon={
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    }
                  >
                    Enable Camera
                  </Button>
                </div>
              </Card>
            )}

            {/* Camera Position Toggle - Desktop */}
            <div className="hidden lg:block">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => setCameraPosition(prev => prev === 'left' ? 'right' : 'left')}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                }
              >
                Switch Camera Side
              </Button>
            </div>
          </div>
        </div>

        {/* ─── Question Column ─── */}
        <div className={`${cameraPosition === 'left' ? 'lg:order-2' : 'lg:order-1'} flex-1 flex flex-col min-w-0`}>
          
          {/* Browser Compatibility */}
          <BrowserCompatibilityNotice compatibility={compatibilityStatus} />
          {compatibilityStatus.level !== 'full' && (
            <div className="mb-4">
              <button
                onClick={() => setShowCompatibilityDetails(!showCompatibilityDetails)}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
              >
                {showCompatibilityDetails ? '▼' : '►'} 
                {showCompatibilityDetails ? 'Hide' : 'Show'} technical details
              </button>
              {showCompatibilityDetails && (
                <div className="mt-3">
                  <DetailedCompatibilityReport report={fullCompatibilityReport} />
                </div>
              )}
            </div>
          )}

          {/* Question Card */}
          <Card className="mb-6">
            {/* Question Header */}
            <div className="flex items-start gap-3 mb-5">
              <div className="bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {currentQuestionIndex + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge
                    variant={
                      currentQuestion.difficulty === 'Easy' ? 'success' :
                      currentQuestion.difficulty === 'Medium' ? 'warning' : 'error'
                    }
                    size="sm"
                  >
                    {currentQuestion.difficulty}
                  </Badge>
                  
                  {/* Read Question Button */}
                  {fullCompatibilityReport.speechSynthesis.supported && (
                    <button
                      onClick={() => handleReadQuestion(currentQuestion.id, currentQuestion.question)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all text-xs font-medium border ${
                        isSpeaking === currentQuestion.id
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {isSpeaking === currentQuestion.id ? (
                        <>
                          <svg className="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                          </svg>
                          Stop
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                          </svg>
                          Listen
                        </>
                      )}
                    </button>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>
            </div>

            {/* Answer Section */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Your Answer
                </label>
                
                {/* Voice Control */}
                {fullCompatibilityReport.speechRecognition.supported ? (
                  <div className="flex items-center gap-2.5">
                    {isListening && activeQuestionId === currentQuestion.id && (
                      <span className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 animate-pulse font-medium">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        Recording...
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant={isListening && activeQuestionId === currentQuestion.id ? 'danger' : 'outline'}
                      onClick={() => 
                        isListening && activeQuestionId === currentQuestion.id
                          ? handleStopRecording()
                          : handleStartRecording(currentQuestion.id)
                      }
                      disabled={isSubmitting || (isListening && activeQuestionId !== currentQuestion.id)}
                      leftIcon={
                        isListening && activeQuestionId === currentQuestion.id ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                          </svg>
                        )
                      }
                    >
                      {isListening && activeQuestionId === currentQuestion.id ? 'Stop' : 'Voice Input'}
                    </Button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg text-xs">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                    Voice unavailable
                  </div>
                )}
              </div>
              
              <textarea
                value={
                  activeQuestionId === currentQuestion.id && isListening
                    ? transcript + (interimTranscript ? ` ${interimTranscript}` : '')
                    : answers[currentQuestion.id] || ''
                }
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder={
                  fullCompatibilityReport.speechRecognition.supported
                    ? "Type your answer here or use voice input... Be detailed and specific in your response."
                    : "Type your answer here... (Voice input not available in this browser)"
                }
                rows="7"
                disabled={isSubmitting || (isListening && activeQuestionId === currentQuestion.id)}
                className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 transition-all duration-200 resize-none focus:outline-none focus:ring-2 placeholder-gray-400 dark:placeholder-gray-500 ${
                  isListening && activeQuestionId === currentQuestion.id
                    ? 'border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/30 focus:ring-rose-500/30 focus:border-rose-500'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500/30 focus:border-indigo-500 disabled:bg-gray-50 dark:disabled:bg-gray-900'
                } disabled:cursor-not-allowed`}
              />
              
              {/* Live Transcript Preview */}
              {activeQuestionId === currentQuestion.id && isListening && interimTranscript && (
                <InfoPanel variant="warning" title="Live Transcription">
                  <p>{interimTranscript}</p>
                </InfoPanel>
              )}
              
              <div className="flex items-center justify-between text-xs">
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{(
                    activeQuestionId === currentQuestion.id && isListening
                      ? transcript + interimTranscript
                      : answers[currentQuestion.id] || ''
                  )?.length || 0}</span> characters
                </p>
                <p className="text-gray-400 dark:text-gray-500">
                  Detailed answers get better AI feedback
                </p>
              </div>
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <Button
              variant="secondary"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0 || isListening || isSubmitting}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
            >
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Question Dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              {interviewData.questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    stopReading();
                    setIsSpeaking(null);
                    setCurrentQuestionIndex(idx);
                  }}
                  disabled={isListening || isSubmitting}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    idx === currentQuestionIndex
                      ? 'bg-indigo-600 dark:bg-indigo-500 scale-125'
                      : (answers[interviewData.questions[idx]?.id] || '').trim()
                        ? 'bg-emerald-500 dark:bg-emerald-400'
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  title={`Question ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              variant="primary"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === interviewData.questions.length - 1 || isListening || isSubmitting}
              rightIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              <span className="hidden sm:inline">Next</span>
            </Button>
          </div>

          {/* Submit + Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              variant="success"
              size="lg"
              fullWidth
              onClick={handleSubmit}
              disabled={isSubmitting || isListening}
              loading={isSubmitting}
              leftIcon={!isSubmitting && !isListening ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : undefined}
            >
              {isSubmitting
                ? 'Evaluating Answers...'
                : isListening
                  ? 'Stop Recording to Submit'
                  : `Submit All ${interviewData.questions.length} Answers`}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/interview/start')}
              disabled={isSubmitting || isListening}
            >
              New Interview
            </Button>
          </div>

          {/* Tips Panel */}
          <InfoPanel
            variant="warning"
            title="Interview Tips"
            icon={
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            }
          >
            <ul className="space-y-1.5">
              <li className="flex items-start gap-1.5">
                <span className="font-bold mt-px">·</span>
                <span>Use <strong>Previous/Next</strong> buttons to navigate between questions</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold mt-px">·</span>
                <span>Your answers are <strong>automatically saved</strong> as you navigate</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold mt-px">·</span>
                <span>Use specific examples and the <strong>STAR method</strong> (Situation, Task, Action, Result)</span>
              </li>
              {fullCompatibilityReport.speechRecognition.supported && (
                <li className="flex items-start gap-1.5">
                  <span className="font-bold mt-px">·</span>
                  <span>Try <strong>voice input</strong> for natural, conversational answers</span>
                </li>
              )}
            </ul>
          </InfoPanel>
        </div>
      </div>
    </PageContainer>
  );
};

export default InterviewSession;
