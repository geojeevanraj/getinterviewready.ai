import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import { getDashboardSummary } from '../services/dashboardService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardSummary();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500/20 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Glass Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 hover:bg-black/5 rounded-xl transition-colors">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GetInterviewReady.AI
              </h1>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/interview/history')}
                className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-black/5 rounded-xl transition-all"
              >
                History
              </button>
              
              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/70 transition-all"
                >
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-white/90 border border-white/20 rounded-xl shadow-xl shadow-black/10 overflow-hidden z-50">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50/50 flex items-center gap-3 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50/50 flex items-center gap-3 transition-colors border-t border-white/20"
                    >
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Logout Button */}
              <button
                onClick={handleLogout}
                className="sm:hidden p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-lg shadow-red-500/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section - Glass Card */}
        <div className="backdrop-blur-xl bg-white/60 border border-white/20 rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Welcome Back, {user?.name}!
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Ready to level up your interview skills? Let's get started.
          </p>
        </div>

        {/* Statistics Cards - Glass Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Interviews - Glass Card */}
          <div className="group backdrop-blur-xl bg-white/60 border border-white/20 rounded-2xl shadow-lg shadow-black/5 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Total Interviews</p>
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {dashboardData?.totalInterviews || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm p-4 rounded-2xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Average Score - Glass Card */}
          <div className="group backdrop-blur-xl bg-white/60 border border-white/20 rounded-2xl shadow-lg shadow-black/5 p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Average Score</p>
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {dashboardData?.overallAverageScore || 0}/10
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm p-4 rounded-2xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Start New Interview - Gradient Glass */}
          <div 
            onClick={() => navigate('/interview/start')}
            className="group backdrop-blur-xl bg-gradient-to-br from-blue-500/90 to-indigo-600/90 border border-white/20 rounded-2xl shadow-xl shadow-blue-500/30 p-6 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 sm:col-span-2 lg:col-span-1"
          >
            <div className="text-center text-white">
              <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-lg sm:text-xl font-bold">Start New Interview</p>
              <p className="text-sm mt-1 text-white/80">Begin practice session</p>
            </div>
          </div>
        </div>

        {/* Score Chart - Glass Card */}
        {dashboardData?.scoreHistory && dashboardData.scoreHistory.length > 0 && (
          <div className="backdrop-blur-xl bg-white/60 border border-white/20 rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Score Progress</h3>
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis domain={[0, 10]} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} dot={{ r: 6, fill: '#3B82F6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Interviews - Glass Card */}
        <div className="backdrop-blur-xl bg-white/60 border border-white/20 rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Interviews</h3>
            <button
              onClick={() => navigate('/interview/history')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {dashboardData?.recentInterviews && dashboardData.recentInterviews.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentInterviews.map((interview) => (
                <div
                  key={interview.id}
                  onClick={() => navigate('/interview/history')}
                  className="group flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/60 hover:shadow-lg cursor-pointer transition-all duration-300"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {interview.jobRole}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">
                        {new Date(interview.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={`text-base sm:text-lg font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm ${getScoreColor(interview.averageScore)}`}>
                    {interview.averageScore}/10
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-gray-100/60 to-gray-200/40 backdrop-blur-sm w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-3 font-medium">No interviews yet</p>
              <button
                onClick={() => navigate('/interview/start')}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Start your first interview
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
