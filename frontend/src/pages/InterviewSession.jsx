import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import Alert from '../components/Alert';
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
      setInterviewData(location.state.interviewData);
      // Initialize empty answers
      const initialAnswers = {};
      location.state.interviewData.questions.forEach(q => {
        initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
    } else {
      // Redirect if no interview data
      setAlert({ type: 'error', message: 'No interview session found' });
      setTimeout(() => navigate('/interview/start'), 2000);
    }
  }, [location, navigate]);

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

  /**
   * Start voice recording for a question
   */
  const handleStartRecording = (questionId) => {
    // Stop any ongoing speech
    stopReading();
    setIsSpeaking(null);
    
    // Set current transcript to existing answer
    setTranscript(answers[questionId] || '');
    setActiveQuestionId(questionId);
    resetTranscript();
    startListening();
  };

  /**
   * Stop voice recording
   */
  const handleStopRecording = () => {
    stopListening();
  };

  /**
   * Read question aloud
   */
  const handleReadQuestion = async (questionId, questionText) => {
    if (isSpeaking === questionId) {
      // Stop if already speaking this question
      stopReading();
      setIsSpeaking(null);
      return;
    }

    // Stop any previous speech
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
      // Validate that at least one answer is provided
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

      // Format answers for API
      const formattedAnswers = Object.entries(answers).map(([questionId, userAnswer]) => ({
        questionId: parseInt(questionId),
        userAnswer
      }));

      // Submit with confidence metrics if camera was enabled
      const response = await submitInterview(
        interviewData.interviewId, 
        formattedAnswers,
        confidenceMetrics // Include camera metrics
      );

      setAlert({
        type: 'success',
        message: 'Interview evaluated successfully! Redirecting to results...'
      });

      // Navigate to results page with evaluation data
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

  // NEW: Navigation handlers
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

  // Get current question
  const currentQuestion = interviewData?.questions[currentQuestionIndex];

  if (!interviewData || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Navigation Bar */}
      <nav className="backdrop-blur-xl bg-white/90 border-b border-white/20 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Interview Platform
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Progress Indicator */}
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-200/50">
                <span className="text-sm font-semibold text-gray-700">
                  Question {currentQuestionIndex + 1} of {interviewData.questions.length}
                </span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                    style={{ width: `${((currentQuestionIndex + 1) / interviewData.questions.length) * 100}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
          {/* Mobile Progress */}
          <div className="sm:hidden pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Question {currentQuestionIndex + 1} of {interviewData.questions.length}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(((currentQuestionIndex + 1) / interviewData.questions.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${((currentQuestionIndex + 1) / interviewData.questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Alert */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-4">
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />
      </div>

      {/* Main Content - Flex Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 gap-6 overflow-hidden">
        
        {/* Camera Column - Fixed/Sticky */}
        <div className={`${cameraPosition === 'left' ? 'lg:order-1' : 'lg:order-2'} w-full lg:w-[380px] xl:w-[420px] flex-shrink-0`}>
          <div className="sticky top-20 space-y-4">
            
            {/* Camera Setup Card */}
            {showCameraSetup && !enableCamera && (
              <div className="backdrop-blur-xl bg-white/60 border border-white/20 rounded-3xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    📹 Confidence Analysis
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Enable your webcam for real-time AI-powered confidence feedback and body language analysis
                  </p>
                  
                  <div className="flex flex-col gap-3 w-full">
                    <Button
                      onClick={() => {
                        setEnableCamera(true);
                        setShowCameraSetup(false);
                      }}
                      variant="primary"
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg shadow-purple-500/30"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      Enable Camera
                    </Button>
                    
                    <button
                      onClick={() => setShowCameraSetup(false)}
                      className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-white/50"
                    >
                      Continue without camera
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Video processed locally, never stored
                  </p>
                </div>
              </div>
            )}

            {/* Camera Component */}
            {enableCamera && (
              <div className="rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-purple-500/20">
                <CameraInterview 
                  isActive={enableCamera}
                  onMetricsUpdate={(metrics) => setConfidenceMetrics(metrics)}
                />
              </div>
            )}

            {/* Session Info Card */}
            {!enableCamera && !showCameraSetup && (
              <div className="backdrop-blur-xl bg-white/60 border border-white/20 rounded-3xl shadow-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">📊 Session Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <span className="text-gray-600 text-sm">Role:</span>
                    <span className="font-semibold text-gray-900 text-sm">{interviewData.role}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <span className="text-gray-600 text-sm">Level:</span>
                    <span className="font-semibold text-gray-900 text-sm">{interviewData.level}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <span className="text-gray-600 text-sm">Questions:</span>
                    <span className="font-semibold text-gray-900 text-sm">{interviewData.questionCount}</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-2xl border border-purple-200/50">
                  <p className="text-xs text-gray-700 leading-relaxed mb-3">
                    💡 Enable camera for real-time confidence analysis and personalized body language feedback
                  </p>
                  <button
                    onClick={() => setShowCameraSetup(true)}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
                  >
                    Enable Camera Now
                  </button>
                </div>
              </div>
            )}

            {/* Camera Position Toggle - Desktop Only */}
            <div className="hidden lg:block">
              <button
                onClick={() => setCameraPosition(prev => prev === 'left' ? 'right' : 'left')}
                className="w-full px-4 py-2 backdrop-blur-xl bg-white/60 border border-white/20 rounded-2xl text-sm font-medium text-gray-700 hover:bg-white/80 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Switch Camera Side
              </button>
            </div>
          </div>
        </div>

        {/* Question Column */}
        <div className={`${cameraPosition === 'left' ? 'lg:order-2' : 'lg:order-1'} flex-1 flex flex-col min-w-0`}>
          
          {/* Browser Compatibility Notice */}
          <BrowserCompatibilityNotice compatibility={compatibilityStatus} />

          {compatibilityStatus.level !== 'full' && (
            <div className="mb-4">
              <button
                onClick={() => setShowCompatibilityDetails(!showCompatibilityDetails)}
                className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
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

          {/* Question Card with Animation */}
          <div className="backdrop-blur-xl bg-white/60 border border-white/20 rounded-3xl shadow-2xl p-6 md:p-8 mb-6 transition-all duration-500 hover:shadow-purple-500/20 animate-fadeIn">
            
            {/* Question Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg shadow-blue-500/50">
                {currentQuestionIndex + 1}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
                    currentQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    currentQuestion.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                  
                  {/* Read Question Button */}
                  {fullCompatibilityReport.speechSynthesis.supported && (
                    <button
                      onClick={() => handleReadQuestion(currentQuestion.id, currentQuestion.question)}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition-all text-sm font-medium shadow-lg ${
                        isSpeaking === currentQuestion.id
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30'
                          : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-xl'
                      }`}
                    >
                      {isSpeaking === currentQuestion.id ? (
                        <>
                          <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                          </svg>
                          Stop
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                          </svg>
                          Listen
                        </>
                      )}
                    </button>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>
            </div>

            {/* Answer Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <label className="block text-base font-semibold text-gray-800">
                  Your Answer:
                </label>
                
                {/* Voice Control Button */}
                {fullCompatibilityReport.speechRecognition.supported ? (
                  <div className="flex items-center gap-3">
                    {isListening && activeQuestionId === currentQuestion.id && (
                      <span className="text-sm text-red-600 flex items-center gap-2 animate-pulse font-medium">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        Recording...
                      </span>
                    )}
                    
                    <button
                      onClick={() => 
                        isListening && activeQuestionId === currentQuestion.id
                          ? handleStopRecording()
                          : handleStartRecording(currentQuestion.id)
                      }
                      disabled={isSubmitting || (isListening && activeQuestionId !== currentQuestion.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                        isListening && activeQuestionId === currentQuestion.id
                          ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-red-500/50 hover:from-red-600 hover:to-pink-700'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/50 hover:from-blue-700 hover:to-indigo-700'
                      }`}
                    >
                      {isListening && activeQuestionId === currentQuestion.id ? (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                          </svg>
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                          </svg>
                          Voice Input
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                    Voice input unavailable
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
                rows="8"
                disabled={isSubmitting || (isListening && activeQuestionId === currentQuestion.id)}
                className={`w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 text-gray-800 transition-all resize-none ${
                  isListening && activeQuestionId === currentQuestion.id
                    ? 'border-red-300 bg-red-50/50 focus:ring-red-500/30 focus:border-red-500'
                    : 'border-gray-200 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-gray-50'
                } disabled:cursor-not-allowed`}
              />
              
              {/* Live Transcript Preview */}
              {activeQuestionId === currentQuestion.id && isListening && interimTranscript && (
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-900 text-sm mb-1">Live Transcription:</p>
                      <p className="text-yellow-800 text-sm leading-relaxed">{interimTranscript}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">{(
                    activeQuestionId === currentQuestion.id && isListening
                      ? transcript + interimTranscript
                      : answers[currentQuestion.id] || ''
                  )?.length || 0}</span> characters
                </p>
                <p className="text-gray-500 text-xs">
                  💡 Detailed answers get better AI feedback
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0 || isListening || isSubmitting}
              className="flex items-center gap-2 px-6 py-3 backdrop-blur-xl bg-white/60 border border-white/20 rounded-2xl font-semibold text-gray-700 hover:bg-white/80 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === interviewData.questions.length - 1 || isListening || isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 shadow-xl shadow-blue-500/50"
            >
              <span className="hidden sm:inline">Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Submit and Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isListening}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-green-500/50 transform hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Evaluating Answers...
                </span>
              ) : isListening ? (
                'Stop Recording to Submit'
              ) : (
                `Submit All ${interviewData.questions.length} Answers`
              )}
            </Button>
            <button
              onClick={() => navigate('/interview/start')}
              disabled={isSubmitting || isListening}
              className="sm:w-auto px-6 py-4 backdrop-blur-xl bg-white/60 border border-white/20 text-gray-700 rounded-2xl font-semibold hover:bg-white/80 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Start New Interview
            </button>
          </div>

          {/* Interview Tips */}
          <div className="mt-6 backdrop-blur-xl bg-gradient-to-r from-yellow-50/60 to-orange-50/60 border-l-4 border-yellow-500 p-6 rounded-2xl shadow-lg">
            <div className="flex items-start gap-3">
              <div className="bg-yellow-400 p-2 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-yellow-900 font-bold mb-3 text-lg">💡 Interview Tips</h4>
                <ul className="text-yellow-800 space-y-2 text-sm leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-0.5">•</span>
                    <span>Use the <strong>Previous/Next</strong> buttons to navigate between questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-0.5">•</span>
                    <span>Your answers are <strong>automatically saved</strong> as you navigate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-0.5">•</span>
                    <span>Use specific examples and the <strong>STAR method</strong> (Situation, Task, Action, Result)</span>
                  </li>
                  {fullCompatibilityReport.speechRecognition.supported && (
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold mt-0.5">•</span>
                      <span>🎤 Try <strong>voice input</strong> for natural, conversational answers</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
