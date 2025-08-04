import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, Download, Shield, AlertTriangle, Award, User, Calendar, Star, BookOpen } from 'lucide-react';
import { generateCertificatePDF } from '../../lib/pdf';

const StudentDashboard = () => {
    const { student } = useAuth();
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
            const pdf = await generateCertificatePDF(certificate);
            pdf.save(`${certificate.student_name.replace(/\s+/g, '_')}_${certificate.course.replace(/\s+/g, '_')}_Certificate.pdf`);
        } catch (err) {
            console.error('Error downloading certificate:', err);
            alert('Failed to download certificate. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin h-16 w-16 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading your certificates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            {/* Header */}
            <div className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                                <User className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                    Welcome, {student?.student_name}
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    {student?.university?.name || 'Your University'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 rounded-full shadow-lg">
                                <span className="text-white font-semibold flex items-center">
                                    <Award className="h-4 w-4 mr-2" />
                                    {certificates.length} Certificates
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Certificates</h2>
                    <p className="text-gray-600 text-lg">
                        Here are all the certificates you have earned
                    </p>
                </div>

                <div className="space-y-6">
                    {certificates.length > 0 ? (
                        certificates.map(cert => (
                            <div key={cert.id} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                                <div className="p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                                                <Award className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{cert.course}</h3>
                                                <p className="text-gray-600 text-lg font-medium mb-1">Issued by {cert.university}</p>
                                                <p className="text-sm text-gray-500">Certificate ID: {cert.certificate_id}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            {cert.blockchain_verified ? (
                                                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 mb-3">
                                                    <Shield className="h-4 w-4 mr-2" />
                                                    Blockchain Verified
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 mb-3">
                                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                                    Database Only
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                                        {cert.grade && (
                                            <div className="flex items-center">
                                                <Star className="h-6 w-6 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Grade</p>
                                                    <p className="text-lg font-bold text-gray-900">{cert.grade}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center">
                                            <Calendar className="h-6 w-6 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Issue Date</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {new Date(cert.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-end">
                                            <button 
                                                onClick={() => downloadCertificate(cert)} 
                                                disabled={downloadingId === cert.certificate_id}
                                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                                            >
                                                {downloadingId === cert.certificate_id ? (
                                                    <>
                                                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                                        Downloading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="h-5 w-5 mr-2"/>
                                                        Download Certificate
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Award className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Certificates Yet</h3>
                            <p className="text-gray-600 text-lg max-w-md mx-auto">
                                You haven't been issued any certificates yet. Check back later or contact your university.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;