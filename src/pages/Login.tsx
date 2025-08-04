import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, LogIn, User, Building2, Mail, Lock, Car as IdCard, Eye, EyeOff, Shield, Award, AlertCircle } from 'lucide-react';

const Login = () => {
  const [isUniversityLogin, setIsUniversityLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginAsUniversity, loginAsStudent, role, user, student } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (role === 'university' && user) {
      navigate('/university/dashboard');
    } else if (role === 'student' && student) {
      navigate('/student/dashboard');
    }
  }, [role, user, student, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (isUniversityLogin && !password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    if (!isUniversityLogin && !rollNumber.trim()) {
      setError('Please enter your roll number');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Login attempt:', { isUniversityLogin, email: email.trim() });
      
      if (isUniversityLogin) {
        console.log('Attempting university login...');
        await loginAsUniversity({ email: email.trim(), password });
        console.log('University login successful, navigating...');
        navigate('/university/dashboard');
      } else {
        console.log('Attempting student login...');
        await loginAsStudent({ email: email.trim(), rollNumber: rollNumber.trim() });
        console.log('Student login successful, navigating...');
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchLoginType = (isUniversity: boolean) => {
    setIsUniversityLogin(isUniversity);
    setError('');
    setEmail('');
    setPassword('');
    setRollNumber('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 shadow-2xl">
            <Award className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Certify</span>
          </h1>
          <p className="text-gray-300 text-lg">Sign in to your secure blockchain platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Login Type Switcher */}
          <div className="flex bg-white/10 rounded-2xl p-1 mb-8 backdrop-blur-sm">
            <button 
              onClick={() => switchLoginType(true)}
              className={`flex-1 flex items-center justify-center py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                isUniversityLogin 
                  ? 'bg-white text-gray-900 shadow-lg transform scale-105' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Building2 className="h-5 w-5 mr-2" />
              University
            </button>
            <button 
              onClick={() => switchLoginType(false)}
              className={`flex-1 flex items-center justify-center py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                !isUniversityLogin 
                  ? 'bg-white text-gray-900 shadow-lg transform scale-105' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="h-5 w-5 mr-2" />
              Student
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-200 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 backdrop-blur-sm"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Password or Roll Number Field */}
            {isUniversityLogin ? (
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white mb-3">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 backdrop-blur-sm"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="rollNumber" className="block text-sm font-semibold text-white mb-3">
                  Roll Number / Student ID
                </label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="rollNumber"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 backdrop-blur-sm"
                    placeholder="Enter your roll number"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-2xl flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Register Link for Universities */}
          {isUniversityLogin && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-300">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  Register your university
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 bg-white/10 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm">
            {isUniversityLogin 
              ? "Universities can manage students and issue blockchain certificates" 
              : "Students can view and download their verified certificates"
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;