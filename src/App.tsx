import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import VerifyCertificate from './pages/VerifyCertificate';
import Login from './pages/Login';
import UniversityRegister from './pages/UniversityRegister';
import UniversityDashboard from './pages/university/UniversityDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<UniversityRegister />} />

            {/* University Protected Route */}
            <Route
              path="/university/dashboard"
              element={
                <ProtectedRoute role="university">
                  <UniversityDashboard />
                </ProtectedRoute>
              }
            />

            {/* Student Protected Route */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;