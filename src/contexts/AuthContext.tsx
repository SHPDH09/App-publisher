import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthSession, getSession, logout as logoutAuth } from '../lib/auth';

interface AuthContextType {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);
  }, []);

  const logout = () => {
    logoutAuth();
    setSession(null);
  };

  const value = {
    session,
    setSession,
    logout,
    isAuthenticated: session !== null
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
