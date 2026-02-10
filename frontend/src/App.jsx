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
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated } from './services/authService';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to dashboard if authenticated, otherwise to login */}
        <Route 
          path="/" 
          element={
            isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />

        {/* Public Routes */}
        <Route 
          path="/register" 
          element={
            isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Register />
          } 
        />
        <Route 
          path="/login" 
          element={
            isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Interview Routes */}
        <Route
          path="/interview/start"
          element={
            <ProtectedRoute>
              <InterviewStart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/session"
          element={
            <ProtectedRoute>
              <InterviewSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/result"
          element={
            <ProtectedRoute>
              <ResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/history"
          element={
            <ProtectedRoute>
              <InterviewHistory />
            </ProtectedRoute>
          }
        />

        {/* Recommendations Route */}
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />

        {/* Resume Upload Route */}
        <Route
          path="/resume/upload"
          element={
            <ProtectedRoute>
              <ResumeUpload />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
