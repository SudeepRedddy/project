import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, FileCheck, List, Building2, Award, BarChart3, Settings, Palette, Bell, Search, ChevronDown } from 'lucide-react';
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { 
            id: 'students', 
            label: 'Students', 
            icon: Users,
            // count: '1,245',
            description: 'Manage student records'
        },
        { 
            id: 'generate', 
            label: 'Generate Certificates', 
            icon: FileCheck,
            // count: '89',
            description: 'Generate new certificates'
        },
        { 
            id: 'certificates', 
            label: 'Records', 
            icon: List,
            // count: '2,156',
            description: 'View certificate records'
        },
        { 
            id: 'analytics', 
            label: 'Analytics', 
            icon: BarChart3,
            // trend: '+12%',
            description: 'Performance insights'
        },
        { 
            id: 'templates', 
            label: 'Templates', 
            icon: Palette,
            // count: '24',
            description: 'Certificate designs'
        },
        { 
            id: 'settings', 
            label: 'Settings', 
            icon: Settings,
            description: 'System configuration'
        }
    ];

    const activeTabData = tabs.find(tab => tab.id === activeTab);

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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left Section */}
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                                    <Building2 className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">{university.name}</h1>
                                    <p className="text-sm text-gray-500">Education Management System</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                                />
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bell className="h-5 w-5" />
                            </button>
                            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                                <Award className="h-4 w-4" />
                                <span className="text-sm font-medium">Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-[73px] z-30">
                <div className="px-6">
                    <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-3 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                        isActive
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{tab.label}</span>
                                    {tab.count && (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                    {tab.trend && (
                                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                                            {tab.trend}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="px-6 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-8">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UniversityDashboard;