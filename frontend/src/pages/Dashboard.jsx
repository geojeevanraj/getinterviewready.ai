import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import { getDashboardSummary, getStreakData } from '../services/dashboardService';
import { getInterviewById } from '../services/interviewService';
import { getRecommendations, completeChallenge as completeChallengeApi } from '../services/recommendationsService';
import { getAptitudeStats } from '../services/aptitudeService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [completingChallenge, setCompletingChallenge] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [aptitudeStats, setAptitudeStats] = useState(null);
  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashResponse, recResponse, streakResponse, aptitudeResponse] = await Promise.all([
        getDashboardSummary(),
        getRecommendations().catch(() => null),
        getStreakData().catch(() => null),
        getAptitudeStats().catch(() => null)
      ]);
      setDashboardData(dashResponse.data);
      if (recResponse?.success) {
        setRecommendations(recResponse.data);
      }
      if (streakResponse?.success) {
        setStreakData(streakResponse.data);
      }
      if (aptitudeResponse?.success) {
        setAptitudeStats(aptitudeResponse.data);
      }
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

  const viewInterviewResult = async (interviewId) => {
    try {
      const response = await getInterviewById(interviewId);
      navigate('/interview/result', {
        state: { resultData: response.data }
      });
    } catch (error) {
      console.error('Error fetching interview:', error);
    }
  };

  const handleCompleteChallenge = async () => {
    if (!recommendations?._id) return;
    try {
      setCompletingChallenge(true);
      const data = await completeChallengeApi(recommendations._id);
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
    } finally {
      setCompletingChallenge(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Medium': return 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Hard': return 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default: return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800';
    if (score >= 6) return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800';
    return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800';
  };

  /* ══════════════════════ SIDEBAR NAV ITEMS ══════════════════════ */
  const sidebarItems = [
    { 
      id: 'home', 
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      ), 
      action: () => setActiveNav('home')
    },
    { 
      id: 'interview', 
      label: 'Start Interview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      ), 
      action: () => navigate('/interview/start') 
    },
    { 
      id: 'aptitude', 
      label: 'Aptitude Tests',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
      ), 
      action: () => navigate('/aptitude') 
    },
    { 
      id: 'history', 
      label: 'History',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ), 
      action: () => navigate('/interview/history') 
    },
    { 
      id: 'challenges', 
      label: 'Challenges',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      ), 
      action: () => navigate('/recommendations') 
    },
    { 
      id: 'resume', 
      label: 'Resume',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      ), 
      action: () => navigate('/resume/upload') 
    },
    { 
      id: 'profile', 
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      ), 
      action: () => navigate('/profile') 
    },
  ];

  /* ══════════════════════ LOADING STATE ══════════════════════ */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-screen fixed">
            <div className="p-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-32"></div>
            </div>
          </aside>
          
          {/* Main Content Skeleton */}
          <div className="flex-1 lg:ml-64 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header skeleton */}
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse w-64"></div>
              
              {/* Stats cards skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                ))}
              </div>
              
              {/* Content skeleton */}
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      
      {/* ════════════════════ SIDEBAR (Desktop) ════════════════════ */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-screen fixed z-30">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">GetInterviewReady<span className="text-indigo-500">.ai</span></h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ace every interview with AI</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveNav(item.id); item.action(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${activeNav === item.id
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md bg-gray-50 dark:bg-gray-800">
            <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-1.5 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ════════════════════ MOBILE SIDEBAR ════════════════════ */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-gray-900/50 dark:bg-gray-950/70" onClick={() => setIsSidebarOpen(false)} />
          <aside className="relative w-72 bg-white dark:bg-gray-900 shadow-xl flex flex-col max-h-screen overflow-y-auto">
            {/* Mobile Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">GetInterviewReady<span className="text-indigo-500">.ai</span></h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ace every interview with AI</p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveNav(item.id); item.action(); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${activeNav === item.id
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile User Section */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => { handleLogout(); setIsSidebarOpen(false); }}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ════════════════════ MAIN CONTENT ════════════════════ */}
      <div className="lg:ml-60">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button + Title */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">GetInterviewReady.ai</h2>
                </div>
              </div>

              {/* Streak Badge */}
              {streakData && streakData.currentStreak > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md">
                  <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 23c-3.866 0-7-3.134-7-7 0-3.526 2.339-6.074 4-8 .645.867 1.107 1.834 1.592 2.78C11.607 8.387 13.122 6 14 3c1.684 2.87 5 6.691 5 13 0 3.866-3.134 7-7 7zm-2-7c0 2.21.895 3 2 3s2-.79 2-3c0-2-1-3.5-2-5-1 1.5-2 3-2 5z"/>
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-orange-700 dark:text-orange-300">{streakData.currentStreak} day streak</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-5 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ══════════════ WELCOME SECTION ══════════════ */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-lg shadow-sm border border-indigo-600 dark:border-indigo-500">
              <div className="absolute inset-0 bg-grid-white/10"></div>
              <div className="relative px-6 py-5">
                <h3 className="text-xl font-semibold text-white mb-1">
                  Hello, <span className="text-indigo-100">{user?.name}!</span>
                </h3>
                <p className="text-indigo-100 text-sm">
                  Ready to level up your interview skills? Let's get started.
                </p>
              </div>
            </div>

            {/* ══════════════ STATISTICS CARDS ══════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Interviews */}
              <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow transition-all p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Interviews</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{dashboardData?.totalInterviews || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Average Score */}
              <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow transition-all p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Average Score</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                      {dashboardData?.overallAverageScore || 0}
                      <span className="text-base text-gray-500 dark:text-gray-400">/10</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Performance metric</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Aptitude Tests */}
              <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow transition-all p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Aptitude Tests</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{aptitudeStats?.totalTests || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {aptitudeStats?.averageScore ? `${aptitudeStats.averageScore}% avg` : 'Not started'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Current Streak */}
              <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow transition-all p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Streak</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{streakData?.currentStreak || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Max: {streakData?.maxStreak || 0} days
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 23c-3.866 0-7-3.134-7-7 0-3.526 2.339-6.074 4-8 .645.867 1.107 1.834 1.592 2.78C11.607 8.387 13.122 6 14 3c1.684 2.87 5 6.691 5 13 0 3.866-3.134 7-7 7zm-2-7c0 2.21.895 3 2 3s2-.79 2-3c0-2-1-3.5-2-5-1 1.5-2 3-2 5z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════════════ PRIMARY CTA: START INTERVIEW ══════════════ */}
            <button
              onClick={() => navigate('/interview/start')}
              className="group w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg shadow-sm hover:shadow transition-all px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-base font-semibold">Start New Interview</p>
                  <p className="text-xs text-indigo-100">Practice with AI-powered sessions</p>
                </div>
              </div>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            {/* ══════════════ APTITUDE PRACTICE BANNER ══════════════ */}
            <div 
              onClick={() => navigate('/aptitude')}
              className="group cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow transition-all p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Aptitude Practice</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Test your quantitative, logical, and verbal reasoning skills
                    </p>
                    {aptitudeStats && aptitudeStats.totalTests > 0 && (
                      <div className="mt-2.5 flex items-center gap-4">
                        <div className="flex-1 max-w-xs">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Average Score</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">{aptitudeStats.averageScore}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 dark:bg-amber-600 rounded-full transition-all duration-500"
                              style={{ width: `${aptitudeStats.averageScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* ══════════════ SCORE PROGRESS CHART ══════════════ */}
            {dashboardData?.scoreHistory && dashboardData.scoreHistory.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Score Progress</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Track your improvement over time</p>
                  </div>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.scoreHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af" 
                        className="dark:stroke-gray-500"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        stroke="#9ca3af" 
                        className="dark:stroke-gray-500"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          padding: '12px'
                        }}
                        labelStyle={{ color: '#374151', fontWeight: 600 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ══════════════ DAILY CHALLENGE + TOPICS GRID ══════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Daily Challenge */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Daily Challenge</h3>
                </div>

                {recommendations?.dailyChallenge ? (
                  <div className="space-y-3">
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${getDifficultyColor(recommendations.dailyChallenge.difficulty)}`}>
                      {recommendations.dailyChallenge.difficulty}
                    </span>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1.5">{recommendations.dailyChallenge.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                        {recommendations.dailyChallenge.description}
                      </p>
                    </div>

                    {!recommendations.completed ? (
                      <button
                        onClick={handleCompleteChallenge}
                        disabled={completingChallenge}
                        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {completingChallenge ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Completing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Mark as Completed
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-md">
                        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Completed!</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">No challenge available yet</p>
                    <button
                      onClick={() => navigate('/interview/start')}
                      className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      Complete interviews to unlock
                    </button>
                  </div>
                )}
              </div>

              {/* Weak Topics */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 bg-rose-50 dark:bg-rose-950 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Weak Topics</h3>
                </div>

                {recommendations?.weakTopics?.length > 0 ? (
                  <div className="space-y-2">
                    {recommendations.weakTopics.slice(0, 4).map((topic, index) => (
                      <div key={index} className="flex items-center justify-between px-3 py-2 bg-rose-50 dark:bg-rose-950 border border-rose-100 dark:border-rose-900 rounded-md">
                        <span className="text-xs text-gray-900 dark:text-white capitalize">{topic.topic}</span>
                        <span className="px-2 py-0.5 text-xs font-semibold bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 rounded">
                          {topic.frequency}×
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No weak topics identified</p>
                  </div>
                )}
              </div>

              {/* Recommended Topics */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Recommended</h3>
                </div>

                {recommendations?.recommendedTopics?.length > 0 ? (
                  <div className="space-y-2">
                    {recommendations.recommendedTopics.map((topic, index) => (
                      <div key={index} className="flex items-start gap-2.5 px-3 py-2.5 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">{topic}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">AI will suggest topics</p>
                  </div>
                )}
              </div>
            </div>

            {/* View All Recommendations */}
            {recommendations && (recommendations.weakTopics?.length > 0 || recommendations.recommendedTopics?.length > 0) && (
              <div className="text-center">
                <button
                  onClick={() => navigate('/recommendations')}
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  View all recommendations
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            )}

            {/* ══════════════ RECENT INTERVIEWS ══════════════ */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Interviews</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your latest practice sessions</p>
                  </div>
                  {dashboardData?.recentInterviews?.length > 0 && (
                    <button
                      onClick={() => navigate('/interview/history')}
                      className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      View All
                    </button>
                  )}
                </div>
              </div>

              {dashboardData?.recentInterviews && dashboardData.recentInterviews.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {dashboardData.recentInterviews.map((interview) => (
                    <button
                      key={interview.id}
                      onClick={() => viewInterviewResult(interview.id)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {interview.role}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(interview.completedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className={`text-sm font-semibold px-2.5 py-1 rounded-md border ${getScoreColor(interview.averageScore)}`}>
                          {interview.averageScore}/10
                        </span>
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-10 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No interviews yet</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Start your first interview to see results here</p>
                  <button
                    onClick={() => navigate('/interview/start')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-medium rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Start First Interview
                  </button>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
