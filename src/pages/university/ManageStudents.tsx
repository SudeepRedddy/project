import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Loader2, Search, Mail, User, Car as IdCard, Trash2, Users, Plus, X, Upload } from 'lucide-react';
import BulkStudentUpload from '../../components/BulkStudentUpload';

const ManageStudents = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Form state for adding a new student
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentEmail, setNewStudentEmail] = useState('');
    const [newStudentRoll, setNewStudentRoll] = useState('');
    const [addingStudent, setAddingStudent] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    const fetchStudents = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('university_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setStudents(data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newStudentName || !newStudentEmail || !newStudentRoll) return;

        setAddingStudent(true);
        try {
            // The only change is adding .toLowerCase() to the email
            const { error } = await supabase.from('students').insert({
                university_id: user.id,
                student_name: newStudentName.trim(),
                student_email: newStudentEmail.trim().toLowerCase(), // <-- ADD THIS
                student_roll_number: newStudentRoll.trim()
            });
            
            if (error) throw error;
            
            setNewStudentName('');
            setNewStudentEmail('');
            setNewStudentRoll('');
            setShowAddForm(false);
            fetchStudents();
        } catch (error: any) {
            console.error('Error adding student:', error);
            alert(error.message || 'Failed to add student. They may already exist.');
        } finally {
            setAddingStudent(false);
        }
    };

    const deleteStudent = async (studentId: string) => {
        if (!confirm('Are you sure you want to delete this student?')) return;
        
        try {
            const { error } = await supabase
                .from('students')
                .delete()
                .eq('id', studentId);
            
            if (error) throw error;
            fetchStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Failed to delete student.');
        }
    };

    const filteredStudents = students.filter(student =>
        student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_roll_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-16">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading students...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-4 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Manage Students</h2>
                <p className="text-gray-600 text-lg">Add and manage students in your university</p>
                <div className="inline-flex items-center bg-green-50 px-4 py-2 rounded-full mt-4">
                    <Users className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-green-800 font-semibold">{students.length} Total Students</span>
                </div>
            </div>

            {/* Add Student Button */}
            <div className="flex justify-center">
                <div className="flex space-x-4">
                    <button
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            setShowBulkUpload(false);
                        }}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                    >
                        {showAddForm ? (
                            <>
                                <X className="h-5 w-5 mr-2" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-5 w-5 mr-2" />
                                Add Student
                            </>
                        )}
                    </button>
                    
                    <button
                        onClick={() => {
                            setShowBulkUpload(!showBulkUpload);
                            setShowAddForm(false);
                        }}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                    >
                        {showBulkUpload ? (
                            <>
                                <X className="h-5 w-5 mr-2" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Upload className="h-5 w-5 mr-2" />
                                Bulk Upload
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Bulk Upload Component */}
            {showBulkUpload && (
                <BulkStudentUpload onUploadComplete={fetchStudents} />
            )}

            {/* Add Student Form */}
            {showAddForm && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-3">
                            <Plus className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Add New Student</h3>
                        <p className="text-gray-600">Enter student details to add them to your university</p>
                    </div>
                    
                    <form onSubmit={handleAddStudent} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Student Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={newStudentName}
                                        onChange={(e) => setNewStudentName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                                        placeholder="Enter student name"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={newStudentEmail}
                                        onChange={(e) => setNewStudentEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                                        placeholder="Enter email address"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Roll Number
                            </label>
                            <div className="relative">
                                <IdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={newStudentRoll}
                                    onChange={(e) => setNewStudentRoll(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                                    placeholder="Enter roll number"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={addingStudent}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold flex items-center"
                            >
                                {addingStudent ? (
                                    <>
                                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Student
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                />
            </div>

            {/* Students Grid */}
            <div className="grid gap-6">
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                        <div key={student.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                        <User className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{student.student_name}</h3>
                                        <p className="text-gray-600">{student.student_email}</p>
                                        <p className="text-sm text-gray-500">Roll: {student.student_roll_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Added on</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(student.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteStudent(student.id)}
                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No students found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first student.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageStudents;