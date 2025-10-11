import { useState, useEffect } from 'react';
import { Download, HardDrive, Calendar, TrendingUp } from 'lucide-react';
import { supabase, App } from '../lib/supabase';

export function PublicApps() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function handleDownload(app: App) {
    try {
      const { data } = supabase.storage.from('apps').getPublicUrl(app.file_path);

      await supabase
        .from('apps')
        .update({ download_count: app.download_count + 1 })
        .eq('id', app.id);

      const link = document.createElement('a');
      link.href = data.publicUrl;
      link.download = app.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setApps(prev =>
        prev.map(a => a.id === app.id ? { ...a, download_count: a.download_count + 1 } : a)
      );
    } catch (error) {
      console.error('Error downloading app:', error);
      alert('Failed to download app');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading apps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <HardDrive className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Desktop Apps</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Download powerful desktop applications for your needs. All apps are free and available instantly.
          </p>
        </div>

        {apps.length === 0 ? (
          <div className="text-center py-16">
            <HardDrive className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No apps available yet</h3>
            <p className="text-slate-500">Check back soon for new desktop applications</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{app.name}</h3>
                      {app.version && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-md">
                          v{app.version}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm mb-6 line-clamp-3 min-h-[3rem]">
                    {app.description || 'No description available'}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-slate-500">
                      <HardDrive className="w-4 h-4 mr-2" />
                      <span>{formatFileSize(app.filesize)}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(app.upload_date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span>{app.download_count} downloads</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(app)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 group-hover:shadow-md"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
