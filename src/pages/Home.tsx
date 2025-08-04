import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, LogIn, Award, CheckCircle, Globe, Lock, Users, Zap, Star } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-8 shadow-2xl">
            <Award className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-6xl sm:text-7xl font-bold text-white mb-8 leading-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Certify</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
            The future of academic credentials is here. Secure, verify, and manage certificates 
            on the blockchain with unparalleled security and global accessibility.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/verify"
              className="group inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-600 font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <Search className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
              Verify Certificate
            </Link>
            <Link
              to="/login"
              className="group inline-flex items-center bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl hover:bg-white/20 font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl border border-white/20"
            >
              <LogIn className="h-6 w-6 mr-3 group-hover:translate-x-1 transition-transform" />
              Access Portal
            </Link>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          <div className="group bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 border border-white/20">
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Search className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">Verify Certificates</h2>
              <p className="text-gray-300 mb-8 leading-relaxed flex-grow text-lg">
                Instantly verify the authenticity of any certificate with our blockchain-powered verification system.
              </p>
              <Link
                to="/verify"
                className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-600 font-semibold transition-all duration-200 transform hover:scale-105 shadow-xl"
              >
                <Search className="h-5 w-5 mr-2" />
                Start Verification
              </Link>
            </div>
          </div>

          <div className="group bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 border border-white/20">
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <LogIn className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">Access Dashboard</h2>
              <p className="text-gray-300 mb-8 leading-relaxed flex-grow text-lg">
                Universities and students can access their secure portals to manage blockchain certificates.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-200 transform hover:scale-105 shadow-xl"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Why Blockchain Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-12 mb-20 border border-white/20">
          <h2 className="text-4xl font-bold mb-12 text-center text-white">Why Blockchain Technology?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Lock className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Tamper-Proof Security</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Immutable blockchain records ensure certificates cannot be forged or altered, providing ultimate security.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Globe className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Global Verification</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Verify credentials instantly from anywhere in the world without contacting institutions.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Users className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Student Ownership</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Students own their credentials and can share them securely with employers worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <CheckCircle className="h-10 w-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-2 text-lg">Instant Verification</h3>
            <p className="text-sm text-gray-300">Verify certificates in seconds with blockchain technology</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <Shield className="h-10 w-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-2 text-lg">Secure Storage</h3>
            <p className="text-sm text-gray-300">Certificates stored securely on Ethereum blockchain</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <Award className="h-10 w-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-2 text-lg">Digital Certificates</h3>
            <p className="text-sm text-gray-300">Beautiful, professional PDF certificates with QR codes</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <Zap className="h-10 w-10 text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-2 text-lg">Lightning Fast</h3>
            <p className="text-sm text-gray-300">Generate and verify certificates in real-time</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;