import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, FileCheck, List, Building2, Award, BarChart3, Settings, Palette } from 'lucide-react';
import ManageStudents from './ManageStudents';
import GenerateCertificate from './GenerateCertificate';
import CertificateList from './CertificateList';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import UniversitySettings from '../../components/UniversitySettings';
import CertificateTemplates from '../../components/CertificateTemplates';

const UniversityDashboard = () => {
    const { university } = useAuth();
    const [activeTab, setActiveTab] = useState('students');

    if (!university) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-600 text-lg">Loading university data...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { 
            id: 'students', 
            label: 'Manage Students', 
            icon: Users,
            description: 'Add and manage your students',
            color: 'from-green-500 to-emerald-500'
        },
        { 
            id: 'generate', 
            label: 'Generate Certificate', 
            icon: FileCheck,
            description: 'Create blockchain certificates',
            color: 'from-blue-500 to-indigo-500'
        },
        { 
            id: 'certificates', 
            label: 'View Certificates', 
            icon: List,
            description: 'View issued certificates',
            color: 'from-purple-500 to-pink-500'
        },
        { 
            id: 'analytics', 
            label: 'Analytics', 
            icon: BarChart3,
            description: 'View performance metrics',
            color: 'from-orange-500 to-red-500'
        },
        { 
            id: 'templates', 
            label: 'Templates', 
            icon: Palette,
            description: 'Manage certificate designs',
            color: 'from-pink-500 to-rose-500'
        },
        { 
            id: 'settings', 
            label: 'Settings', 
            icon: Settings,
            description: 'University configuration',
            color: 'from-gray-500 to-slate-500'
        }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'students':
                return <ManageStudents />;
            case 'generate':
                return <GenerateCertificate />;
            case 'certificates':
                return <CertificateList />;
            case 'analytics':
                return <AnalyticsDashboard />;
            case 'templates':
                return <CertificateTemplates />;
            case 'settings':
                return <UniversitySettings />;
            default:
                return <ManageStudents />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <div className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                                <Building2 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                    {university.name}
                                </h1>
                                <p className="text-gray-600 text-lg">University Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-full shadow-lg">
                                <span className="text-white font-semibold flex items-center">
                                    <Award className="h-4 w-4 mr-2" />
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-8 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center py-6 px-4 border-b-3 font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                                        activeTab === tab.id 
                                            ? `bg-gradient-to-r ${tab.color}` 
                                            : 'bg-gray-100'
                                    }`}>
                                        <Icon className={`h-4 w-4 ${
                                            activeTab === tab.id ? 'text-white' : 'text-gray-500'
                                        }`} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">{tab.label}</div>
                                        <div className="text-xs text-gray-500">{tab.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {renderContent()}
            </div>
        </div>
    );
};

export default UniversityDashboard;