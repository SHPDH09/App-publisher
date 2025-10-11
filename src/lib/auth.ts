import bcrypt from 'bcryptjs';
import { supabase } from './supabase';

export interface AuthSession {
  adminId: string;
  name: string;
  id: string;
}

const SESSION_KEY = 'admin_session';

export async function loginAdmin(adminId: string, password: string): Promise<AuthSession | null> {
  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('admin_id', adminId)
      .maybeSingle();

    if (error || !admin) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return null;
    }

    const session: AuthSession = {
      adminId: admin.admin_id,
      name: admin.name,
      id: admin.id
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export function getSession(): AuthSession | null {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
