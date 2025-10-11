import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Admin {
  id: string;
  admin_id: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export interface App {
  id: string;
  name: string;
  version: string;
  description: string;
  filename: string;
  file_path: string;
  filesize: number;
  download_count: number;
  upload_date: string;
  updated_at: string;
}
