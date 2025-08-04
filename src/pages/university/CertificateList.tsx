import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Download, Search, Loader2, Shield, AlertTriangle, Award, Star, Calendar, User } from 'lucide-react';
import { generateCertificatePDF } from '../../lib/pdf';

const CertificateList = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  const fetchCertificates = async () => {
    if (!user) return;
    try {
      const { data, error: fetchError } = await supabase
        .from('certificates')
        .select('*')
        .eq('university_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCertificates(data || []);
    } catch (err) {
      setError('Failed to fetch certificates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificate: any) => {
    try {
      setDownloadingId(certificate.certificate_id);
      const pdf = await generateCertificatePDF(certificate);
      pdf.save(`${certificate.student_name.replace(/\s+/g, '_')}_${certificate.course.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificate_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cert.grade && cert.grade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4 shadow-lg">
          <Award className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Issued Certificates</h2>
        <p className="text-gray-600 text-lg">View and manage all certificates issued by your university</p>
        <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-full mt-4">
          <Award className="h-4 w-4 text-blue-600 mr-2" />
          <span className="text-blue-800 font-semibold">{certificates.length} Total Certificates</span>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-start">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 mb-1">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search certificates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
        />
      </div>

      {/* Certificates Grid */}
      <div className="grid gap-6">
        {filteredCertificates.length > 0 ? (
          filteredCertificates.map((certificate) => (
            <div key={certificate.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{certificate.course}</h3>
                      <p className="text-gray-600 font-medium">{certificate.student_name}</p>
                      <p className="text-sm text-gray-500">ID: {certificate.certificate_id}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {certificate.blockchain_verified ? (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-2">
                        <Shield className="h-3 w-3 mr-1" />
                        Blockchain Verified
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 mb-2">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Database Only
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-6">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Student ID</p>
                      <p className="font-semibold text-gray-900">{certificate.student_id}</p>
                    </div>
                  </div>
                  
                  {certificate.grade && (
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Grade</p>
                        <p className="font-semibold text-gray-900">{certificate.grade}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Issue Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(certificate.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => downloadCertificate(certificate)}
                      disabled={downloadingId === certificate.certificate_id}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                    >
                      {downloadingId === certificate.certificate_id ? (
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {downloadingId === certificate.certificate_id ? 'Downloading...' : 'Download'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No certificates found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms.' : 'Start by generating your first certificate.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateList;