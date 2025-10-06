import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { GenerationModel } from '../types/database';
import { User, Bell, Settings as SettingsIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { getModelDisplayName } from '../lib/utils';

export const Settings = () => {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [defaultModel, setDefaultModel] = useState<GenerationModel>('V3_5');
  const [autoDownload, setAutoDownload] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setDefaultModel(profile.default_model);
      setAutoDownload(profile.auto_download);
      setEmailNotifications(profile.email_notifications);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          default_model: defaultModel,
          auto_download: autoDownload,
          email_notifications: emailNotifications,
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences</p>
        </div>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4 flex items-start space-x-3 mb-6">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-400 text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold text-white">Profile</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <SettingsIcon className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-semibold text-white">Preferences</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Model
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['V3_5', 'V4', 'V4_5'] as GenerationModel[]).map((model) => (
                    <button
                      key={model}
                      onClick={() => setDefaultModel(model)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        defaultModel === model
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <p className="font-semibold text-white text-sm">{getModelDisplayName(model)}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This model will be pre-selected when you create new music
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Auto-download</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Automatically download tracks after generation
                  </p>
                </div>
                <button
                  onClick={() => setAutoDownload(!autoDownload)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoDownload ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoDownload ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-emerald-500" />
                <h2 className="text-xl font-semibold text-white">Notifications</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Email Notifications</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Receive updates about your generations and account
                  </p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailNotifications ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
