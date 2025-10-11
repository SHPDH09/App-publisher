import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PublicApps } from './pages/PublicApps';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Shield } from 'lucide-react';

function AppContent() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { isAuthenticated } = useAuth();

  if (showAdminLogin && !isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setShowAdminLogin(true)} />;
  }

  if (isAuthenticated) {
    return (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    );
  }

  return (
    <div className="relative">
      <PublicApps />
      <button
        onClick={() => setShowAdminLogin(true)}
        className="fixed bottom-6 right-6 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
        title="Admin Login"
      >
        <Shield className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
