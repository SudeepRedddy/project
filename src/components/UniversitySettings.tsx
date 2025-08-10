import React, { useState, useEffect } from 'react';
import { Settings, Upload, Palette, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UniversitySettingsData {
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  certificate_background: string;
}

const UniversitySettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UniversitySettingsData>({
    primary_color: '#1B365D',
    secondary_color: '#B08D57',
    certificate_background: '#FAF9F6'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('university_settings')
        .select('*')
        .eq('university_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setSettings({
          logo_url: data.logo_url,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          certificate_background: data.certificate_background
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be smaller than 2MB' });
      return;
    }

    setUploadingLogo(true);
    setMessage(null);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('university-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('university-assets')
        .getPublicUrl(fileName);

      setSettings(prev => ({ ...prev, logo_url: publicUrl }));
      setMessage({ type: 'success', text: 'Logo uploaded successfully' });
    } catch (error: any) {
      console.error('Logo upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload logo: ' + error.message });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('university_settings')
        .upsert({
          university_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error: any) {
      console.error('Save settings error:', error);
      setMessage({ type: 'error', text: 'Failed to save settings: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const colorPresets = [
    { name: 'Classic Blue', primary: '#1B365D', secondary: '#B08D57', background: '#FAF9F6' },
    { name: 'Modern Purple', primary: '#7C3AED', secondary: '#F59E0B', background: '#FEFBF3' },
    { name: 'Professional Green', primary: '#059669', secondary: '#DC2626', background: '#F9FAFB' },
    { name: 'Elegant Navy', primary: '#1E3A8A', secondary: '#92400E', background: '#FEF7ED' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4 shadow-lg">
          <Settings className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">University Settings</h2>
        <p className="text-gray-600 text-lg">Customize your university profile and certificate appearance</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          )}
          <p className={`font-medium ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Logo Upload */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Upload className="h-6 w-6 mr-2 text-blue-600" />
            University Logo
          </h3>
          
          <div className="space-y-4">
            {settings.logo_url && (
              <div className="flex justify-center">
                <img
                  src={settings.logo_url}
                  alt="University Logo"
                  className="max-w-32 max-h-32 object-contain rounded-lg border border-gray-200"
                />
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
                disabled={uploadingLogo}
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {uploadingLogo ? (
                  <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-2" />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                )}
                <p className="text-gray-600 mb-2">
                  {uploadingLogo ? 'Uploading...' : 'Click to upload logo'}
                </p>
                <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
              </label>
            </div>
          </div>
        </div>

        {/* Color Customization */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Palette className="h-6 w-6 mr-2 text-purple-600" />
            Certificate Colors
          </h3>
          
          <div className="space-y-6">
            {/* Color Presets */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Color Presets
              </label>
              <div className="grid grid-cols-2 gap-3">
                {colorPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      primary_color: preset.primary,
                      secondary_color: preset.secondary,
                      certificate_background: preset.background
                    }))}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex space-x-1 mr-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primary_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.certificate_background}
                    onChange={(e) => setSettings(prev => ({ ...prev, certificate_background: e.target.value }))}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.certificate_background}
                    onChange={(e) => setSettings(prev => ({ ...prev, certificate_background: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Certificate Preview</h3>
        <div 
          className="aspect-[1.414] w-full max-w-md mx-auto rounded-lg border-4 flex flex-col items-center justify-center text-center p-8"
          style={{ 
            backgroundColor: settings.certificate_background,
            borderColor: settings.secondary_color
          }}
        >
          {settings.logo_url && (
            <img
              src={settings.logo_url}
              alt="Logo"
              className="w-16 h-16 object-contain mb-4"
            />
          )}
          <h4 
            className="text-2xl font-bold mb-2"
            style={{ color: settings.secondary_color }}
          >
            Certificate of Achievement
          </h4>
          <p className="text-gray-600 mb-4">This is proudly presented to</p>
          <h5 
            className="text-xl font-bold mb-4"
            style={{ color: settings.primary_color }}
          >
            Student Name
          </h5>
          <p className="text-sm text-gray-600">Sample University</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UniversitySettings;