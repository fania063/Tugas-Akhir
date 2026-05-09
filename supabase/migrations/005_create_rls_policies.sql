-- Migration 005: Create RLS policies (Single-Tenant — Posyandu Melati)
-- Tidak ada lagi puskesmas_id, tidak ada super_admin
-- Aturan: Semua user yang sudah login bisa akses semua data pasien & pemeriksaan
--         Hanya admin yang bisa mengelola akun petugas (CREATE/UPDATE/DELETE pada profiles)

ALTER TABLE profiles                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations                ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_balita_details  ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_bumil_details   ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_busui_details   ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_lansia_details  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_records         ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Helper function: cek role tanpa rekursi
-- =============================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS VARCHAR LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- =============================================
-- PROFILES
-- =============================================

-- Setiap user bisa lihat profilnya sendiri
CREATE POLICY "user read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Admin bisa lihat semua profil (untuk kelola petugas)
CREATE POLICY "admin read all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (get_my_role() = 'admin');

-- User bisa update profilnya sendiri
CREATE POLICY "user update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Hanya admin yang bisa DELETE profil petugas
CREATE POLICY "admin delete profiles"
  ON profiles FOR DELETE TO authenticated
  USING (get_my_role() = 'admin');

-- =============================================
-- PATIENTS — semua authenticated user bisa akses
-- =============================================
CREATE POLICY "authenticated read patients"
  ON patients FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated insert patients"
  ON patients FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated update patients"
  ON patients FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "admin delete patients"
  ON patients FOR DELETE TO authenticated
  USING (get_my_role() = 'admin');

-- =============================================
-- EXAMINATIONS — semua authenticated user bisa akses
-- =============================================
CREATE POLICY "authenticated read examinations"
  ON examinations FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated insert examinations"
  ON examinations FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated update examinations"
  ON examinations FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "admin delete examinations"
  ON examinations FOR DELETE TO authenticated
  USING (get_my_role() = 'admin');

-- =============================================
-- DETAIL TABLES — ikuti akses examinations
-- =============================================
CREATE POLICY "authenticated access balita details"
  ON examination_balita_details FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "authenticated access bumil details"
  ON examination_bumil_details FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "authenticated access busui details"
  ON examination_busui_details FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "authenticated access lansia details"
  ON examination_lansia_details FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- =============================================
-- VACCINATION RECORDS
-- =============================================
CREATE POLICY "authenticated access vaccination records"
  ON vaccination_records FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
