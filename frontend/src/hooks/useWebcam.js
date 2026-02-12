import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for webcam access and management
 * Handles getUserMedia, permissions, and cleanup
 */
export const useWebcam = () => {
  const [stream, setStream] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const videoRef = useRef(null);
  const wasEnabled = useRef(false);

  // Check if getUserMedia is supported
  useEffect(() => {
    const supported = !!(
      navigator.mediaDevices && 
      navigator.mediaDevices.getUserMedia
    );
    setIsSupported(supported);
    
    if (!supported) {
      setError('Camera not supported in this browser');
    }
  }, []);

  // Attach stream to video element when both are ready
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('Attaching stream to video element');
      videoRef.current.srcObject = stream;
      // Don't call play() here - let autoPlay handle it or the video element events
    }
  }, [stream]);

  // Start webcam
  const startCamera = useCallback(async () => {
    if (!isSupported) {
      setError('Camera not supported');
      return false;
    }

    try {
      console.log('Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      console.log('Camera access granted', mediaStream);
      setStream(mediaStream);
      setIsEnabled(true);
      wasEnabled.current = true;
      setError(null);

      return true;
    } catch (err) {
      console.error('Camera access error:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already in use by another application.');
      } else {
        setError('Failed to access camera: ' + err.message);
      }
      
      setIsEnabled(false);
      return false;
    }
  }, [isSupported]);

  // Stop webcam
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsEnabled(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Handle page visibility change (pause when tab inactive, restart on return)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isEnabled) {
        stopCamera();
      } else if (!document.hidden && !isEnabled && wasEnabled.current) {
        startCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isEnabled, stopCamera, startCamera]);

  return {
    videoRef,
    stream,
    isEnabled,
    isSupported,
    error,
    startCamera,
    stopCamera
  };
};
