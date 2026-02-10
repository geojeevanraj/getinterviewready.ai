/**
 * Browser Compatibility Utilities
 * Checks for various Web APIs and browser features
 */

/**
 * Check if Speech Recognition is supported
 * @returns {Object} Support status and details
 */
export const checkSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  return {
    supported: !!SpeechRecognition,
    api: SpeechRecognition ? 'webkitSpeechRecognition' in window ? 'webkit' : 'standard' : null,
    message: SpeechRecognition 
      ? 'Speech recognition is available' 
      : 'Speech recognition is not supported in this browser'
  };
};

/**
 * Check if Speech Synthesis (Text-to-Speech) is supported
 * @returns {Object} Support status and details
 */
export const checkSpeechSynthesis = () => {
  const supported = 'speechSynthesis' in window;
  
  return {
    supported,
    hasVoices: supported && window.speechSynthesis.getVoices().length > 0,
    message: supported 
      ? 'Text-to-speech is available' 
      : 'Text-to-speech is not supported in this browser'
  };
};

/**
 * Check if MediaDevices (microphone access) is supported
 * @returns {Object} Support status and details
 */
export const checkMediaDevices = () => {
  const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  return {
    supported,
    message: supported 
      ? 'Microphone access is available' 
      : 'Microphone access is not supported in this browser'
  };
};

/**
 * Detect browser type and version
 * @returns {Object} Browser information
 */
export const detectBrowser = () => {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let isSupported = false;

  // Chrome
  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
    browserName = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    isSupported = true;
  }
  // Edge (Chromium)
  else if (userAgent.indexOf('Edg') > -1) {
    browserName = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    isSupported = true;
  }
  // Safari
  else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    isSupported = true;
  }
  // Firefox
  else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    isSupported = false; // Firefox doesn't support Web Speech API fully
  }
  // Opera
  else if (userAgent.indexOf('OPR') > -1) {
    browserName = 'Opera';
    const match = userAgent.match(/OPR\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    isSupported = true;
  }

  return {
    name: browserName,
    version: browserVersion,
    isSupported,
    userAgent
  };
};

/**
 * Check if HTTPS is being used (required for microphone in production)
 * @returns {Object} HTTPS status
 */
export const checkHTTPS = () => {
  const isHTTPS = window.location.protocol === 'https:';
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '[::1]';
  
  return {
    isSecure: isHTTPS || isLocalhost,
    protocol: window.location.protocol,
    message: isHTTPS 
      ? 'Secure connection (HTTPS)' 
      : isLocalhost 
        ? 'Local development (microphone allowed)' 
        : 'Insecure connection - microphone access may be blocked'
  };
};

/**
 * Comprehensive compatibility check
 * @returns {Object} Complete compatibility report
 */
export const checkAllCompatibility = () => {
  const speechRecognition = checkSpeechRecognition();
  const speechSynthesis = checkSpeechSynthesis();
  const mediaDevices = checkMediaDevices();
  const browser = detectBrowser();
  const https = checkHTTPS();

  const allSupported = speechRecognition.supported && 
                       speechSynthesis.supported && 
                       mediaDevices.supported &&
                       https.isSecure;

  return {
    speechRecognition,
    speechSynthesis,
    mediaDevices,
    browser,
    https,
    allSupported,
    partialSupport: speechSynthesis.supported || speechRecognition.supported,
    recommendations: getRecommendations({
      speechRecognition,
      speechSynthesis,
      browser,
      https
    })
  };
};

/**
 * Get browser recommendations based on compatibility
 * @param {Object} compatibility - Compatibility check results
 * @returns {Array} List of recommendations
 */
const getRecommendations = (compatibility) => {
  const recommendations = [];

  if (!compatibility.browser.isSupported) {
    recommendations.push({
      type: 'error',
      message: `${compatibility.browser.name} has limited support for voice features. We recommend using Chrome, Edge, or Safari for the best experience.`
    });
  }

  if (!compatibility.https.isSecure) {
    recommendations.push({
      type: 'warning',
      message: 'Microphone access requires HTTPS. Voice features may not work properly.'
    });
  }

  if (!compatibility.speechRecognition.supported) {
    recommendations.push({
      type: 'info',
      message: 'Voice input is not available in your browser. You can still type your answers manually.'
    });
  }

  if (!compatibility.speechSynthesis.supported) {
    recommendations.push({
      type: 'info',
      message: 'Text-to-speech is not available in your browser. You\'ll need to read questions yourself.'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      message: '✓ All voice features are available in your browser!'
    });
  }

  return recommendations;
};

/**
 * Get a user-friendly compatibility message
 * @returns {Object} Simplified compatibility status
 */
export const getCompatibilityStatus = () => {
  const compat = checkAllCompatibility();
  
  if (compat.allSupported) {
    return {
      level: 'full',
      icon: '✅',
      title: 'Full Voice Support',
      message: 'All voice features are available!',
      color: 'green'
    };
  }
  
  if (compat.partialSupport) {
    return {
      level: 'partial',
      icon: '⚠️',
      title: 'Partial Voice Support',
      message: 'Some voice features are available. You can still complete interviews using the keyboard.',
      color: 'yellow'
    };
  }
  
  return {
    level: 'none',
    icon: '❌',
    title: 'No Voice Support',
    message: 'Voice features are not available. Please use keyboard input.',
    color: 'red',
    recommendation: 'For voice features, please use Chrome, Edge, or Safari.'
  };
};

export default {
  checkSpeechRecognition,
  checkSpeechSynthesis,
  checkMediaDevices,
  detectBrowser,
  checkHTTPS,
  checkAllCompatibility,
  getCompatibilityStatus
};
