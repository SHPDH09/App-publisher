/*
  # Desktop App Download Platform Schema

  ## Overview
  This migration creates the database structure for a desktop app download platform
  with public app downloads and admin-only management capabilities.

  ## New Tables
  
  ### `admins`
  Stores admin user credentials for platform management
  - `id` (uuid, primary key) - Unique admin identifier
  - `admin_id` (text, unique) - Custom admin login ID (e.g., "1A74N3077")
  - `password_hash` (text) - Bcrypt hashed password for secure authentication
  - `name` (text) - Admin's display name
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### `apps`
  Stores desktop application metadata and download information
  - `id` (uuid, primary key) - Unique app identifier
  - `name` (text) - Application name
  - `version` (text) - Version number (e.g., "1.0.0")
  - `description` (text) - Detailed app description
  - `filename` (text) - Original filename of uploaded file
  - `file_path` (text) - Storage path in Supabase Storage
  - `filesize` (bigint) - File size in bytes
  - `download_count` (int) - Total number of downloads
  - `upload_date` (timestamptz) - Upload timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ## Security
  
  ### RLS Policies
  
  #### `admins` table:
  - Enable RLS to protect admin credentials
  - Only authenticated admins can read their own data
  - No public access allowed
  
  #### `apps` table:
  - Enable RLS for controlled access
  - Public SELECT access for browsing apps
  - Only authenticated admins can INSERT, UPDATE, DELETE apps
  
  ## Important Notes
  
  1. **Password Security**: Admin passwords must be hashed using bcrypt before insertion
  2. **Public Access**: The apps table allows unauthenticated reads for the public download page
  3. **File Storage**: Actual files are stored in Supabase Storage, not in the database
  4. **Admin Verification**: Admin authentication should verify both admin_id and password_hash
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create apps table
CREATE TABLE IF NOT EXISTS apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version text DEFAULT '',
  description text DEFAULT '',
  filename text NOT NULL,
  file_path text NOT NULL,
  filesize bigint DEFAULT 0,
  download_count int DEFAULT 0,
  upload_date timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins can read their own data (for session validation)
CREATE POLICY "Admins can read own data"
  ON admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Enable RLS on apps table
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

-- Public can view all apps (for download page)
CREATE POLICY "Public can view all apps"
  ON apps
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated admins can view all apps
CREATE POLICY "Admins can view all apps"
  ON apps
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated admins can insert apps
CREATE POLICY "Admins can insert apps"
  ON apps
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated admins can update apps
CREATE POLICY "Admins can update apps"
  ON apps
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated admins can delete apps
CREATE POLICY "Admins can delete apps"
  ON apps
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_admins_admin_id ON admins(admin_id);

-- Create index for faster app queries
CREATE INDEX IF NOT EXISTS idx_apps_upload_date ON apps(upload_date DESC);