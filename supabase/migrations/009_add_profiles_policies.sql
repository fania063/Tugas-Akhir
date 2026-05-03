-- Migration 009: Add RLS policies for profiles table (Fixed version)
-- Fixes the recursion error that caused infinite loading.

-- Hapus dulu policy yang lama jika ada
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

-- 1. Izin dasar: User bisa melihat profilnya sendiri
-- Ini tidak rekursif karena hanya membandingkan ID
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- 2. Izin update: User bisa mengubah profilnya sendiri
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- 3. Izin Super Admin: Bisa melihat SEMUA profil
-- Menggunakan fungsi get_my_role() yang SECURITY DEFINER untuk menghindari rekursi
CREATE POLICY "Super admins can view all profiles" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (get_my_role() = 'super_admin');
