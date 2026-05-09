-- Migration 006: Seed default admin account (Posyandu Melati)
-- Akun admin pertama dibuat via Supabase Auth menggunakan Stored Procedure
-- Email dan password ditarik dari app secrets / env saat deploy
-- Jalankan fungsi ini SEKALI setelah db reset via Supabase Dashboard atau SQL Editor:
--   SELECT create_default_admin();

CREATE OR REPLACE FUNCTION public.create_default_admin(
  p_email TEXT DEFAULT current_setting('app.admin_email', true),
  p_password TEXT DEFAULT current_setting('app.admin_password', true),
  p_nama TEXT DEFAULT 'Administrator Posyandu Melati'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_password TEXT;
BEGIN
  -- Fallback ke nilai default jika env tidak di-set
  v_email := COALESCE(p_email, 'admin@posyandumelati.id');
  v_password := COALESCE(p_password, 'Admin@Melati123');

  -- Cek apakah sudah ada admin
  IF EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
    RETURN 'Admin sudah ada, tidak perlu dibuat ulang.';
  END IF;

  -- Buat user di auth.users via Supabase admin API (hanya bisa dari service role)
  -- Trigger handle_new_user akan otomatis membuat profil
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    gen_random_uuid(),
    v_email,
    crypt(v_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object('nama', p_nama, 'role', 'admin'),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  )
  RETURNING id INTO v_user_id;

  -- Update role ke 'admin' (trigger mungkin belum set karena timing)
  UPDATE public.profiles SET role = 'admin', nama = p_nama WHERE id = v_user_id;

  RETURN 'Admin berhasil dibuat dengan email: ' || v_email;

EXCEPTION WHEN OTHERS THEN
  RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Instruksi penggunaan:
-- 1. Setelah `npx supabase db reset`, buka Supabase Dashboard > SQL Editor
-- 2. Set konfigurasi (opsional, jika tidak maka gunakan default):
--    ALTER DATABASE postgres SET app.admin_email = 'email@anda.com';
--    ALTER DATABASE postgres SET app.admin_password = 'PasswordAman123!';
-- 3. Jalankan: SELECT create_default_admin();
