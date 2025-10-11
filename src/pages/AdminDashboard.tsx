import { useState, useEffect } from 'react';
import { Upload, Trash2, Edit, LogOut, HardDrive, Download, Calendar, X } from 'lucide-react';
import { supabase, App } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function AdminDashboard() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const { session, logout } = useAuth();

  useEffect(() => {
    loadApps();
  }, []);

  async function loadApps() {
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setApps(data || []);
    } catch (error) {
      console.error('Error loading apps:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this app?')) return;

    try {
      const app = apps.find(a => a.id === id);
      if (app) {
        await supabase.storage.from('apps').remove([app.file_path]);
      }

      const { error } = await supabase.from('apps').delete().eq('id', id);

      if (error) throw error;

      setApps(prev => prev.filter(app => app.id !== id));
      alert('App deleted successfully');
    } catch (error) {
      console.error('Error deleting app:', error);
      alert('Failed to delete app');
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-500">Welcome, {session?.name}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => {
              setEditingApp(null);
              setShowUploadModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Upload className="w-5 h-5" />
            Upload New App
          </button>
        </div>

        {apps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <HardDrive className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No apps uploaded yet</h3>
            <p className="text-slate-500 mb-6">Upload your first desktop application to get started</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Upload App
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{app.name}</h3>
                        <div className="flex items-center gap-3 mb-3">
                          {app.version && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-md">
                              v{app.version}
                            </span>
                          )}
                          <span className="text-sm text-slate-500">{app.filename}</span>
                        </div>
                        <p className="text-slate-600 text-sm mb-4">{app.description || 'No description'}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <div className="flex items-center">
                            <HardDrive className="w-4 h-4 mr-2" />
                            {formatFileSize(app.filesize)}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(app.upload_date)}
                          </div>
                          <div className="flex items-center">
                            <Download className="w-4 h-4 mr-2" />
                            {app.download_count} downloads
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingApp(app);
                        setShowUploadModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUploadModal && (
        <UploadModal
          app={editingApp}
          onClose={() => {
            setShowUploadModal(false);
            setEditingApp(null);
          }}
          onSuccess={() => {
            setShowUploadModal(false);
            setEditingApp(null);
            loadApps();
          }}
        />
      )}
    </div>
  );
}

interface UploadModalProps {
  app: App | null;
  onClose: () => void;
  onSuccess: () => void;
}

function UploadModal({ app, onClose, onSuccess }: UploadModalProps) {
  const [name, setName] = useState(app?.name || '');
  const [version, setVersion] = useState(app?.version || '');
  const [description, setDescription] = useState(app?.description || '');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!app && !file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);

    try {
      let filePath = app?.file_path || '';
      let filesize = app?.filesize || 0;
      let filename = app?.filename || '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        filePath = fileName;
        filesize = file.size;
        filename = file.name;

        if (app) {
          await supabase.storage.from('apps').remove([app.file_path]);
        }

        const { error: uploadError } = await supabase.storage
          .from('apps')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
      }

      const appData = {
        name,
        version,
        description,
        filename,
        file_path: filePath,
        filesize,
        updated_at: new Date().toISOString()
      };

      if (app) {
        const { error } = await supabase
          .from('apps')
          .update(appData)
          .eq('id', app.id);

        if (error) throw error;
        alert('App updated successfully');
      } else {
        const { error } = await supabase
          .from('apps')
          .insert(appData);

        if (error) throw error;
        alert('App uploaded successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving app:', error);
      alert('Failed to save app');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {app ? 'Edit App' : 'Upload New App'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              App Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter app name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Version
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 1.0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter app description"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              File {!app && '*'}
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".exe,.zip,.dmg,.msi,.deb,.rpm,.appimage"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-xs text-slate-500">
              Accepted formats: .exe, .zip, .dmg, .msi, .deb, .rpm, .appimage
            </p>
            {app && !file && (
              <p className="mt-2 text-sm text-slate-600">
                Current file: {app.filename}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Saving...' : app ? 'Update App' : 'Upload App'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
