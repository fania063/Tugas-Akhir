-- 1. Buat Puskesmas Contoh
INSERT INTO public.puskesmas (id, nama, alamat, kode)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Puskesmas Merdeka', 'Jl. Merdeka No. 123', 'PKM001')
ON CONFLICT (id) DO NOTHING;

-- 2. Buat User di Tabel Autentikasi (auth.users)
-- Password dienkripsi menggunakan crypt 'password123'
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'admin@puskesmas.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"nama":"Super Admin", "role":"super_admin"}',
    false,
    'authenticated',
    'authenticated',
    ''
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'petugas@puskesmas.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"nama":"Petugas Budi", "role":"petugas", "puskesmas_id":"00000000-0000-0000-0000-000000000001"}',
    false,
    'authenticated',
    'authenticated',
    ''
  )
ON CONFLICT (id) DO NOTHING;

-- Catatan: Trigger 'on_auth_user_created' di migrasi 002 Anda 
-- akan otomatis membuat data di tabel 'public.profiles' berdasarkan data di atas.
