import { useState, useRef } from 'react';
import { uploadResume } from '../services/resumeService';
import { useNavigate } from 'react-router-dom';

const ResumeUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    setError('');

    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setAnalysis(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');

      const data = await uploadResume(selectedFile, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      if (data.success) {
        setAnalysis(data.data);
        setSelectedFile(null);
        setUploadProgress(0);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload resume');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header Bar */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Resume Analyzer</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">AI-powered resume analysis and ATS scoring</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="max-w-5xl mx-auto space-y-6">

      {!analysis ? (
        /* Upload Section */
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow transition-all p-5">
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 scale-[1.02]'
                : selectedFile
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950'
                : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-gray-50 dark:bg-gray-900'
            }`}
          >
            {/* Upload Icon */}
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg mb-4 transition-all ${
              dragActive
                ? 'bg-indigo-100 dark:bg-indigo-900 scale-110'
                : selectedFile
                ? 'bg-emerald-100 dark:bg-emerald-900'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              {selectedFile ? (
                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg
                  className={`w-8 h-8 transition-colors ${
                    dragActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              )}
            </div>

            {/* Upload Text */}
            <div className="space-y-2">
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {selectedFile ? selectedFile.name : dragActive ? 'Drop your resume here' : 'Drop your resume here'}
              </p>
              {selectedFile ? (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  {(selectedFile.size / 1024).toFixed(2)} KB • Ready to analyze
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  or click to browse files
                </p>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Select File Button */}
            {!selectedFile && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white py-2.5 px-6 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all"
              >
                Select File
              </button>
            )}

            {/* File Format Note */}
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Supports PDF files up to 5MB
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-md">
              <div className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-5">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Uploading and analyzing...</span>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-indigo-500/20 border-t-indigo-600"></div>
                <span>AI is analyzing your resume...</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-6 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white py-2.5 px-6 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
            >
              {uploading ? 'Analyzing...' : 'Upload & Analyze'}
            </button>
          </div>
        </div>
      ) : (
        /* Analysis Results */
        <div className="space-y-6">
          {/* ATS Score Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 border-2 border-indigo-700 rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white/80 uppercase tracking-wide mb-2">ATS Score</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-5xl sm:text-6xl font-bold text-white">{analysis.analysis?.atsScore ?? 'N/A'}</p>
                  <p className="text-2xl font-semibold text-white/90">/100</p>
                </div>
                <p className="text-base font-medium text-white/90 mt-2">
                  {getScoreLabel(analysis.analysis?.atsScore ?? 0)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-md p-4 text-right">
                <p className="text-xs text-white/70 mb-1">File</p>
                <p className="text-sm font-medium text-white truncate max-w-[200px]">{analysis.fileName}</p>
                <p className="text-xs text-white/70 mt-2">{(analysis.fileSize / 1024).toFixed(2)} KB</p>
                <p className="text-xs text-white/70 mt-1">
                  {new Date(analysis.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          {analysis.analysis.scoreBreakdown && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Score Breakdown</h2>
              <div className="space-y-4">
                {[
                  { label: 'Keyword Optimization', value: analysis.analysis.scoreBreakdown.keywordOptimization },
                  { label: 'Formatting', value: analysis.analysis.scoreBreakdown.formatting },
                  { label: 'Content Quality', value: analysis.analysis.scoreBreakdown.contentQuality },
                  { label: 'Completeness', value: analysis.analysis.scoreBreakdown.completeness },
                  { label: 'Impact Metrics', value: analysis.analysis.scoreBreakdown.impactMetrics }
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          item.value >= 80 ? 'bg-emerald-500 dark:bg-emerald-400' :
                          item.value >= 60 ? 'bg-amber-500 dark:bg-amber-400' :
                          'bg-rose-500 dark:bg-rose-400'
                        }`}
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords Section */}
          {analysis.analysis.keywords && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Extracted Keywords</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Technical Keywords */}
                {analysis.analysis.keywords.technical?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2.5 flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full mr-2"></span>
                      Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.analysis.keywords.technical.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-md text-xs font-medium">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools */}
                {analysis.analysis.keywords.tools?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2.5 flex items-center">
                      <span className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full mr-2"></span>
                      Tools & Platforms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.analysis.keywords.tools.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-md text-xs font-medium">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Soft Skills */}
                {analysis.analysis.keywords.soft?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2.5 flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full mr-2"></span>
                      Soft Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.analysis.keywords.soft.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs font-medium">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Keywords */}
                {analysis.analysis.keywords.missing?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2.5 flex items-center">
                      <span className="w-2 h-2 bg-rose-500 dark:bg-rose-400 rounded-full mr-2"></span>
                      Recommended to Add
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.analysis.keywords.missing.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-md text-xs font-medium">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Strengths</h2>
              </div>
              <ul className="space-y-2.5">
                {analysis.analysis?.strengths?.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Weaknesses</h2>
              </div>
              <ul className="space-y-2.5">
                {analysis.analysis?.weaknesses?.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Skills */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Missing Skills</h2>
              </div>
              <ul className="space-y-2.5">
                {analysis.analysis?.missingSkills?.map((skill, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvement Suggestions */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Improvement Suggestions</h2>
              </div>
              <ul className="space-y-2.5">
                {analysis.analysis?.improvementSuggestions?.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setAnalysis(null);
                setSelectedFile(null);
                setError('');
              }}
              className="flex-1 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white py-2.5 px-6 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all"
            >
              Upload Another Resume
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-6 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
