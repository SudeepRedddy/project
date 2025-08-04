import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FileCheck, Eye, Loader2, AlertCircle, CheckCircle, Shield, User, BookOpen, Award, Star } from 'lucide-react';
import {
  generateCertificateId,
  issueCertificateOnBlockchain,
  initWeb3,
  isWeb3Initialized,
  isMetaMaskInstalled
} from '../../lib/blockchain';
import { generateCertificatePDF } from '../../lib/pdf';
import BlockchainStatus from '../../components/BlockchainStatus';

const GenerateCertificate = () => {
  const { user, university } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [course, setCourse] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [blockchainStatus, setBlockchainStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [blockchainTxHash, setBlockchainTxHash] = useState<string | null>(null);
  const [hasMetaMask, setHasMetaMask] = useState(false);

  useEffect(() => {
    fetchStudents();
    setHasMetaMask(isMetaMaskInstalled());
    
    if (!isWeb3Initialized()) {
      initWeb3().catch(err => {
        console.error('Failed to initialize Web3:', err);
      });
    }
  }, [user]);

  const fetchStudents = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('university_id', user.id)
        .order('student_name');
      
      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const checkDuplicateCertificate = async (studentId: string, course: string) => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('id')
        .eq('student_id', studentId)
        .eq('course', course);

      if (error) throw error;
      return data && data.length > 0;
    } catch (err) {
      console.error('Error checking duplicate:', err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !course || !grade || !university) return;

    setLoading(true);
    setError('');
    setSuccess(false);
    setPreviewUrl(null);
    setBlockchainStatus(null);
    setBlockchainTxHash(null);

    try {
      if (!isWeb3Initialized()) {
        const initialized = await initWeb3();
        if (!initialized) {
          console.warn('Using fallback provider in read-only mode');
        }
      }

      const isDuplicate = await checkDuplicateCertificate(selectedStudent.student_roll_number, course);
      if (isDuplicate) {
        throw new Error('A certificate for this student and course already exists.');
      }

      const newCertificateId = generateCertificateId(
        selectedStudent.student_roll_number,
        selectedStudent.student_name,
        course,
        university.name
      );

      setCertificateId(newCertificateId);

      // Generate PDF preview
      const pdf = await generateCertificatePDF({
        student_id: selectedStudent.student_roll_number,
        student_name: selectedStudent.student_name,
        course: course,
        university: university.name,
        certificate_id: newCertificateId,
        created_at: new Date().toISOString(),
        grade: grade
      });
      const pdfBlob = pdf.output('blob');
      const previewUrl = URL.createObjectURL(pdfBlob);
      setPreviewUrl(previewUrl);

      // Issue certificate on blockchain if MetaMask is connected
      if (hasMetaMask) {
        setBlockchainStatus('pending');
        try {
          const receipt = await issueCertificateOnBlockchain(
            newCertificateId,
            selectedStudent.student_roll_number,
            selectedStudent.student_name,
            course,
            university.name
          );

          setBlockchainStatus('success');
          setBlockchainTxHash(receipt.transactionHash);

          const { error: dbError } = await supabase.from('certificates').insert({
            certificate_id: newCertificateId,
            student_id: selectedStudent.student_roll_number,
            student_name: selectedStudent.student_name,
            course: course,
            university: university.name,
            grade: grade,
            blockchain_tx_hash: receipt.transactionHash,
            blockchain_verified: true,
            university_id: user.id,
            student_id_ref: selectedStudent.id
          });

          if (dbError) throw new Error('Failed to save certificate to database: ' + dbError.message);
          setSuccess(true);
        } catch (blockchainError: any) {
          console.error('Blockchain error:', blockchainError);
          setBlockchainStatus('error');

          const { error: dbError } = await supabase.from('certificates').insert({
            certificate_id: newCertificateId,
            student_id: selectedStudent.student_roll_number,
            student_name: selectedStudent.student_name,
            course: course,
            university: university.name,
            grade: grade,
            blockchain_verified: false,
            university_id: user.id,
            student_id_ref: selectedStudent.id
          });

          if (dbError) throw new Error('Failed to save certificate to database: ' + dbError.message);
          setSuccess(true);
        }
      } else {
        const { error: dbError } = await supabase.from('certificates').insert({
          certificate_id: newCertificateId,
          student_id: selectedStudent.student_roll_number,
          student_name: selectedStudent.student_name,
          course: course,
          university: university.name,
          grade: grade,
          blockchain_verified: false,
          university_id: user.id,
          student_id_ref: selectedStudent.id
        });

        if (dbError) throw new Error('Failed to save certificate to database: ' + dbError.message);
        setSuccess(true);
        setBlockchainStatus('error');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate certificate. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPreviewUrl(null);
    setSuccess(false);
    setBlockchainStatus(null);
    setBlockchainTxHash(null);
    setSelectedStudent(null);
    setCourse('');
    setGrade('');
    setError('');
  };

  if (!previewUrl) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <FileCheck className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Generate Certificate</h2>
          <p className="text-gray-600 text-lg">Create blockchain-verified certificates for your students</p>
        </div>

        <BlockchainStatus />

        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-start">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Student
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedStudent?.id || ''}
                    onChange={(e) => setSelectedStudent(students.find(s => s.id === e.target.value) || null)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                    required
                  >
                    <option value="">Choose a student...</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.student_name} ({student.student_roll_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Course Name
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                    placeholder="Enter course name"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Grade
              </label>
              <div className="relative">
                <Star className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                  required
                >
                  <option value="">Select grade...</option>
                  <option value="A+">A+ (Outstanding)</option>
                  <option value="A">A (Excellent)</option>
                  <option value="B+">B+ (Very Good)</option>
                  <option value="B">B (Good)</option>
                  <option value="C+">C+ (Above Average)</option>
                  <option value="C">C (Average)</option>
                  <option value="Pass">Pass</option>
                  <option value="Distinction">Distinction</option>
                  <option value="First Class">First Class</option>
                  <option value="Second Class">Second Class</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedStudent || !course || !grade}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-6 w-6 mr-3" />
                  Generating Certificate...
                </>
              ) : (
                <>
                  <Eye className="h-6 w-6 mr-3" />
                  Generate Certificate
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 shadow-lg">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Certificate Generated</h2>
        <p className="text-gray-600 text-lg">Review and confirm your certificate</p>
      </div>

      {success && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-xl flex items-start">
          <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800 mb-1">Success!</h3>
            <p className="text-green-700">Certificate generated successfully!</p>
          </div>
        </div>
      )}

      {blockchainStatus === 'pending' && (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start">
          <Loader2 className="animate-spin h-6 w-6 text-yellow-500 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Blockchain Processing</h3>
            <p className="text-yellow-700">Registering certificate on Ethereum blockchain...</p>
          </div>
        </div>
      )}

      {blockchainStatus === 'success' && blockchainTxHash && (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start mb-3">
            <Shield className="h-6 w-6 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Blockchain Verified!</h3>
              <p className="text-blue-700 mb-3">Certificate registered on Ethereum blockchain</p>
            </div>
          </div>
          <div className="text-sm text-blue-600">
            <p className="font-medium mb-1">Transaction Hash:</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${blockchainTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 break-all underline"
            >
              {blockchainTxHash}
            </a>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="aspect-[1.414] w-full">
          <iframe
            src={previewUrl}
            className="w-full h-full"
            title="Certificate Preview"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={resetForm}
          className="px-8 py-3 text-blue-600 hover:text-blue-800 font-semibold transition-colors bg-blue-50 hover:bg-blue-100 rounded-xl"
        >
          Generate Another Certificate
        </button>
      </div>
    </div>
  );
};

export default GenerateCertificate;