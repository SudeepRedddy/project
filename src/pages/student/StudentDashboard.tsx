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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-gray-100 rounded-lg">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome, {student?.student_name}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    <span>{student?.university?.name || 'Your University'}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    <span>Roll: {student?.student_roll_number}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full md:w-auto">
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <Award className="h-6 w-6 text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</div>
                <div className="text-sm text-gray-600">Certificates</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <Download className="h-6 w-6 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</div>
                <div className="text-sm text-gray-600">Downloads</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <Eye className="h-6 w-6 text-purple-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalVerifications}</div>
                <div className="text-sm text-gray-600">Verifications</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <Clock className="h-6 w-6 text-gray-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.recentActivity}</div>
                <div className="text-sm text-gray-600">Recent Views</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Digital Certificates</h2>

        {/* Certificates List */}
        <div className="space-y-6">
          {certificates.length > 0 ? (
            certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{cert.course}</h3>
                      <p className="text-gray-600">Certificate of Achievement</p>
                    </div>
                    {cert.blockchain_verified ? (
                      <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                        <Shield className="h-4 w-4 mr-2" />
                        Verified
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Database Only
                      </div>
                    )}
                  </div>

                  {/* Certificate Details */}
                  <div className="grid md:grid-cols-3 gap-6 mb-8 text-gray-600">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-semibold">Student ID</p>
                        <p>{cert.student_id}</p>
                      </div>
                    </div>

                    {cert.grade && (
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-semibold">Grade Achieved</p>
                          <p>{cert.grade}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-semibold">Issue Date</p>
                        <p>
                          {new Date(cert.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 justify-start">
                    {/* Download Button */}
                    <button
                      onClick={() => downloadCertificate(cert)}
                      disabled={downloadingId === cert.certificate_id}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-semibold"
                    >
                      {downloadingId === cert.certificate_id ? (
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      ) : (
                        <Download className="h-5 w-5 mr-2" />
                      )}
                      Download PDF
                    </button>

                    {/* Secondary Actions */}
                    <button
                      onClick={() => emailCertificate(cert)}
                      disabled={emailingId === cert.certificate_id}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors font-semibold"
                    >
                      {emailingId === cert.certificate_id ? (
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      ) : (
                        <Mail className="h-5 w-5 mr-2" />
                      )}
                      Email
                    </button>
                    <button
                      onClick={() => handleShare(cert)}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors font-semibold"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Share
                    </button>
                    {cert.public_share_id && (
                      <a
                        href={generateShareLink(cert)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors font-semibold"
                      >
                        <ExternalLink className="h-5 w-5 mr-2" />
                        View Public
                      </a>
                    )}
                    <button
                      onClick={() => setShowRevocationForm(cert.certificate_id)}
                      className="inline-flex items-center px-6 py-3 border border-red-400 text-red-600 rounded-md hover:bg-red-50 transition-colors font-semibold"
                    >
                      <FileX className="h-5 w-5 mr-2" />
                      Revoke
                    </button>
                  </div>

                  {/* Revocation Form */}
                  {showRevocationForm === cert.certificate_id && (
                    <div className="mt-8 p-6 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                        <h4 className="font-bold text-red-900 text-lg">Request Revocation</h4>
                      </div>
                      <p className="text-red-700 mb-4">
                        Please provide a detailed reason for your request.
                      </p>
                      <textarea
                        value={revocationReason}
                        onChange={(e) => setRevocationReason(e.target.value)}
                        className="w-full px-4 py-2 border border-red-300 rounded-md focus:ring-1 focus:ring-red-500 mb-4"
                        rows={3}
                        placeholder="Enter detailed reason..."
                        required
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleRevocationRequest(cert.certificate_id)}
                          disabled={submittingRevocation || !revocationReason.trim()}
                          className="flex items-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 transition-colors font-semibold"
                        >
                          {submittingRevocation ? (
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          ) : (
                            'Submit Request'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowRevocationForm(null);
                            setRevocationReason('');
                          }}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="text-center py-20 bg-white rounded-lg border border-gray-100">
              <div className="p-6 bg-gray-100 inline-block rounded-lg mb-4">
                <Award className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Certificates Yet</h3>
              <p className="text-gray-600 max-w-lg mx-auto">
                You haven't been issued any certificates. Check back later or contact your university.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;