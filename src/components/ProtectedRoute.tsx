import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Award } from 'lucide-react';

interface ProtectedRouteProps {
  children: JSX.Element;
  role: 'university' | 'student';
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { role: userRole, loading } = useAuth();
  const location = useLocation();

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 shadow-lg">
            <Award className="h-10 w-10 text-white" />
          </div>
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If the user has the required role, render the protected component
  if (userRole === role) {
    return children;
  }

  // Otherwise, redirect to the login page
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;