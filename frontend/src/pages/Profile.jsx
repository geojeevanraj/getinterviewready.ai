import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout, getCurrentUser, updateProfile, changePassword } from '../services/authService';
import { getDashboardSummary } from '../services/dashboardService';
import { uploadResume, getResumeHistory } from '../services/resumeService';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Change password states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Resume states
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Editable profile sections
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [editingCerts, setEditingCerts] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');

  // Profile data from DB
  const [profileData, setProfileData] = useState({
    phone: '',
    education: [],
    skills: [],
    certifications: [],
    resumeExtracted: false,
    resumeExtractedAt: null
  });

  // Education form for adding
  const [eduForm, setEduForm] = useState({ degree: '', institution: '', year: '', cgpa: '' });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      const [profileResponse, statsResponse, resumeResponse] = await Promise.all([
        getProfile(),
        getDashboardSummary(),
        getResumeHistory(1, 1)
      ]);

      const u = profileResponse.user;
      setUser(u);
      setEditedName(u.name);
      setStats(statsResponse.data);
      setProfileData({
        phone: u.phone || '',
        education: u.education || [],
        skills: u.skills || [],
        certifications: u.certifications || [],
        resumeExtracted: u.resumeExtracted || false,
        resumeExtractedAt: u.resumeExtractedAt || null
      });

      if (resumeResponse.data?.resumes?.length > 0) {
        setResumeData(resumeResponse.data.resumes[0]);
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
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) setEditedName(user.name);
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) { setSaveError('Name cannot be empty'); return; }
    try {
      setSaving(true);
      setSaveError('');
      const response = await updateProfile({ name: editedName.trim() });
      setUser(response.user);
      setIsEditing(false);
      setSaveSuccess('Profile updated successfully');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (error) {
      setSaveError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword) { setPasswordError('All fields are required'); return; }
    if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match'); return; }
    try {
      setChangingPassword(true);
      setPasswordError('');
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => { setShowPasswordModal(false); setPasswordSuccess(''); }, 2000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') { setUploadError('Please upload a PDF file only'); return; }
      if (file.size > 5 * 1024 * 1024) { setUploadError('File size must be less than 5MB'); return; }
      setResumeFile(file);
      setUploadError('');
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) { setUploadError('Please select a file first'); return; }
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

      // Refresh profile to get extracted data
      if (response.profileExtracted) {
        const profileResponse = await getProfile();
        const u = profileResponse.user;
        setUser(u);
        setProfileData({
          phone: u.phone || '',
          education: u.education || [],
          skills: u.skills || [],
          certifications: u.certifications || [],
          resumeExtracted: u.resumeExtracted || false,
          resumeExtractedAt: u.resumeExtractedAt || null
        });
        setSaveSuccess('Profile updated from resume');
        setTimeout(() => setSaveSuccess(''), 4000);
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading resume:', error);
      setUploadError(error.response?.data?.message || 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // --- Education CRUD ---
  const handleAddEducation = () => {
    if (!eduForm.degree.trim() && !eduForm.institution.trim()) return;
    const updated = [...profileData.education, { ...eduForm }];
    saveProfileField('education', updated);
    setEduForm({ degree: '', institution: '', year: '', cgpa: '' });
  };

  const handleRemoveEducation = (index) => {
    const updated = profileData.education.filter((_, i) => i !== index);
    saveProfileField('education', updated);
  };

  // --- Skills CRUD ---
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (profileData.skills.includes(newSkill.trim())) { setNewSkill(''); return; }
    const updated = [...profileData.skills, newSkill.trim()];
    saveProfileField('skills', updated);
    setNewSkill('');
  };

  const handleRemoveSkill = (index) => {
    const updated = profileData.skills.filter((_, i) => i !== index);
    saveProfileField('skills', updated);
  };

  // --- Certifications CRUD ---
  const handleAddCert = () => {
    if (!newCert.trim()) return;
    const updated = [...profileData.certifications, newCert.trim()];
    saveProfileField('certifications', updated);
    setNewCert('');
  };

  const handleRemoveCert = (index) => {
    const updated = profileData.certifications.filter((_, i) => i !== index);
    saveProfileField('certifications', updated);
  };

  // Generic save helper
  const saveProfileField = async (field, value) => {
    try {
      const response = await updateProfile({ [field]: value });
      setUser(response.user);
      setProfileData(prev => ({ ...prev, [field]: value }));
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setSaveError(`Failed to update ${field}`);
      setTimeout(() => setSaveError(''), 3000);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h1>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5 animate-pulse">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage your account and resume information</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ═══════════════ Left Column ═══════════════ */}
            <div className="lg:col-span-1 space-y-6">

              {/* Profile Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
                {/* Avatar */}
                <div className="relative mb-5">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                    {getInitials(user?.name)}
                  </div>
                </div>

                {/* User Info */}
                {isEditing ? (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full text-center text-lg font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                ) : (
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-1">{user?.name}</h2>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-1">{user?.email}</p>
                {profileData.phone && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-1">{profileData.phone}</p>
                )}
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-2 mb-5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Member since {formatDate(user?.createdAt)}
                </div>

                {/* Resume Extracted Badge */}
                {profileData.resumeExtracted && (
                  <div className="mb-5 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Updated from Resume
                      {profileData.resumeExtractedAt && (
                        <span className="text-emerald-500 dark:text-emerald-400"> · {formatDateTime(profileData.resumeExtractedAt)}</span>
                      )}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-800 pt-5 space-y-2.5">
                  {/* Edit Profile */}
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-md text-sm font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEditToggle}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </button>
                  )}

                  {/* Change Password */}
                  <button
                    onClick={() => { setPasswordError(''); setPasswordSuccess(''); setShowPasswordModal(true); }}
                    className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Change Password
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-4 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>

              {/* Resume Upload Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Resume Analysis
                </h4>

                {/* Current Resume */}
                {resumeData && (
                  <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-md">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">Current Resume</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{resumeData.fileName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          ATS Score: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{resumeData.analysis?.atsScore}/100</span>
                        </p>
                      </div>
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Input */}
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />

                {/* Upload Area */}
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-all ${
                    uploading
                      ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-700'
                      : resumeFile
                      ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950'
                      : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {resumeFile ? resumeFile.name : 'Upload Resume (PDF)'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 5MB</p>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-indigo-500/20 border-t-indigo-600"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Uploading & extracting profile...</span>
                      </div>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {uploadError && (
                  <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-md">
                    <p className="text-xs text-rose-600 dark:text-rose-400">{uploadError}</p>
                  </div>
                )}

                {/* Upload Button */}
                {resumeFile && !uploading && (
                  <button
                    onClick={handleResumeUpload}
                    className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Analyze Resume
                  </button>
                )}
              </div>
            </div>

            {/* ═══════════════ Right Column ═══════════════ */}
            <div className="lg:col-span-2 space-y-6">

              {/* Statistics */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  Your Statistics
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 text-center">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Interviews</p>
                    <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">{stats?.totalInterviews || 0}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 text-center">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Average Score</p>
                    <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{stats?.overallAverageScore ? `${stats.overallAverageScore}/10` : '0/10'}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                    <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">{stats?.completedInterviews || 0}</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">In Progress</p>
                    <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{(stats?.totalInterviews || 0) - (stats?.completedInterviews || 0)}</p>
                  </div>
                </div>
              </div>

              {/* ═══════ Education Section ═══════ */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    Education
                  </h3>
                  <button
                    onClick={() => setEditingEducation(!editingEducation)}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    {editingEducation ? 'Done' : '+ Add'}
                  </button>
                </div>

                {profileData.education.length > 0 ? (
                  <div className="space-y-3">
                    {profileData.education.map((edu, index) => (
                      <div key={index} className="p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{edu.degree || 'Degree not specified'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{edu.institution || 'Institution not specified'}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              {edu.year && (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {edu.year}
                                </span>
                              )}
                              {edu.cgpa && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                  CGPA: {edu.cgpa}
                                </span>
                              )}
                            </div>
                          </div>
                          {editingEducation && (
                            <button
                              onClick={() => handleRemoveEducation(index)}
                              className="ml-2 p-1 text-gray-400 hover:text-rose-500 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No education entries yet. Upload a resume or add manually.</p>
                )}

                {/* Add Education Form */}
                {editingEducation && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Degree (e.g. B.Tech CSE)"
                        value={eduForm.degree}
                        onChange={(e) => setEduForm(prev => ({ ...prev, degree: e.target.value }))}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Institution"
                        value={eduForm.institution}
                        onChange={(e) => setEduForm(prev => ({ ...prev, institution: e.target.value }))}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Year (e.g. 2024)"
                        value={eduForm.year}
                        onChange={(e) => setEduForm(prev => ({ ...prev, year: e.target.value }))}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="CGPA (e.g. 8.5/10)"
                        value={eduForm.cgpa}
                        onChange={(e) => setEduForm(prev => ({ ...prev, cgpa: e.target.value }))}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      onClick={handleAddEducation}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all"
                    >
                      Add Education
                    </button>
                  </div>
                )}
              </div>

              {/* ═══════ Skills Section ═══════ */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    Skills
                    {profileData.skills.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{profileData.skills.length}</span>
                    )}
                  </h3>
                  <button
                    onClick={() => setEditingSkills(!editingSkills)}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    {editingSkills ? 'Done' : 'Edit'}
                  </button>
                </div>

                {profileData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      >
                        {skill}
                        {editingSkills && (
                          <button
                            onClick={() => handleRemoveSkill(index)}
                            className="text-indigo-400 hover:text-rose-500 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No skills added yet. Upload a resume or add manually.</p>
                )}

                {editingSkills && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                      className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleAddSkill}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* ═══════ Certifications Section ═══════ */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-50 dark:bg-amber-950 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    Certifications
                    {profileData.certifications.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{profileData.certifications.length}</span>
                    )}
                  </h3>
                  <button
                    onClick={() => setEditingCerts(!editingCerts)}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    {editingCerts ? 'Done' : 'Edit'}
                  </button>
                </div>

                {profileData.certifications.length > 0 ? (
                  <div className="space-y-2">
                    {profileData.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md group">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-900 dark:text-white truncate">{cert}</span>
                        </div>
                        {editingCerts && (
                          <button
                            onClick={() => handleRemoveCert(index)}
                            className="ml-2 p-1 text-gray-400 hover:text-rose-500 transition-colors flex-shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No certifications added yet. Upload a resume or add manually.</p>
                )}

                {editingCerts && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a certification..."
                      value={newCert}
                      onChange={(e) => setNewCert(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCert()}
                      className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleAddCert}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Preferences */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Preferences
                </h3>

                <div className="space-y-3">
                  {[
                    { icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z', label: 'Dark Mode', sub: 'Coming soon' },
                    { icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', label: 'Email Notifications', sub: 'Coming soon' }
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={pref.icon} />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{pref.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{pref.sub}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-not-allowed">
                        <input type="checkbox" className="sr-only peer" disabled />
                        <div className="w-9 h-5 bg-gray-300 dark:bg-gray-600 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all opacity-50"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Messages */}
      {(saveSuccess || saveError) && (
        <div className="fixed bottom-6 right-6 z-50">
          {saveSuccess && (
            <div className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-md shadow-lg text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {saveSuccess}
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 bg-rose-600 text-white px-4 py-3 rounded-md shadow-lg text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {saveError}
            </div>
          )}
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>

            {passwordError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-md text-sm text-rose-600 dark:text-rose-400">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-md text-sm text-emerald-600 dark:text-emerald-400">
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-3">
              {[
                { label: 'Current Password', key: 'currentPassword', placeholder: 'Enter current password' },
                { label: 'New Password', key: 'newPassword', placeholder: 'Enter new password (min 6 chars)' },
                { label: 'Confirm New Password', key: 'confirmPassword', placeholder: 'Confirm new password' }
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{field.label}</label>
                  <input
                    type="password"
                    value={passwordData[field.key]}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50"
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
              <button
                onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess(''); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                className="flex-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-md text-sm font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
