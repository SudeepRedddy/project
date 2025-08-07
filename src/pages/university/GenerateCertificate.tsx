import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FileCheck, Eye, Loader2, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import {
  generateCertificateId,
  issueCertificateOnBlockchain,
  initWeb3,
  isWeb3Initialized,
  isMetaMaskInstalled
} from '../../lib/blockchain';
import { generateCertificatePDF } from '../../lib/pdf';
import BlockchainStatus from '../../components/BlockchainStatus';
import { Combobox } from '../../components/ui/Combobox';

// Define grade options for the combobox
const gradeOptions = [
    { value: 'A+', label: 'A+ (Outstanding)' },
    { value: 'A', label: 'A (Excellent)' },
    { value: 'B+', label: 'B+ (Very Good)' },
    { value: 'B', label: 'B (Good)' },
    { value: 'C+', label: 'C+ (Above Average)' },
    { value: 'C', label: 'C (Average)' },
    { value: 'Pass', label: 'Pass' },
    { value: 'Distinction', label: 'Distinction' },
    { value: 'First Class', label: 'First Class' },
    { value: 'Second Class', label: 'Second Class' },
];

const GenerateCertificate = () => {
  const { user, university } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
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

  // Memoize student options for the Combobox to prevent unnecessary re-renders
  const studentOptions = useMemo(() => {
      return students.map(student => ({
          value: student.id,
          label: `${student.student_name} (${student.student_roll_number})`
      }));
  }, [students]);

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
        .eq('student_id_ref', studentId)
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
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  if (!selectedStudent || !course || !grade || !university) {
      setError('Please fill out all fields before generating.');
      return;
  }

  setLoading(true);
  setError('');
  setSuccess(false);
  setPreviewUrl(null);
  setBlockchainStatus(null);
  setBlockchainTxHash(null);

  try {
    if (!isWeb3Initialized()) {
      await initWeb3();
    }

    const isDuplicate = await checkDuplicateCertificate(selectedStudent.id, course);
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

    // Generate the PDF using the updated function, passing the logo URL
    const pdf = await generateCertificatePDF({
      certificate_id: newCertificateId,
      student_name: selectedStudent.student_name,
      course: course,
      university: university.name,
      created_at: new Date().toISOString(),
      grade: grade,
      logoUrl: university.logo_url // Pass the dynamic logo URL here
    });
    const pdfBlob = pdf.output('blob');
    const previewUrl = URL.createObjectURL(pdfBlob);
    setPreviewUrl(previewUrl);

    // Prepare certificate data for insertion
    const certificateData = {
      certificate_id: newCertificateId,
      student_id: selectedStudent.student_roll_number,
      student_name: selectedStudent.student_name,
      course: course,
      university: university.name,
      grade: grade,
      university_id: user?.id,
      student_id_ref: selectedStudent.id,
      blockchain_verified: false,
      blockchain_tx_hash: null,
    };

    if (hasMetaMask) {
      setBlockchainStatus('pending');
      try {
        // Import the new functions
        const { connectWallet, isOnSepoliaNetwork, switchToSepoliaNetwork } = await import('../../lib/blockchain');
        
        // Check if on correct network
        const isOnSepolia = await isOnSepoliaNetwork();
        if (!isOnSepolia) {
          // Try to switch networks
          try {
            await switchToSepoliaNetwork();
          } catch (networkError: any) {
            throw new Error('Please switch to Sepolia testnet in MetaMask to continue.');
          }
        }

        // Connect wallet if not already connected
        try {
          await connectWallet();
        } catch (walletError: any) {
          if (walletError.message.includes('rejected')) {
            throw new Error('Wallet connection was rejected. Please connect your MetaMask wallet.');
          }
          throw walletError;
        }

        const receipt = await issueCertificateOnBlockchain(
          newCertificateId,
          selectedStudent.student_roll_number,
          selectedStudent.student_name,
          course,
          university.name
        );
        setBlockchainStatus('success');
        setBlockchainTxHash(receipt.transactionHash);
        certificateData.blockchain_tx_hash = receipt.transactionHash;
        certificateData.blockchain_verified = true;
      } catch (blockchainError: any) {
        console.error('Blockchain error:', blockchainError);
        setBlockchainStatus('error');
        
        // Set more specific error messages
        if (blockchainError.message.includes('Sepolia')) {
          setError('Please switch to Sepolia testnet in MetaMask and try again.');
        } else if (blockchainError.message.includes('insufficient funds')) {
          setError('Insufficient Sepolia ETH for gas fees. Please get test ETH from a faucet.');
        } else if (blockchainError.message.includes('rejected')) {
          setError('Transaction was rejected. The certificate was saved to database but not verified on blockchain.');
        } else {
          setError(`Blockchain error: ${blockchainError.message}`);
        }
        
        // Continue with database save even if blockchain fails
      }
    } else {
      setBlockchainStatus('error');
      setError('MetaMask is not installed. Certificate will be saved to database only.');
    }

    const { error: dbError } = await supabase.from('certificates').insert(certificateData);
    if (dbError) throw new Error('Failed to save certificate to database: ' + dbError.message);
    
    setSuccess(true);
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
    setSelectedStudentId('');
    setCourse('');
    setGrade('');
    setError('');
  };

  // Render the form view
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
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Student
                </label>
                <Combobox
                    items={studentOptions}
                    value={selectedStudentId}
                    onChange={setSelectedStudentId}
                    placeholder="Search by name or roll number..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Grade
                </label>
               <Combobox
                    items={gradeOptions}
                    value={grade}
                    onChange={setGrade}
                    placeholder="Select a grade..."
                />
            </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Course Name
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full pl-4 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                placeholder="e.g., Bachelor of Computer Science"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedStudentId || !course || !grade}
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
                  Generate & Preview Certificate
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render the preview view after generation
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 shadow-lg">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Certificate Generated</h2>
        <p className="text-gray-600 text-lg">Review and confirm your new certificate</p>
      </div>

      {success && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-xl flex items-start">
          <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800 mb-1">Success!</h3>
            <p className="text-green-700">Certificate has been saved to the database.</p>
          </div>
        </div>
      )}

      {blockchainStatus === 'pending' && (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start">
          <Loader2 className="animate-spin h-6 w-6 text-yellow-500 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Blockchain Processing</h3>
            <p className="text-yellow-700">Please confirm the transaction in MetaMask...</p>
          </div>
        </div>
      )}

      {blockchainStatus === 'success' && blockchainTxHash && (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start mb-3">
            <Shield className="h-6 w-6 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Blockchain Verified!</h3>
              <p className="text-blue-700 mb-3">Certificate was successfully registered on the Ethereum blockchain.</p>
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