import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, Copy, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  type CertificateTemplate, 
  type TemplateData, 
  defaultTemplate, 
  modernTemplate, 
  elegantTemplate,
  predefinedTemplates,
  renderTemplatePreview 
} from '../lib/templates';

const CertificateTemplates: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    template_data: TemplateData;
  }>({
    name: '',
    description: '',
    template_data: defaultTemplate
  });

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificate_templates')
        .select('*')
        .eq('university_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !formData.name.trim()) return;

    try {
      const templateData = {
        university_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        template_data: formData.template_data
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('certificate_templates')
          .update({
            ...templateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('certificate_templates')
          .insert(templateData);

        if (error) throw error;
      }

      await fetchTemplates();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save template:', error);
      alert('Failed to save template: ' + error.message);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('certificate_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      await fetchTemplates();
    } catch (error: any) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template: ' + error.message);
    }
  };

  const handleDuplicate = async (template: CertificateTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description,
      template_data: template.template_data
    });
    setEditingTemplate(null);
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      template_data: defaultTemplate
    });
    setEditingTemplate(null);
    setShowCreateForm(false);
  };

  const startEdit = (template: CertificateTemplate) => {
    setFormData({
      name: template.name,
      description: template.description,
      template_data: template.template_data
    });
    setEditingTemplate(template);
    setShowCreateForm(true);
  };

  const createFromPredefined = (predefined: { name: string; data: TemplateData }) => {
    setFormData({
      name: predefined.name,
      description: `${predefined.name} certificate template`,
      template_data: predefined.data
    });
    setEditingTemplate(null);
    setShowCreateForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full mb-4 shadow-lg">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Certificate Templates</h2>
        <p className="text-gray-600 text-lg">Create and manage custom certificate designs</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Custom Template
        </button>

        {/* Predefined Templates */}
        {predefinedTemplates.map((template, index) => (
          <button
            key={index}
            onClick={() => createFromPredefined(template)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <FileText className="h-4 w-4 mr-2" />
            Use {template.name}
          </button>
        ))}
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe this template"
                />
              </div>

              {/* Color Settings */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Colors
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Primary</label>
                    <input
                      type="color"
                      value={formData.template_data.colors.primary}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        template_data: {
                          ...prev.template_data,
                          colors: { ...prev.template_data.colors, primary: e.target.value }
                        }
                      }))}
                      className="w-full h-10 rounded-lg border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Secondary</label>
                    <input
                      type="color"
                      value={formData.template_data.colors.secondary}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        template_data: {
                          ...prev.template_data,
                          colors: { ...prev.template_data.colors, secondary: e.target.value }
                        }
                      }))}
                      className="w-full h-10 rounded-lg border border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Layout Settings */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Layout
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="landscape"
                      checked={formData.template_data.layout === 'landscape'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        template_data: { ...prev.template_data, layout: e.target.value as 'landscape' | 'portrait' }
                      }))}
                      className="mr-2"
                    />
                    Landscape
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="portrait"
                      checked={formData.template_data.layout === 'portrait'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        template_data: { ...prev.template_data, layout: e.target.value as 'landscape' | 'portrait' }
                      }))}
                      className="mr-2"
                    />
                    Portrait
                  </label>
                </div>
              </div>

              {/* Text Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Certificate Title
                </label>
                <input
                  type="text"
                  value={formData.template_data.text_content.title}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    template_data: {
                      ...prev.template_data,
                      text_content: { ...prev.template_data.text_content, title: e.target.value }
                    }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Preview</h4>
              <div 
                className={`bg-white rounded-lg border-2 p-6 text-center ${
                  formData.template_data.layout === 'portrait' ? 'aspect-[0.707]' : 'aspect-[1.414]'
                }`}
                style={{ 
                  backgroundColor: formData.template_data.colors.background,
                  borderColor: formData.template_data.colors.secondary
                }}
              >
                <h5 
                  className="text-lg font-bold mb-2"
                  style={{ color: formData.template_data.colors.secondary }}
                >
                  {formData.template_data.text_content.title}
                </h5>
                <p className="text-sm text-gray-600 mb-2">
                  {formData.template_data.text_content.subtitle}
                </p>
                <h6 
                  className="text-base font-bold mb-2"
                  style={{ color: formData.template_data.colors.primary }}
                >
                  Student Name
                </h6>
                <p className="text-xs text-gray-600">
                  {renderTemplatePreview(formData.template_data, {
                    student_name: 'Student Name',
                    course: 'Sample Course',
                    grade: 'A+',
                    university: 'Sample University'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            {/* Template Preview */}
            <div 
              className="h-32 flex items-center justify-center text-center p-4"
              style={{ backgroundColor: template.template_data.colors.background }}
            >
              <div>
                <h4 
                  className="text-sm font-bold mb-1"
                  style={{ color: template.template_data.colors.secondary }}
                >
                  {template.template_data.text_content.title}
                </h4>
                <p className="text-xs text-gray-600">Sample Preview</p>
              </div>
            </div>

            {/* Template Info */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(template)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <span className="text-xs text-gray-500">
                  {new Date(template.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !showCreateForm && (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Templates Yet</h3>
          <p className="text-gray-600 mb-6">Create your first certificate template to get started</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Template
          </button>
        </div>
      )}
    </div>
  );
};

export default CertificateTemplates;