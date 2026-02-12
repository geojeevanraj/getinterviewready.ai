/**
 * Text-to-Speech utilities using Web Speech API
 */

class TextToSpeech {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.isSpeaking = false;
  }

  /**
   * Check if browser supports speech synthesis
   * @returns {boolean}
   */
  isSupported() {
    return 'speechSynthesis' in window;
  }

  /**
   * Get available voices
   * @returns {Promise<Array>}
   */
  getVoices() {
    return new Promise((resolve) => {
      let voices = this.synth.getVoices();
      
      if (voices.length) {
        resolve(voices);
      } else {
        // Chrome loads voices asynchronously
        this.synth.onvoiceschanged = () => {
          voices = this.synth.getVoices();
          resolve(voices);
        };
      }
    });
  }

  /**
   * Speak text
   * @param {string} text - Text to speak
   * @param {Object} options - Speech options
   * @returns {Promise}
   */
  speak(text, options = {}) {
    return new Promise(async (resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Text-to-speech is not supported in this browser'));
        return;
      }

      // Cancel any ongoing speech
      this.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set options
      utterance.rate = options.rate || 1.0; // Speed (0.1 to 10)
      utterance.pitch = options.pitch || 1.0; // Pitch (0 to 2)
      utterance.volume = options.volume || 1.0; // Volume (0 to 1)
      utterance.lang = options.lang || 'en-US';

      // Set voice if specified
      if (options.voice) {
        utterance.voice = options.voice;
      } else {
        // Use default English voice - await voices before speaking
        const voices = await this.getVoices();
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }

      // Event handlers
      utterance.onstart = () => {
        this.isSpeaking = true;
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (options.onError) options.onError(event);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      utterance.onpause = () => {
        if (options.onPause) options.onPause();
      };

      utterance.onresume = () => {
        if (options.onResume) options.onResume();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  /**
   * Pause speech
   */
  pause() {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  /**
   * Resume speech
   */
  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * Cancel/stop speech
   */
  cancel() {
    if (this.synth.speaking) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  /**
   * Check if currently speaking
   * @returns {boolean}
   */
  getSpeakingStatus() {
    return this.synth.speaking;
  }
}

// Create singleton instance
const tts = new TextToSpeech();

export default tts;

/**
 * Helper function to read question aloud
 * @param {string} question - Question text
 * @param {Object} options - Speech options
 */
export const readQuestion = (question, options = {}) => {
  return tts.speak(question, {
    rate: 0.9, // Slightly slower for clarity
    pitch: 1.0,
    volume: 1.0,
    ...options
  });
};

/**
 * Stop reading
 */
export const stopReading = () => {
  tts.cancel();
};
