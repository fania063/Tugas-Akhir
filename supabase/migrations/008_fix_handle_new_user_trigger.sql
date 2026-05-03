-- Migration 008: Fix handle_new_user function to be more robust
-- This prevents "Database error creating new user" when metadata is missing

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, role, puskesmas_id)
  VALUES (
    NEW.id,
    -- Gunakan nama dari metadata, jika tidak ada pakai bagian depan email
    COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
    -- Gunakan role dari metadata, jika tidak ada default ke 'petugas'
    COALESCE(NEW.raw_user_meta_data->>'role', 'petugas'),
    -- Validasi UUID untuk puskesmas_id
    CASE 
      WHEN NEW.raw_user_meta_data->>'puskesmas_id' IS NOT NULL 
           AND NEW.raw_user_meta_data->>'puskesmas_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN (NEW.raw_user_meta_data->>'puskesmas_id')::UUID 
      ELSE NULL 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
