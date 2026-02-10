import React, { useEffect, useState, useRef } from 'react';
import { useWebcam } from '../hooks/useWebcam';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { detectLowLight, getConfidenceLevel } from '../utils/confidenceAnalysis';

/**
 * Camera Interview Component
 * Shows webcam preview with live confidence metrics overlay
 */
const CameraInterview = ({ isActive, onMetricsUpdate }) => {
  const { videoRef, isEnabled, isSupported, error, startCamera, stopCamera } = useWebcam();
  const { metrics, isDetecting, error: detectionError, getSessionMetrics } = useFaceDetection(videoRef, isEnabled); // Re-enable face detection
  
  const [showOverlay, setShowOverlay] = useState(true);
  const [lightingWarning, setLightingWarning] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [isCameraStopped, setIsCameraStopped] = useState(false);
  const canvasRef = useRef(null);

  // Start/stop camera based on isActive prop
  useEffect(() => {
    if (isActive && isSupported && !isCameraStopped) {
      console.log('Starting camera for interview');
      startCamera();
    }
    
    return () => {
      if (isActive) {
        console.log('Cleaning up camera');
        stopCamera();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isSupported, isCameraStopped]); // Added isCameraStopped to dependencies

  const handleStopCamera = () => {
    stopCamera();
    setIsCameraStopped(true);
    setVideoReady(false);
  };

  const handleStartCamera = () => {
    setIsCameraStopped(false);
    startCamera();
  };

  // Update parent with metrics periodically
  useEffect(() => {
    if (!isDetecting || !onMetricsUpdate) return;

    const interval = setInterval(() => {
      const sessionMetrics = getSessionMetrics();
      onMetricsUpdate(sessionMetrics);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isDetecting, getSessionMetrics, onMetricsUpdate]);

  // Check lighting conditions
  useEffect(() => {
    if (!isEnabled || !videoRef.current) return;

    const checkLighting = setInterval(() => {
      const lightCheck = detectLowLight(videoRef.current);
      if (lightCheck.isLowLight) {
        setLightingWarning(`Low light detected (${lightCheck.brightness}%). Better lighting improves accuracy.`);
      } else {
        setLightingWarning(null);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(checkLighting);
  }, [isEnabled, videoRef]);

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-red-900">Camera Not Supported</h3>
            <p className="text-sm text-red-700">Your browser doesn't support webcam access. You can continue without confidence analysis.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-yellow-900">Camera Access Error</h3>
            <p className="text-sm text-yellow-700">{error}</p>
            <p className="text-xs text-yellow-600 mt-1">Confidence analysis is optional. You can continue with the interview.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <h3 className="text-white font-semibold">Confidence Analysis</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {isDetecting ? (
              <span className="flex items-center gap-1 text-green-200 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Active
              </span>
            ) : (
              <span className="text-gray-300 text-sm">Initializing...</span>
            )}
            
            <button
              onClick={() => setShowOverlay(!showOverlay)}
              className="text-white hover:text-gray-200 text-sm px-2 py-1 rounded transition-colors"
              title={showOverlay ? 'Hide overlay' : 'Show overlay'}
            >
              {showOverlay ? 'Hide Stats' : 'Show Stats'}
            </button>

            {isCameraStopped ? (
              <button
                onClick={handleStartCamera}
                className="flex items-center gap-1.5 text-white bg-green-600 hover:bg-green-700 text-sm px-3 py-1.5 rounded-lg transition-all"
                title="Start camera"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Start</span>
              </button>
            ) : (
              <button
                onClick={handleStopCamera}
                className="flex items-center gap-1.5 text-white hover:bg-white/20 text-sm px-3 py-1.5 rounded-lg transition-all"
                title="Stop camera"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                <span className="hidden sm:inline">Stop</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Video Container - Responsive Aspect Ratio */}
      <div className="relative bg-gray-900 w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3]">
        {!videoReady && isEnabled && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
              <p>Loading camera...</p>
            </div>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
          style={{ transform: 'scaleX(-1)' }} // Mirror effect
          onCanPlay={(e) => {
            console.log('Video can play - ready to display');
            setVideoReady(true);
          }}
          onPlaying={() => {
            console.log('Video is now playing');
            setVideoReady(true);
          }}
          onLoadedMetadata={(e) => {
            console.log('Video metadata loaded', e.target.videoWidth, 'x', e.target.videoHeight);
          }}
          onError={(e) => {
            console.error('Video error:', e);
          }}
        />
        
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Overlay with Live Stats */}
        {showOverlay && isDetecting && (
          <div className="absolute top-0 left-0 right-0 p-4">
            {/* Confidence Score */}
            <div className="bg-black bg-opacity-70 rounded-lg p-3 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-semibold">Confidence Score</span>
                <span className="text-white text-lg font-bold">{metrics.confidenceScore}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.confidenceScore >= 80 ? 'bg-green-500' :
                    metrics.confidenceScore >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${metrics.confidenceScore}%` }}
                />
              </div>
              <span className="text-xs text-gray-300 mt-1">
                {getConfidenceLevel(metrics.confidenceScore)}
              </span>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-3 gap-2">
              {/* Eye Contact */}
              <div className="bg-black bg-opacity-70 rounded-lg p-2">
                <div className="text-xs text-gray-300">Eye Contact</div>
                <div className="text-white font-bold">{metrics.eyeContactScore}%</div>
              </div>

              {/* Stability */}
              <div className="bg-black bg-opacity-70 rounded-lg p-2">
                <div className="text-xs text-gray-300">Stability</div>
                <div className="text-white font-bold">{metrics.stabilityScore}%</div>
              </div>

              {/* Expression */}
              <div className="bg-black bg-opacity-70 rounded-lg p-2">
                <div className="text-xs text-gray-300">Expression</div>
                <div className="text-white font-bold">{metrics.expressionScore}%</div>
              </div>
            </div>

            {/* Blink Rate */}
            <div className="bg-black bg-opacity-70 rounded-lg p-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Blink Rate</span>
                <span className="text-white text-sm font-semibold">{metrics.blinkRate}/min</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {metrics.blinkRate < 10 && 'Too focused'}
                {metrics.blinkRate >= 10 && metrics.blinkRate <= 25 && 'Normal'}
                {metrics.blinkRate > 25 && 'Possibly nervous'}
              </div>
            </div>
          </div>
        )}

        {/* Lighting Warning */}
        {lightingWarning && (
          <div className="absolute bottom-0 left-0 right-0 bg-yellow-900 bg-opacity-90 p-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-100 text-xs">{lightingWarning}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-gray-50 p-4 border-t">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 Tips for Better Confidence Score:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>✓ Look directly at the camera when speaking</li>
          <li>✓ Keep your head stable and maintain good posture</li>
          <li>✓ Show natural expressions and smile when appropriate</li>
          <li>✓ Ensure good lighting on your face</li>
        </ul>
      </div>

      {/* Detection Error */}
      {detectionError && (
        <div className="bg-red-50 border-t border-red-200 p-3">
          <p className="text-sm text-red-700">{detectionError}</p>
        </div>
      )}
    </div>
  );
};

export default CameraInterview;
