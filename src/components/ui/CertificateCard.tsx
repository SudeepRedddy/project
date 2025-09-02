import React from 'react';
import { 
  Award, 
  Shield, 
  AlertTriangle, 
  Download, 
  Mail, 
  Share2, 
  ExternalLink, 
  FileX, 
  User, 
  Star, 
  Calendar,
  Loader2
} from 'lucide-react';

interface CertificateCardProps {
  certificate: any;
  onDownload: (cert: any) => void;
  onEmail: (cert: any) => void;
  onShare: (cert: any) => void;
  onRevoke: (certId: string) => void;
  generateShareLink: (cert: any) => string;
  downloadingId: string | null;
  emailingId: string | null;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onDownload,
  onEmail,
  onShare,
  onRevoke,
  generateShareLink,
  downloadingId,
  emailingId
}) => {
  return (
    <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden transform hover:-translate-y-2">
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
              <h3 className="text-2xl font-bold text-white mb-1">{certificate.course}</h3>
              <p className="text-white/80 text-lg font-medium">Certificate of Achievement</p>
            </div>
          </div>
          
          {/* Verification Badge */}
          <div className="text-right">
            {certificate.blockchain_verified ? (
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
              <p className="text-lg font-bold text-gray-900">{certificate.student_id}</p>
            </div>
          </div>
          
          {certificate.grade && (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Grade Achieved</p>
                <p className="text-lg font-bold text-gray-900">{certificate.grade}</p>
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
                {new Date(certificate.created_at).toLocaleDateString('en-US', {
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
            <div className="text-2xl font-bold text-green-600">{certificate.download_count || 0}</div>
            <div className="text-sm text-green-700 font-medium">Downloads</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{certificate.verification_count || 0}</div>
            <div className="text-sm text-blue-700 font-medium">Verifications</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">{certificate.public_share_id ? 'Yes' : 'No'}</div>
            <div className="text-sm text-purple-700 font-medium">Public Link</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 text-center border border-orange-100">
            <div className="text-2xl font-bold text-orange-600">{certificate.revoked ? 'Revoked' : 'Active'}</div>
            <div className="text-sm text-orange-700 font-medium">Status</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {/* Download Button */}
          <button 
            onClick={() => onDownload(certificate)} 
            disabled={downloadingId === certificate.certificate_id}
            className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
          >
            {downloadingId === certificate.certificate_id ? (
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
            onClick={() => onEmail(certificate)}
            disabled={emailingId === certificate.certificate_id}
            className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
          >
            {emailingId === certificate.certificate_id ? (
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
            onClick={() => onShare(certificate)}
            className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
          >
            <Share2 className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
            Share Link
          </button>
          
          {/* View Public Button */}
          {certificate.public_share_id && (
            <a
              href={generateShareLink(certificate)}
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
            onClick={() => onRevoke(certificate.certificate_id)}
            className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
          >
            <FileX className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
            Request Revocation
          </button>
        </div>

        {/* Certificate ID */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Certificate ID:</span>
              <code className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg text-gray-800">
                {certificate.certificate_id}
              </code>
            </div>
            <div className="text-sm text-gray-500">
              Issued {new Date(certificate.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};