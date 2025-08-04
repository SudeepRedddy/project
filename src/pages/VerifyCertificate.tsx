import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, CheckCircle, XCircle, Loader2, Shield, AlertTriangle, Award, Calendar, User, BookOpen, Building2, ExternalLink } from 'lucide-react';
import { 
  isValidCertificateId, 
  verifyCertificateOnBlockchain, 
  initWeb3, 
  isWeb3Initialized 
} from '../lib/blockchain';
import BlockchainStatus from '../components/BlockchainStatus';

const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const [error, setError] = useState('');
  const [blockchainVerified, setBlockchainVerified] = useState<boolean | null>(null);
  const [blockchainData, setBlockchainData] = useState<any>(null);

  useEffect(() => {
    if (!isWeb3Initialized()) {
      initWeb3().catch(err => {
        console.error('Failed to initialize Web3:', err);
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCertificate(null);
    setBlockchainVerified(null);
    setBlockchainData(null);

    try {
      const trimmedCertId = certificateId.trim();
      
      if (!isValidCertificateId(trimmedCertId) && !trimmedCertId.startsWith('CERT-')) {
        throw new Error('Invalid certificate ID format. Please check and try again.');
      }

      const { data, error: searchError } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_id', trimmedCertId);

      if (searchError) throw searchError;

      if (data && data.length > 0) {
        setCertificate(data[0]);
        
        try {
          if (!isWeb3Initialized()) {
            await initWeb3();
          }
          
          const blockchainCertificate = await verifyCertificateOnBlockchain(trimmedCertId);
          
          if (blockchainCertificate) {
            setBlockchainVerified(true);
            setBlockchainData(blockchainCertificate);
          } else {
            setBlockchainVerified(false);
          }
        } catch (blockchainError) {
          console.error('Blockchain verification error:', blockchainError);
          setBlockchainVerified(false);
        }
      } else {
        setError('Certificate not found. Please check the ID and try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 py-12 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 shadow-2xl">
              <Search className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Verify Certificate</h1>
            <p className="text-gray-300 text-xl">Enter a certificate ID to verify its authenticity on the blockchain</p>
          </div>

          <BlockchainStatus />

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="Enter Certificate ID (e.g., 12345678 or CERT-XXXX-XXXX)"
                  className="w-full pl-14 pr-4 py-5 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:ring-opacity-50 text-white placeholder-gray-400 transition-all duration-200 text-lg"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !certificateId.trim()}
                className="flex items-center px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 font-bold transition-all duration-200 transform hover:scale-105 shadow-2xl text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-6 w-6 mr-3" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="h-6 w-6 mr-3" />
                    Verify
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error State */}
          {error && (
            <div className="p-8 bg-red-500/20 rounded-2xl border border-red-500/30 mb-8 backdrop-blur-sm">
              <div className="flex items-center text-red-300 mb-4">
                <XCircle className="h-10 w-10 mr-4" />
                <h2 className="text-3xl font-bold">Certificate Not Found</h2>
              </div>
              <p className="text-red-200 ml-14 text-xl">{error}</p>
            </div>
          )}

          {/* Success State */}
          {certificate && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-8 rounded-2xl border border-green-500/30 backdrop-blur-sm">
              <div className="flex items-center mb-8">
                <CheckCircle className="h-12 w-12 text-green-400 mr-4" />
                <div>
                  <h2 className="text-4xl font-bold text-green-300">Certificate Verified!</h2>
                  <p className="text-green-200 text-xl">This certificate is authentic and valid</p>
                </div>
              </div>
              
              {/* Blockchain verification badge */}
              {blockchainVerified === true && (
                <div className="mb-8 bg-blue-500/20 p-6 rounded-xl border border-blue-500/30 flex items-start backdrop-blur-sm">
                  <Shield className="h-10 w-10 text-blue-400 mr-4 mt-1" />
                  <div>
                    <h3 className="font-bold text-blue-300 text-xl mb-2">Ethereum Blockchain Verified</h3>
                    <p className="text-blue-200 mb-2 text-lg">This certificate has been verified on the Ethereum blockchain</p>
                    {blockchainData && blockchainData.issuer && (
                      <p className="text-sm text-blue-300">
                        Issued by: {blockchainData.issuer.substring(0, 6)}...{blockchainData.issuer.substring(blockchainData.issuer.length - 4)}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {blockchainVerified === false && (
                <div className="mb-8 bg-yellow-500/20 p-6 rounded-xl border border-yellow-500/30 flex items-start backdrop-blur-sm">
                  <AlertTriangle className="h-10 w-10 text-yellow-400 mr-4 mt-1" />
                  <div>
                    <h3 className="font-bold text-yellow-300 text-xl mb-2">Database Verified Only</h3>
                    <p className="text-yellow-200 text-lg">This certificate is verified in our database but not on the blockchain</p>
                  </div>
                </div>
              )}
              
              {/* Certificate Details */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Award className="h-8 w-8 text-gray-400 mr-4 mt-1" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Certificate ID</h3>
                      <p className="text-2xl font-bold text-white">{certificate.certificate_id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <User className="h-8 w-8 text-gray-400 mr-4 mt-1" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Student Name</h3>
                      <p className="text-2xl font-bold text-white">{certificate.student_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <BookOpen className="h-8 w-8 text-gray-400 mr-4 mt-1" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Course</h3>
                      <p className="text-2xl font-bold text-white">{certificate.course}</p>
                    </div>
                  </div>

                  {certificate.grade && (
                    <div className="flex items-start">
                      <Award className="h-8 w-8 text-gray-400 mr-4 mt-1" />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Grade</h3>
                        <p className="text-2xl font-bold text-white">{certificate.grade}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <User className="h-8 w-8 text-gray-400 mr-4 mt-1" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Student ID</h3>
                      <p className="text-2xl font-bold text-white">{certificate.student_id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Building2 className="h-8 w-8 text-gray-400 mr-4 mt-1" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">University</h3>
                      <p className="text-2xl font-bold text-white">{certificate.university}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-8 w-8 text-gray-400 mr-4 mt-1" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Issue Date</h3>
                      <p className="text-2xl font-bold text-white">
                        {new Date(certificate.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Blockchain Transaction */}
              {certificate.blockchain_tx_hash && (
                <div className="mt-8 pt-8 border-t border-green-500/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Shield className="h-6 w-6 mr-2" />
                    Blockchain Transaction
                  </h3>
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${certificate.blockchain_tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors bg-blue-500/20 px-4 py-2 rounded-lg"
                  >
                    <span className="break-all mr-2">{certificate.blockchain_tx_hash}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;