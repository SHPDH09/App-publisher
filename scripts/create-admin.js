import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://0ec90b57d6e95fcbda19832f.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  try {
    const plainPassword = 'Raunak@12583';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const { data, error } = await supabase
      .from('admins')
      .insert({
        admin_id: '1A74N3077',
        password_hash: hashedPassword,
        name: 'Raunak'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        console.log('Admin already exists');
      } else {
        console.error('Error creating admin:', error);
      }
    } else {
      console.log('Admin created successfully:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createAdmin();
