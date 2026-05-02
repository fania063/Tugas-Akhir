-- Migration 002: Create profiles table
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama         VARCHAR NOT NULL,
  no_hp        VARCHAR,
  role         VARCHAR NOT NULL DEFAULT 'petugas'
               CHECK (role IN ('super_admin', 'admin', 'petugas')),
  puskesmas_id UUID REFERENCES puskesmas(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile saat user baru di auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nama, role, puskesmas_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nama',
    COALESCE(NEW.raw_user_meta_data->>'role', 'petugas'),
    NULLIF(NEW.raw_user_meta_data->>'puskesmas_id', '')::UUID
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
