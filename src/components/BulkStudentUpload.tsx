import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Loader2, Users } from 'lucide-react';
import { parseStudentCSV, generateSampleCSV, type StudentCSVRow } from '../lib/csv';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BulkStudentUploadProps {
  onUploadComplete: () => void;
}

const BulkStudentUpload: React.FC<BulkStudentUploadProps> = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [parseResults, setParseResults] = useState<{ data: StudentCSVRow[]; errors: string[] } | null>(null);
  const [uploadResults, setUploadResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    try {
      const content = await file.text();
      const results = parseStudentCSV(content);
      setParseResults(results);
      setUploadResults(null);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!parseResults?.data.length || !user) return;

    setUploading(true);
    const results = { success: 0, failed: 0, errors: [] as string[] };

    try {
      // Create batch operation record
      const { data: batchOp, error: batchError } = await supabase
        .from('batch_operations')
        .insert({
          university_id: user.id,
          operation_type: 'student_upload',
          total_records: parseResults.data.length,
          status: 'processing'
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Process students in batches
      const batchSize = 10;
      for (let i = 0; i < parseResults.data.length; i += batchSize) {
        const batch = parseResults.data.slice(i, i + batchSize);
        
        for (const student of batch) {
          try {
            const { error } = await supabase
              .from('students')
              .insert({
                university_id: user.id,
                student_name: student.student_name,
                student_email: student.student_email,
                student_roll_number: student.student_roll_number
              });

            if (error) {
              results.failed++;
              results.errors.push(`${student.student_name}: ${error.message}`);
            } else {
              results.success++;
            }
          } catch (error: any) {
            results.failed++;
            results.errors.push(`${student.student_name}: ${error.message}`);
          }
        }

        // Update batch operation progress
        await supabase
          .from('batch_operations')
          .update({
            processed_records: results.success + results.failed,
            failed_records: results.failed
          })
          .eq('id', batchOp.id);
      }

      // Mark batch operation as completed
      await supabase
        .from('batch_operations')
        .update({
          status: results.failed === 0 ? 'completed' : 'completed',
          error_log: results.errors.length > 0 ? results.errors : null
        })
        .eq('id', batchOp.id);

      setUploadResults(results);
      
      if (results.success > 0) {
        onUploadComplete();
      }
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const csvContent = generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_upload_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setParseResults(null);
    setUploadResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
          <Upload className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Bulk Student Upload</h3>
        <p className="text-gray-600">Upload multiple students at once using a CSV file</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          CSV Format Requirements
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 mb-4">
          <li>• Required columns: student_name, student_email, student_roll_number</li>
          <li>• First row must contain column headers</li>
          <li>• Email addresses must be valid and unique</li>
          <li>• Roll numbers must be unique within your university</li>
        </ul>
        <button
          onClick={downloadSample}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Sample CSV
        </button>
      </div>

      {/* File Upload */}
      {!parseResults && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Choose a CSV file to upload</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold"
          >
            <Upload className="h-5 w-5 mr-2" />
            Select CSV File
          </button>
        </div>
      )}

      {/* Parse Results */}
      {parseResults && !uploadResults && (
        <div className="space-y-6">
          <div className="bg-green-50 rounded-xl p-6">
            <div className="flex items-center mb-3">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-900">File Parsed Successfully</h4>
            </div>
            <p className="text-green-800 mb-4">
              Found {parseResults.data.length} valid student records
            </p>
            
            {parseResults.errors.length > 0 && (
              <div className="bg-yellow-100 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-yellow-900 mb-2">Warnings:</h5>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {parseResults.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handleUpload}
                disabled={uploading || parseResults.data.length === 0}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 font-semibold"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5 mr-2" />
                    Upload {parseResults.data.length} Students
                  </>
                )}
              </button>
              <button
                onClick={resetUpload}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults && (
        <div className="space-y-6">
          <div className={`rounded-xl p-6 ${uploadResults.failed === 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex items-center mb-3">
              {uploadResults.failed === 0 ? (
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-6 w-6 text-yellow-600 mr-2" />
              )}
              <h4 className={`font-semibold ${uploadResults.failed === 0 ? 'text-green-900' : 'text-yellow-900'}`}>
                Upload Complete
              </h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{uploadResults.success}</div>
                <div className="text-sm text-gray-600">Successfully Added</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{uploadResults.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>

            {uploadResults.errors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-red-900 mb-2">Errors:</h5>
                <div className="max-h-32 overflow-y-auto">
                  <ul className="text-sm text-red-800 space-y-1">
                    {uploadResults.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <button
              onClick={resetUpload}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Upload Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkStudentUpload;