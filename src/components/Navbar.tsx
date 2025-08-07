import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, LogOut, User, Building2, Shield, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const { role, signOut, student, university } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    await signOut();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (role === 'university') return '/university/dashboard';
    if (role === 'student') return '/student/dashboard';
    return '/';
  };

  const isLoggedIn = role && (university || student);
  
  const getUserDisplayName = () => {
    if (role === 'university' && university) {
      return university.name;
    }
    if (role === 'student' && student) {
      return student.student_name;
    }f
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-2xl border-b border-gray-100/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <Award className="h-7 w-7 text-white transform group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                  Certify
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1">Secure Certificates</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isLoggedIn ? (
              <>
                {/* Navigation Links */}
                <Link 
                  to={getDashboardPath()} 
                  className="flex items-center text-gray-700 hover:text-blue-600 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 font-semibold group"
                >
                  <span className="transform group-hover:scale-105 transition-transform duration-200">Dashboard</span>
                </Link>
                
                <Link 
                  to="/verify" 
                  className="flex items-center text-gray-700 hover:text-emerald-600 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 font-semibold group"
                >
                  <Shield className="h-4 w-4 mr-2 transform group-hover:scale-110 transition-transform duration-200" />
                  <span className="transform group-hover:scale-105 transition-transform duration-200">Verify</span>
                </Link>

                {/* User Menu */}
                <div className="relative ml-4" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                        role === 'university' 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                      }`}>
                        {getUserInitials()}
                      </div>
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span className="text-sm font-semibold text-gray-800 truncate w-full">
                          {getUserDisplayName()}
                        </span>
                        <span className="text-xs text-gray-500 capitalize font-medium">
                          {role}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-all duration-200 ${userDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50 py-2 animate-in slide-in-from-top-2 duration-200 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                            role === 'university' 
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                              : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                          }`}>
                            {getUserInitials()}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-semibold text-gray-800 break-words">
                              {getUserDisplayName()}
                            </span>
                            <div className="flex items-center text-xs text-gray-500 capitalize">
                              {role === 'university' ? (
                                <>
                                  <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
                                  University Account
                                </>
                              ) : (
                                <>
                                  <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                  Student Account
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <button 
                          onClick={handleSignOut} 
                          className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group"
                        >
                          <LogOut className="h-4 w-4 mr-3 transform group-hover:scale-110 transition-transform duration-200" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/verify" 
                  className="flex items-center text-gray-700 hover:text-emerald-600 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 font-semibold group"
                >
                  <Shield className="h-4 w-4 mr-2 transform group-hover:scale-110 transition-transform duration-200" />
                  <span className="transform group-hover:scale-105 transition-transform duration-200">Verify Certificate</span>
                </Link>
                <Link 
                  to="/login" 
                  className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group ml-2"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="relative">
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 transform group-hover:rotate-90 transition-transform duration-200" />
                ) : (
                  <Menu className="h-6 w-6 transform group-hover:scale-110 transition-transform duration-200" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              {isLoggedIn ? (
                <>
                  {/* Mobile User Info */}
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl mb-4 border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        role === 'university' 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                      }`}>
                        {getUserInitials()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">
                          {getUserDisplayName()}
                        </span>
                        <span className="text-xs text-gray-500 capitalize flex items-center">
                          {role === 'university' ? (
                            <>
                              <Building2 className="h-3 w-3 mr-1" />
                              University
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3 mr-1" />
                              Student
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    to={getDashboardPath()} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/verify" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 rounded-xl transition-all duration-200 font-medium"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Certificate
                  </Link>
                  <button 
                    onClick={handleSignOut} 
                    className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-200 font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/verify" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 rounded-xl transition-all duration-200 font-medium"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Certificate
                  </Link>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-xl font-medium text-center shadow-lg"
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