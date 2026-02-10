import React from 'react';

/**
 * Browser Compatibility Notice Component
 * Shows user-friendly messages about voice feature availability
 */
const BrowserCompatibilityNotice = ({ compatibility }) => {
  if (!compatibility) return null;

  const { level, icon, title, message, color, recommendation } = compatibility;

  // Don't show anything if full support
  if (level === 'full') {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{icon}</span>
          <div>
            <h3 className="text-green-900 font-bold">{title}</h3>
            <p className="text-green-800 text-sm mt-1">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Partial support
  if (level === 'partial') {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
        <div className="flex items-start">
          <span className="text-2xl mr-3 flex-shrink-0">{icon}</span>
          <div className="flex-1">
            <h3 className="text-yellow-900 font-bold">{title}</h3>
            <p className="text-yellow-800 text-sm mt-1">{message}</p>
            {recommendation && (
              <div className="mt-3 bg-yellow-100 p-3 rounded text-yellow-900 text-sm">
                <strong>Recommendation:</strong> {recommendation}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No support
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
      <div className="flex items-start">
        <span className="text-2xl mr-3 flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <h3 className="text-red-900 font-bold">{title}</h3>
          <p className="text-red-800 text-sm mt-1">{message}</p>
          {recommendation && (
            <div className="mt-3 bg-red-100 p-3 rounded text-red-900 text-sm">
              <strong>Recommendation:</strong> {recommendation}
            </div>
          )}
          <div className="mt-3">
            <h4 className="text-red-900 font-semibold text-sm">Supported Browsers:</h4>
            <ul className="text-red-800 text-sm mt-1 space-y-1">
              <li>• Google Chrome (Recommended)</li>
              <li>• Microsoft Edge</li>
              <li>• Safari (macOS/iOS)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Detailed Compatibility Report Component
 * Shows technical details about browser capabilities
 */
export const DetailedCompatibilityReport = ({ report }) => {
  if (!report) return null;

  const getStatusIcon = (supported) => supported ? '✅' : '❌';
  const getStatusColor = (supported) => supported ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Browser Compatibility Report</h3>
      
      {/* Browser Info */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-2">Browser Information</h4>
        <p className="text-sm text-gray-600">
          {report.browser.name} {report.browser.version}
          {report.browser.isSupported ? (
            <span className="ml-2 text-green-600">✓ Voice features supported</span>
          ) : (
            <span className="ml-2 text-red-600">✗ Limited voice support</span>
          )}
        </p>
      </div>

      {/* Feature Support */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Speech Recognition (Voice Input)</span>
          <span className={`text-sm font-semibold ${getStatusColor(report.speechRecognition.supported)}`}>
            {getStatusIcon(report.speechRecognition.supported)} {report.speechRecognition.message}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Speech Synthesis (Text-to-Speech)</span>
          <span className={`text-sm font-semibold ${getStatusColor(report.speechSynthesis.supported)}`}>
            {getStatusIcon(report.speechSynthesis.supported)} {report.speechSynthesis.message}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Microphone Access</span>
          <span className={`text-sm font-semibold ${getStatusColor(report.mediaDevices.supported)}`}>
            {getStatusIcon(report.mediaDevices.supported)} {report.mediaDevices.message}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Secure Connection</span>
          <span className={`text-sm font-semibold ${getStatusColor(report.https.isSecure)}`}>
            {getStatusIcon(report.https.isSecure)} {report.https.message}
          </span>
        </div>
      </div>

      {/* Recommendations */}
      {report.recommendations && report.recommendations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-2">Recommendations</h4>
          <ul className="space-y-2">
            {report.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className={`
                  inline-block w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0
                  ${rec.type === 'error' ? 'bg-red-500' : 
                    rec.type === 'warning' ? 'bg-yellow-500' : 
                    rec.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}
                `}></span>
                <span className="text-sm text-gray-700">{rec.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BrowserCompatibilityNotice;
