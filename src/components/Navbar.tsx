import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, LogOut, User, Building2, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { role, signOut, student, university } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (role === 'university') return '/university/dashboard';
    if (role === 'student') return '/student/dashboard';
    return '/';
  };

  const isLoggedIn = role && (university || student);

  return (
    <nav className="bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <Award className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Certify
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isLoggedIn ? (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-2 rounded-xl border border-gray-200">
                    {role === 'university' ? (
                      <>
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          {university?.name || 'University'}
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          {student?.student_name || 'Student'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Navigation Links */}
                <Link 
                  to={getDashboardPath()} 
                  className="flex items-center text-gray-700 hover:text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 font-semibold"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/verify" 
                  className="flex items-center text-gray-700 hover:text-green-600 px-4 py-2 rounded-xl hover:bg-green-50 transition-all duration-200 font-semibold"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify
                </Link>
                <button 
                  onClick={handleSignOut} 
                  className="flex items-center text-gray-700 hover:text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-200 font-semibold"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/verify" 
                  className="flex items-center text-gray-700 hover:text-green-600 px-4 py-2 rounded-xl hover:bg-green-50 transition-all duration-200 font-semibold"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Certificate
                </Link>
                <Link 
                  to="/login" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg mb-4">
                    <div className="flex items-center space-x-2">
                      {role === 'university' ? (
                        <>
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">
                            {university?.name || 'University'}
                          </span>
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">
                            {student?.student_name || 'Student'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link 
                    to={getDashboardPath()} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/verify" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium"
                  >
                    Verify Certificate
                  </Link>
                  <button 
                    onClick={handleSignOut} 
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/verify" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium"
                  >
                    Verify Certificate
                  </Link>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-center"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;