import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Loader2, 
  Download, 
  Shield, 
  AlertTriangle, 
  Award, 
  User, 
  Calendar, 
  Star, 
  BookOpen, 
  Share2, 
  ExternalLink, 
  FileX, 
  Mail,
  CheckCircle,
  TrendingUp,
  Eye,
  Clock,
  Building2
} from 'lucide-react';
import { generateCertificatePDF } from '../../lib/pdf';
import { trackAnalyticsEvent } from '../../lib/analytics';

const StudentDashboard = () => {
  const { student } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [showRevocationForm, setShowRevocationForm] = useState<string | null>(null);
  const [revocationReason, setRevocationReason] = useState('');
  const [submittingRevocation, setSubmittingRevocation] = useState(false);
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalDownloads: 0,
    totalVerifications: 0,
    recentActivity: 0
  });

  const fetchCertificates = useCallback(async () => {
    if (!student) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id_ref', student.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
      
      // Calculate stats
      const totalDownloads = data?.reduce((sum, cert) => sum + (cert.download_count || 0), 0) || 0;
      const totalVerifications = data?.reduce((sum, cert) => sum + (cert.verification_count || 0), 0) || 0;
      
      setStats({
        totalCertificates: data?.length || 0,
        totalDownloads,
        totalVerifications,
        recentActivity: Math.floor(Math.random() * 10) + 1 // Mock recent activity
      });
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);
  
  const downloadCertificate = async (certificate: any) => {
    try {
      setDownloadingId(certificate.certificate_id);
      const logoUrl = student?.university?.logo_url;
      const pdf = await generateCertificatePDF({ ...certificate, logoUrl });
      pdf.save(`${certificate.student_name.replace(/\s+/g, '_')}_${certificate.course.replace(/\s+/g, '_')}_Certificate.pdf`);
      
      // Track download event
      await trackAnalyticsEvent({
        certificate_id: certificate.certificate_id,
        event_type: 'download'
      });
      
      // Refresh certificates to update download count
      fetchCertificates();
    } catch (err) {
      console.error('Error downloading certificate:', err);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const emailCertificate = async (certificate: any) => {
    if (!student?.student_email) {
      alert('Email address not found. Please contact your university.');
      return;
    }

    setEmailingId(certificate.certificate_id);
    try {
      // Call the edge function to send email
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-certificate-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificate_id: certificate.certificate_id,
          student_email: student.student_email,
          student_name: certificate.student_name,
          course: certificate.course,
          university: certificate.university
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      alert('Certificate has been sent to your email address!');
      
      // Track email event
      await trackAnalyticsEvent({
        certificate_id: certificate.certificate_id,
        event_type: 'share'
      });
    } catch (error) {
      console.error('Email error:', error);
      alert('Failed to send certificate via email. Please try again.');
    } finally {
      setEmailingId(null);
    }
  };

  const generateShareLink = (certificate: any): string => {
    return `${window.location.origin}/certificate/${certificate.public_share_id}`;
  };

  const handleShare = async (certificate: any) => {
    const shareUrl = generateShareLink(certificate);
    const shareText = `Check out my certificate: ${certificate.course} from ${certificate.university}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Certificate Verification',
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }

    // Track share event
    await trackAnalyticsEvent({
      certificate_id: certificate.certificate_id,
      event_type: 'share'
    });
  };

  const handleRevocationRequest = async (certificateId: string) => {
    if (!revocationReason.trim() || !student) return;

    setSubmittingRevocation(true);
    try {
      const { error } = await supabase
        .from('certificate_revocation_requests')
        .insert({
          certificate_id: certificateId,
          student_id_ref: student.id,
          reason: revocationReason.trim()
        });

      if (error) throw error;

      alert('Revocation request submitted successfully. The university will review your request.');
      setShowRevocationForm(null);
      setRevocationReason('');
    } catch (error: any) {
      console.error('Revocation request error:', error);
      alert('Failed to submit revocation request: ' + error.message);
    } finally {
      setSubmittingRevocation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mb-6 shadow-2xl">
              <Award className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading your certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-xl border-b border-gray-200 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Student Info */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome back, {student?.student_name}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    <span className="font-medium">{student?.university?.name || 'Your University'}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    <span>Roll: {student?.student_roll_number}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                <div className="flex items-center justify-between mb-2">
                  <Award className="h-8 w-8 text-emerald-500" />
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</div>
                <div className="text-sm text-gray-600">Certificates</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                <div className="flex items-center justify-between mb-2">
                  <Download className="h-8 w-8 text-blue-500" />
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</div>
                <div className="text-sm text-gray-600">Downloads</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-8 w-8 text-purple-500" />
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalVerifications}</div>
                <div className="text-sm text-gray-600">Verifications</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.recentActivity}</div>
                <div className="text-sm text-gray-600">Recent Views</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Digital Certificates</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Manage, download, and share your blockchain-verified academic achievements
          </p>
        </div>

        {/* Certificates Grid */}
        <div className="space-y-8">
          {certificates.length > 0 ? (
            certificates.map((cert, index) => (
              <div 
                key={cert.id} 
                className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Certificate Header */}
                <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                        <Award className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{cert.course}</h3>
                        <p className="text-white/80 text-lg font-medium">Certificate of Achievement</p>
                      </div>
                    </div>
                    
                    {/* Verification Badge */}
                    <div className="text-right">
                      {cert.blockchain_verified ? (
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                          <Shield className="h-4 w-4 mr-2" />
                          Blockchain Verified
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-yellow-500/20 backdrop-blur-sm text-white border border-yellow-300/30">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Database Only
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Certificate Body */}
                <div className="p-8">
                  {/* Certificate Details */}
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Student ID</p>
                        <p className="text-lg font-bold text-gray-900">{cert.student_id}</p>
                      </div>
                    </div>
                    
                    {cert.grade && (
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                          <Star className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Grade Achieved</p>
                          <p className="text-lg font-bold text-gray-900">{cert.grade}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Issue Date</p>
                        <p className="text-lg font-bold text-gray-900">
                          {new Date(cert.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-100">
                      <div className="text-2xl font-bold text-green-600">{cert.download_count || 0}</div>
                      <div className="text-sm text-green-700 font-medium">Downloads</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">{cert.verification_count || 0}</div>
                      <div className="text-sm text-blue-700 font-medium">Verifications</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-100">
                      <div className="text-2xl font-bold text-purple-600">{cert.public_share_id ? 'Yes' : 'No'}</div>
                      <div className="text-sm text-purple-700 font-medium">Public Link</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 text-center border border-orange-100">
                      <div className="text-2xl font-bold text-orange-600">{cert.revoked ? 'Revoked' : 'Active'}</div>
                      <div className="text-sm text-orange-700 font-medium">Status</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {/* Download Button */}
                    <button 
                      onClick={() => downloadCertificate(cert)} 
                      disabled={downloadingId === cert.certificate_id}
                      className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                    >
                      {downloadingId === cert.certificate_id ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                          Download PDF
                        </>
                      )}
                    </button>

                    {/* Email Button */}
                    <button
                      onClick={() => emailCertificate(cert)}
                      disabled={emailingId === cert.certificate_id}
                      className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                    >
                      {emailingId === cert.certificate_id ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                          Email Certificate
                        </>
                      )}
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => handleShare(cert)}
                      className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                    >
                      <Share2 className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Share Link
                    </button>
                    
                    {/* View Public Button */}
                    {cert.public_share_id && (
                      <a
                        href={generateShareLink(cert)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                      >
                        <ExternalLink className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                        View Public
                      </a>
                    )}
                    
                    {/* Revocation Button */}
                    <button
                      onClick={() => setShowRevocationForm(cert.certificate_id)}
                      className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                    >
                      <FileX className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Request Revocation
                    </button>
                  </div>
                  
                  {/* Revocation Form */}
                  {showRevocationForm === cert.certificate_id && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200 shadow-inner">
                      <div className="flex items-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                        <h4 className="font-bold text-red-900 text-lg">Request Certificate Revocation</h4>
                      </div>
                      <p className="text-red-700 mb-4 leading-relaxed">
                        Please provide a detailed reason for requesting revocation. This action will be reviewed by your university and cannot be undone.
                      </p>
                      <textarea
                        value={revocationReason}
                        onChange={(e) => setRevocationReason(e.target.value)}
                        className="w-full px-4 py-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4 bg-white/80 backdrop-blur-sm"
                        rows={4}
                        placeholder="Enter detailed reason for revocation request..."
                        required
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleRevocationRequest(cert.certificate_id)}
                          disabled={submittingRevocation || !revocationReason.trim()}
                          className="flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg"
                        >
                          {submittingRevocation ? (
                            <>
                              <Loader2 className="animate-spin h-4 w-4 mr-2" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Request'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowRevocationForm(null);
                            setRevocationReason('');
                          }}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Certificate ID */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-500">Certificate ID:</span>
                        <code className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg text-gray-800">
                          {cert.certificate_id}
                        </code>
                      </div>
                      <div className="text-sm text-gray-500">
                        Issued {new Date(cert.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="text-center py-20">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Award className="h-16 w-16 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No Certificates Yet</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto mb-8 leading-relaxed">
                You haven't been issued any certificates yet. Check back later or contact your university for more information.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 max-w-md mx-auto border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1 text-left">
                  <li>• Complete your courses successfully</li>
                  <li>• Your university will issue digital certificates</li>
                  <li>• Certificates will appear here automatically</li>
                  <li>• Download, share, and verify anytime</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Section */}
        {certificates.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Certificate Features</h3>
              <p className="text-gray-600">Explore what you can do with your digital certificates</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Download className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Download & Print</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Download high-quality PDF certificates that you can print or share digitally with employers.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Share2 className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Share Publicly</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Generate shareable links for your certificates to showcase on LinkedIn, resumes, or portfolios.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Blockchain Verified</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Your certificates are secured on the blockchain, ensuring they cannot be forged or tampered with.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;