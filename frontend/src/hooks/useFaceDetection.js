import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import {
  calculateEyeContact,
  calculateStability,
  calculateExpression,
  detectBlink,
  calculateConfidenceScore
} from '../utils/confidenceAnalysis';

/**
 * Custom hook for facial landmark detection and confidence analysis
 * Uses MediaPipe FaceMesh
 */
export const useFaceDetection = (videoRef, isEnabled) => {
  const [faceLandmarks, setFaceLandmarks] = useState(null);
  const [metrics, setMetrics] = useState({
    eyeContactScore: 0,
    stabilityScore: 100,
    expressionScore: 50,
    confidenceScore: 50,
    blinkCount: 0,
    blinkRate: 0
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  const faceMeshRef = useRef(null);
  const animationFrameRef = useRef(null);
  const previousLandmarksRef = useRef(null);
  const metricsHistoryRef = useRef([]);
  const blinkHistoryRef = useRef([]);
  const startTimeRef = useRef(null);
  const previousBlinkStateRef = useRef(false);

  // Get smoothed metrics (average of recent frames)
  const getSmoothedMetrics = useCallback(() => {
    if (metricsHistoryRef.current.length === 0) {
      return {
        eyeContactScore: 0,
        stabilityScore: 100,
        expressionScore: 50,
        confidenceScore: 50,
        blinkCount: 0,
        blinkRate: 0
      };
    }

    const sum = metricsHistoryRef.current.reduce((acc, m) => ({
      eyeContactScore: acc.eyeContactScore + m.eyeContactScore,
      stabilityScore: acc.stabilityScore + m.stabilityScore,
      expressionScore: acc.expressionScore + m.expressionScore,
      confidenceScore: acc.confidenceScore + m.confidenceScore,
      blinkCount: m.blinkCount,
      blinkRate: m.blinkRate
    }), {
      eyeContactScore: 0,
      stabilityScore: 0,
      expressionScore: 0,
      confidenceScore: 0,
      blinkCount: 0,
      blinkRate: 0
    });

    const count = metricsHistoryRef.current.length;

    return {
      eyeContactScore: Math.round(sum.eyeContactScore / count),
      stabilityScore: Math.round(sum.stabilityScore / count),
      expressionScore: Math.round(sum.expressionScore / count),
      confidenceScore: Math.round(sum.confidenceScore / count),
      blinkCount: sum.blinkCount,
      blinkRate: sum.blinkRate
    };
  }, []);

  // Initialize MediaPipe FaceMesh
  useEffect(() => {
    if (!isEnabled || !videoRef.current) return;

    let isMounted = true;
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults((results) => {
      if (!isMounted) return;
      
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        setFaceLandmarks(landmarks);

        // Calculate metrics
        const eyeContactScore = calculateEyeContact(landmarks);
        const stabilityScore = calculateStability(landmarks, previousLandmarksRef.current);
        const expressionScore = calculateExpression(landmarks);

        // Detect blinks
        const blinkData = detectBlink(landmarks, previousBlinkStateRef.current);
        if (blinkData.isBlink && !previousBlinkStateRef.current) {
          blinkHistoryRef.current.push(Date.now());
        }
        previousBlinkStateRef.current = blinkData.isBlink;

        // Calculate blink rate (blinks per minute)
        const now = Date.now();
        const recentBlinks = blinkHistoryRef.current.filter(
          time => now - time < 60000
        );
        const blinkRate = recentBlinks.length;

        // Store current landmarks for next frame
        previousLandmarksRef.current = landmarks;

        // Calculate confidence score
        const newMetrics = {
          eyeContactScore,
          stabilityScore,
          expressionScore,
          confidenceScore: 0,
          blinkCount: blinkHistoryRef.current.length,
          blinkRate
        };

        newMetrics.confidenceScore = calculateConfidenceScore(newMetrics);

        // Store in history (for averaging)
        metricsHistoryRef.current.push(newMetrics);
        if (metricsHistoryRef.current.length > 30) {
          metricsHistoryRef.current.shift();
        }

        // Update state with smoothed metrics
        const smoothed = getSmoothedMetrics();
        setMetrics(smoothed);
      } else {
        setFaceLandmarks(null);
      }
    });

    faceMeshRef.current = faceMesh;
    startTimeRef.current = Date.now();
    setError(null);

    // Wait for video to be ready before starting detection
    const waitForVideo = () => {
      const video = videoRef.current;
      if (!video || !isMounted) return;

      if (video.readyState >= 2) { // HAVE_CURRENT_DATA or better
        setIsDetecting(true);
        processFrame();
      } else {
        // Wait for video to load
        video.addEventListener('loadeddata', () => {
          if (isMounted) {
            setIsDetecting(true);
            processFrame();
          }
        }, { once: true });
      }
    };

    // Start processing frames
    const processFrame = async () => {
      if (!isMounted || !videoRef.current || !faceMeshRef.current) return;

      const video = videoRef.current;

      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        try {
          await faceMeshRef.current.send({ image: video });
        } catch (err) {
          console.error('Frame processing error:', err);
        }
      }

      if (isMounted) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
    };

    waitForVideo();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
      setIsDetecting(false);
    };
  }, [isEnabled]);

  // Get average metrics for the entire session
  const getSessionMetrics = useCallback(() => {
    return {
      ...metrics,
      duration: startTimeRef.current 
        ? Math.round((Date.now() - startTimeRef.current) / 1000) 
        : 0
    };
  }, [metrics]);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsHistoryRef.current = [];
    blinkHistoryRef.current = [];
    startTimeRef.current = Date.now();
    previousLandmarksRef.current = null;
    previousBlinkStateRef.current = false;
    setMetrics({
      eyeContactScore: 0,
      stabilityScore: 100,
      expressionScore: 50,
      confidenceScore: 50,
      blinkCount: 0,
      blinkRate: 0
    });
  }, []);

  return {
    faceLandmarks,
    metrics,
    isDetecting,
    error,
    getSessionMetrics,
    resetMetrics
  };
};
