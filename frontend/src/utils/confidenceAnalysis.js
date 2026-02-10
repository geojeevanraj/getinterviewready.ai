/**
 * Confidence Analysis Utility
 * Calculates confidence metrics from facial landmarks
 * Using MediaPipe FaceMesh results
 */

/**
 * Calculate eye contact score based on face orientation
 * Looking at camera = high score, looking away = low score
 */
export const calculateEyeContact = (faceLandmarks) => {
  if (!faceLandmarks || faceLandmarks.length === 0) {
    return 0;
  }

  // Get key landmarks for eye contact estimation
  // MediaPipe landmark indices:
  // 1 = nose tip, 33 = left eye outer, 263 = right eye outer
  // 168 = face center
  
  const noseTip = faceLandmarks[1];
  const leftEyeOuter = faceLandmarks[33];
  const rightEyeOuter = faceLandmarks[263];
  const faceCenter = faceLandmarks[168];

  if (!noseTip || !leftEyeOuter || !rightEyeOuter || !faceCenter) {
    return 0;
  }

  // Calculate horizontal deviation (looking left/right)
  const eyesCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
  const horizontalDeviation = Math.abs(noseTip.x - eyesCenterX);

  // Calculate vertical deviation (looking up/down)
  const verticalDeviation = Math.abs(noseTip.y - faceCenter.y);

  // Calculate z-axis deviation (distance from camera)
  const depthDeviation = Math.abs(noseTip.z || 0);

  // Combined deviation (normalized to 0-1)
  const totalDeviation = (horizontalDeviation + verticalDeviation + depthDeviation) / 3;

  // Convert to score (0-100, less deviation = higher score)
  const score = Math.max(0, Math.min(100, (1 - totalDeviation * 5) * 100));
  
  return Math.round(score);
};

/**
 * Calculate head stability score
 * Stable head = high score, shaky/moving = low score
 */
export const calculateStability = (currentLandmarks, previousLandmarks) => {
  if (!currentLandmarks || !previousLandmarks || 
      currentLandmarks.length === 0 || previousLandmarks.length === 0) {
    return 100; // Default to stable if no previous data
  }

  // Track nose tip movement (landmark 1)
  const currentNose = currentLandmarks[1];
  const previousNose = previousLandmarks[1];

  if (!currentNose || !previousNose) {
    return 100;
  }

  // Calculate movement delta
  const deltaX = Math.abs(currentNose.x - previousNose.x);
  const deltaY = Math.abs(currentNose.y - previousNose.y);
  const deltaZ = Math.abs((currentNose.z || 0) - (previousNose.z || 0));

  // Total movement
  const movement = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

  // Convert to stability score (less movement = higher score)
  // Threshold: movement > 0.05 is considered unstable
  const score = Math.max(0, Math.min(100, (1 - movement / 0.05) * 100));
  
  return Math.round(score);
};

/**
 * Detect smile/expression score
 * Smile = high score, neutral/frown = lower score
 */
export const calculateExpression = (faceLandmarks) => {
  if (!faceLandmarks || faceLandmarks.length === 0) {
    return 50; // Neutral default
  }

  // Mouth landmarks
  // 61 = upper lip top center, 291 = lower lip bottom center
  // 78 = left mouth corner, 308 = right mouth corner
  const upperLip = faceLandmarks[13];
  const lowerLip = faceLandmarks[14];
  const leftMouth = faceLandmarks[78];
  const rightMouth = faceLandmarks[308];

  if (!upperLip || !lowerLip || !leftMouth || !rightMouth) {
    return 50;
  }

  // Mouth width (wider = more smile)
  const mouthWidth = Math.abs(rightMouth.x - leftMouth.x);

  // Mouth height (open mouth can indicate surprise/engagement)
  const mouthHeight = Math.abs(lowerLip.y - upperLip.y);

  // Mouth corners position (corners up = smile, down = frown)
  const cornersAvgY = (leftMouth.y + rightMouth.y) / 2;
  const lipsCenterY = (upperLip.y + lowerLip.y) / 2;
  const cornerLift = lipsCenterY - cornersAvgY;

  // Calculate smile score
  // Positive corner lift + wider mouth = smile
  let expressionScore = 50; // Neutral baseline

  if (cornerLift > 0.01) {
    // Corners are lifted (smile)
    expressionScore += Math.min(30, cornerLift * 1000);
  } else if (cornerLift < -0.01) {
    // Corners are down (frown)
    expressionScore -= Math.min(20, Math.abs(cornerLift) * 500);
  }

  // Bonus for mouth width (confident smile)
  if (mouthWidth > 0.15) {
    expressionScore += 10;
  }

  // Cap between 0-100
  expressionScore = Math.max(0, Math.min(100, expressionScore));
  
  return Math.round(expressionScore);
};

/**
 * Detect blink rate (blinks per minute)
 * Normal: 15-20 blinks/min
 * Nervous: >30 blinks/min
 * Too focused: <10 blinks/min
 */
export const detectBlink = (faceLandmarks, previousEyeState) => {
  if (!faceLandmarks || faceLandmarks.length === 0) {
    return { isBlink: false, eyeAspectRatio: 0 };
  }

  // Eye landmarks (simplified)
  // Left eye: 33, 133, 160, 144
  // Right eye: 263, 362, 385, 373
  const leftEyeTop = faceLandmarks[159];
  const leftEyeBottom = faceLandmarks[145];
  const rightEyeTop = faceLandmarks[386];
  const rightEyeBottom = faceLandmarks[374];

  if (!leftEyeTop || !leftEyeBottom || !rightEyeTop || !rightEyeBottom) {
    return { isBlink: false, eyeAspectRatio: 0 };
  }

  // Calculate eye aspect ratio (EAR)
  const leftEAR = Math.abs(leftEyeTop.y - leftEyeBottom.y);
  const rightEAR = Math.abs(rightEyeTop.y - rightEyeBottom.y);
  const avgEAR = (leftEAR + rightEAR) / 2;

  // Blink threshold (eyes closed when EAR < 0.02)
  const BLINK_THRESHOLD = 0.02;
  const isBlink = avgEAR < BLINK_THRESHOLD;

  return {
    isBlink,
    eyeAspectRatio: avgEAR
  };
};

/**
 * Calculate overall confidence score
 * Weighted average of all metrics
 */
export const calculateConfidenceScore = (metrics) => {
  const {
    eyeContactScore = 0,
    stabilityScore = 0,
    expressionScore = 0
  } = metrics;

  // Weighted average
  // Eye contact: 40% (most important for confidence)
  // Stability: 35% (shows composure)
  // Expression: 25% (positive demeanor)
  const confidenceScore = (
    eyeContactScore * 0.4 +
    stabilityScore * 0.35 +
    expressionScore * 0.25
  );

  return Math.round(confidenceScore);
};

/**
 * Get confidence level from score
 */
export const getConfidenceLevel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 35) return 'Below Average';
  return 'Needs Improvement';
};

/**
 * Detect low light conditions
 * Returns warning if video is too dark
 */
export const detectLowLight = (videoElement) => {
  if (!videoElement) return { isLowLight: false, brightness: 0 };

  try {
    // Create canvas to analyze video brightness
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(videoElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Calculate average brightness
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Calculate perceived brightness
      totalBrightness += (r * 0.299 + g * 0.587 + b * 0.114);
    }
    
    const avgBrightness = totalBrightness / (data.length / 4);
    const brightnessPercent = (avgBrightness / 255) * 100;
    
    // Low light if brightness < 30%
    const isLowLight = brightnessPercent < 30;
    
    return {
      isLowLight,
      brightness: Math.round(brightnessPercent)
    };
  } catch (error) {
    console.error('Low light detection error:', error);
    return { isLowLight: false, brightness: 0 };
  }
};
