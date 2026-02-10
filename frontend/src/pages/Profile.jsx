import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout, getCurrentUser } from '../services/authService';
import { getDashboardSummary } from '../services/dashboardService';
import { uploadResume, getResumeHistory } from '../services/resumeService';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  
  // Resume states
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Editable career fields
  const [editingCareer, setEditingCareer] = useState(false);
  const [careerData, setCareerData] = useState({
    education: '',
    college: '',
    degree: '',
    cgpa: '',
    certificates: []
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile, stats, and resume history in parallel
      const [profileResponse, statsResponse, resumeResponse] = await Promise.all([
        getProfile(),
        getDashboardSummary(),
        getResumeHistory(1, 1) // Get most recent resume
      ]);
      
      setUser(profileResponse.user);
      setEditedName(profileResponse.user.name);
      setStats(statsResponse.data);
      
      // Set resume data if exists
      if (resumeResponse.data?.resumes?.length > 0) {
        const latestResume = resumeResponse.data.resumes[0];
        setResumeData(latestResume);
        
        // Initialize editable career data
        setCareerData({
          education: latestResume.analysis?.sections?.hasEducation ? 'Available' : 'Not available',
          college: 'Extracted from resume',
          degree: 'Bachelor of Technology',
          cgpa: '8.5',
          certificates: latestResume.analysis?.sections?.hasCertifications 
            ? ['AWS Certified', 'React Professional'] 
            : []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedName(user.name);
    }
  };

  const handleSaveProfile = () => {
    // Frontend only - just update local state
    setUser({ ...user, name: editedName });
    localStorage.setItem('user', JSON.stringify({ ...user, name: editedName }));
    setIsEditing(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadError('Please upload a PDF file only');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setUploadError('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
      setUploadError('');
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setUploadError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      
      const response = await uploadResume(resumeFile, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      setResumeData(response.data);
      setResumeFile(null);
      setUploadProgress(0);
      
      // Update career data from analysis
      if (response.data.analysis) {
        setCareerData({
          education: response.data.analysis.sections?.hasEducation ? 'Available' : 'Not available',
          college: 'Extracted from resume',
          degree: 'Bachelor of Technology',
          cgpa: '8.5',
          certificates: response.data.analysis.sections?.hasCertifications 
            ? ['AWS Certified', 'React Professional'] 
            : []
        });
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      setUploadError(error.response?.data?.message || 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCareerEdit = (field, value) => {
    setCareerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddCertificate = () => {
    const newCert = prompt('Enter certificate name:');
    if (newCert && newCert.trim()) {
      setCareerData(prev => ({
        ...prev,
        certificates: [...prev.certificates, newCert.trim()]
      }));
    }
  };

  const handleRemoveCertificate = (index) => {
    setCareerData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Glass Navigation */}
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GetInterviewReady.AI
              </h1>
            </div>
          </div>
        </nav>

        {/* Loading Skeleton */}
        <div className="max-w-7xl mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="backdrop-blur-xl bg-white/60 border border-white/20 rounded-3xl shadow-xl shadow-black/5 p-6 animate-pulse">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="backdrop-blur-xl bg-white/60 border border-white/20 rounded-3xl shadow-xl shadow-black/5 p-6 animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-32 bg-gray-300 rounded-2xl"></div>
                  <div className="h-32 bg-gray-300 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Glass Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 
              onClick={() => navigate('/dashboard')}
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
            >
              GetInterviewReady.AI
            </h1>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-black/5 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-xl bg-white/60 border border-white/20 rounded-3xl shadow-xl shadow-black/5 p-8">
              
              {/* Avatar */}
              <div className="relative mb-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg shadow-blue-500/30">
                  {getInitials(user?.name)}
                </div>
                
                {/* Upload Photo Button (UI Only) */}
                <button 
                  className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 bg-white border-2 border-white/50 rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:scale-110"
                  title="Upload photo (Coming soon)"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              {isEditing ? (
                <div className="mb-6">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full text-center text-2xl font-bold text-gray-900 bg-white/50 border border-white/40 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              ) : (
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
                  {user?.name}
                </h2>
              )}

              <p className="text-sm text-gray-600 text-center mb-1">
                {user?.email}
              </p>
              
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Member since {formatDate(user?.createdAt)}
              </div>

              <div className="border-t border-white/20 pt-6 space-y-3">
                
                {/* Edit Profile Button */}
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditToggle}
                      className="w-full px-4 py-2.5 bg-white/50 hover:bg-white/70 text-gray-700 text-sm font-medium rounded-xl transition-all border border-white/40"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                )}

                {/* Change Password Button */}
                <button
                  onClick={() => alert('Change Password feature - Coming soon!')}
                  className="w-full px-4 py-2.5 bg-white/50 hover:bg-white/70 text-gray-700 text-sm font-medium rounded-xl transition-all border border-white/40 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>

              {/* Resume Upload Section */}
              <div className="border-t border-white/20 pt-6 mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Resume Analysis
                </h4>

                {/* Current Resume */}
                {resumeData && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">Current Resume</p>
                        <p className="text-xs text-gray-600 truncate">{resumeData.fileName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          ATS Score: <span className="font-bold text-green-600">{resumeData.analysis?.atsScore}/100</span>
                        </p>
                      </div>
                      <div className="bg-green-500/20 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Upload Area */}
                <div 
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-white/40 rounded-xl p-4 text-center cursor-pointer transition-all ${
                    uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500/40 hover:bg-blue-500/5'
                  }`}
                >
                  <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">
                    {resumeFile ? resumeFile.name : 'Upload Resume (PDF)'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Uploading...</span>
                      <span className="text-xs text-gray-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {uploadError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600">{uploadError}</p>
                  </div>
                )}

                {/* Upload Button */}
                {resumeFile && !uploading && (
                  <button
                    onClick={handleResumeUpload}
                    className="w-full mt-3 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Analyze Resume
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Settings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Section */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/20 rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Your Statistics
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Total Interviews */}
                <div className="group backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white/30 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Interviews</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {stats?.totalInterviews || 0}
                  </p>
                </div>

                {/* Average Score */}
                <div className="group backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-white/30 rounded-2xl p-6 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {stats?.overallAverageScore ? `${stats.overallAverageScore}/10` : '0/10'}
                  </p>
                </div>

                {/* Completed Interviews */}
                <div className="group backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/30 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stats?.completedInterviews || 0}
                  </p>
                </div>

                {/* In Progress */}
                <div className="group backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-white/30 rounded-2xl p-6 hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {(stats?.totalInterviews || 0) - (stats?.completedInterviews || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Preferences Section (UI Only) */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/20 rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Preferences
              </h3>

              <div className="space-y-4">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Dark Mode</p>
                      <p className="text-xs text-gray-600">Coming soon</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" disabled />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all opacity-50"></div>
                  </label>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-xs text-gray-600">Coming soon</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" disabled />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all opacity-50"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
