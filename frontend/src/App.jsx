import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import InterviewStart from './pages/InterviewStart';
import InterviewSession from './pages/InterviewSession';
import ResultPage from './pages/ResultPage';
import InterviewHistory from './pages/InterviewHistory';
import Recommendations from './pages/Recommendations';
import ResumeUpload from './pages/ResumeUpload';
import AptitudeSelection from './pages/AptitudeSelection';
import AptitudeTest from './pages/AptitudeTest';
import AptitudeResults from './pages/AptitudeResults';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Wrapper for public routes that redirects authenticated users
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Redirect root to dashboard if authenticated, otherwise to login */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } 
      />

      {/* Public Routes */}
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/interview/start" element={<ProtectedRoute><InterviewStart /></ProtectedRoute>} />
      <Route path="/interview/session" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
      <Route path="/interview/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
      <Route path="/interview/history" element={<ProtectedRoute><InterviewHistory /></ProtectedRoute>} />
      <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
      <Route path="/resume/upload" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
      <Route path="/aptitude" element={<ProtectedRoute><AptitudeSelection /></ProtectedRoute>} />
      <Route path="/aptitude/test" element={<ProtectedRoute><AptitudeTest /></ProtectedRoute>} />
      <Route path="/aptitude/results" element={<ProtectedRoute><AptitudeResults /></ProtectedRoute>} />

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
