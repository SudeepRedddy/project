import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Award, Calendar, User, BookOpen, Building2, Shield, Download, Share2, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { trackAnalyticsEvent } from '../lib/analytics';
import { generateCertificatePDF } from '../lib/pdf';

const PublicCertificate: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (shareId) {
      fetchCertificate();
    }
  }, [shareId]);

  const fetchCertificate = async () => {
    if (!shareId) return;

    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('certificates')
        .select('*')
        .eq('public_share_id', shareId)
        .eq('revoked', false)
        .single();

      if (fetchError || !data) {
        setError('Certificate not found or has been revoked');
        return;
      }

      setCertificate(data);
      
      // Track view event
      await trackAnalyticsEvent({
        certificate_id: data.certificate_id,
        event_type: 'share'
      });
    } catch (err) {
      console.error('Error fetching certificate:', err);
      setError('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate) return;

    setDownloading(true);
    try {
      const pdf = await generateCertificatePDF(certificate);
      pdf.save(`${certificate.student_name.replace(/\s+/g, '_')}_Certificate.pdf`);
      
      // Track download event
      await trackAnalyticsEvent({
        certificate_id: certificate.certificate_id,
        event_type: 'download'
      });
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!certificate) return;

    const shareUrl = window.location.href;
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 shadow-2xl">
            <Award className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Verified Certificate</h1>
          <p className="text-gray-600 text-xl">This certificate has been verified and is authentic</p>
        </div>

        {/* Certificate Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
          {/* Verification Badge */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
            <div className="flex items-center justify-center text-white">
              <Shield className="h-6 w-6 mr-2" />
              <span className="font-semibold">Blockchain Verified Certificate</span>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{certificate.course}</h2>
              <p className="text-gray-600 text-lg">Certificate of Achievement</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <User className="h-6 w-6 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Student Name</h3>
                    <p className="text-xl font-bold text-gray-900">{certificate.student_name}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <BookOpen className="h-6 w-6 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Course</h3>
                    <p className="text-xl font-bold text-gray-900">{certificate.course}</p>
                  </div>
                </div>

                {certificate.grade && (
                  <div className="flex items-start">
                    <Award className="h-6 w-6 text-gray-400 mr-3 mt-1" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Grade</h3>
                      <p className="text-xl font-bold text-gray-900">{certificate.grade}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <Building2 className="h-6 w-6 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">University</h3>
                    <p className="text-xl font-bold text-gray-900">{certificate.university}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-6 w-6 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Issue Date</h3>
                    <p className="text-xl font-bold text-gray-900">
                      {new Date(certificate.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Shield className="h-6 w-6 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Certificate ID</h3>
                    <p className="text-xl font-bold text-gray-900 font-mono">{certificate.certificate_id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
              >
                {downloading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Download Certificate
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Share Certificate
              </button>
            </div>
          </div>
        </div>

        {/* Blockchain Verification */}
        {certificate.blockchain_tx_hash && (
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              Blockchain Verification
            </h3>
            <p className="text-blue-800 mb-4">
              This certificate has been permanently recorded on the Ethereum blockchain, ensuring its authenticity and preventing tampering.
            </p>
            <a
              href={`https://sepolia.etherscan.io/tx/${certificate.blockchain_tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              View on Blockchain Explorer
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">
            Powered by <span className="font-semibold text-blue-600">Certify</span> - Blockchain Certificate Management
          </p>
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Create your own certificates →
          </a>
        </div>
      </div>
    </div>
  );
};

export default PublicCertificate;