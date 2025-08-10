import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, Eye, Award, Calendar, Users, BookOpen } from 'lucide-react';
import { getCertificateStats, type CertificateStats } from '../lib/analytics';
import { useAuth } from '../contexts/AuthContext';

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, timeRange]);

  const fetchStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getCertificateStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <BarChart3 className="animate-pulse h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Start issuing certificates to see analytics</p>
      </div>
    );
  }

  const maxActivity = Math.max(...stats.recent_activity.map(a => Math.max(a.downloads, a.verifications)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4 shadow-lg">
          <BarChart3 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600 text-lg">Track your certificate performance and engagement</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-xl p-1 flex">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                timeRange === option.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Award className="h-6 w-6 text-white" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total_certificates}</div>
          <div className="text-sm text-gray-600">Total Certificates</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Download className="h-6 w-6 text-white" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total_downloads}</div>
          <div className="text-sm text-gray-600">Total Downloads</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total_verifications}</div>
          <div className="text-sm text-gray-600">Verifications</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.certificates_by_course.length}</div>
          <div className="text-sm text-gray-600">Active Courses</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Certificates by Course */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
            Certificates by Course
          </h3>
          <div className="space-y-4">
            {stats.certificates_by_course.slice(0, 5).map((course, index) => {
              const maxCount = Math.max(...stats.certificates_by_course.map(c => c.count));
              const percentage = (course.count / maxCount) * 100;
              
              return (
                <div key={index} className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-700 truncate mr-4">
                    {course.course}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 w-8">
                    {course.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-purple-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats.recent_activity.slice(-7).map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="text-sm text-gray-600">
                  {new Date(activity.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div
                      className="bg-green-500 rounded-full mr-2"
                      style={{
                        width: `${Math.max(4, (activity.downloads / maxActivity) * 20)}px`,
                        height: '8px'
                      }}
                    />
                    <span className="text-xs text-gray-500">{activity.downloads} downloads</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className="bg-purple-500 rounded-full mr-2"
                      style={{
                        width: `${Math.max(4, (activity.verifications / maxActivity) * 20)}px`,
                        height: '8px'
                      }}
                    />
                    <span className="text-xs text-gray-500">{activity.verifications} verifications</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
          Engagement Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {stats.total_certificates > 0 ? (stats.total_downloads / stats.total_certificates).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-600">Avg Downloads per Certificate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {stats.total_certificates > 0 ? (stats.total_verifications / stats.total_certificates).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-600">Avg Verifications per Certificate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {stats.total_downloads > 0 ? ((stats.total_verifications / stats.total_downloads) * 100).toFixed(1) : '0'}%
            </div>
            <div className="text-sm text-gray-600">Verification Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;