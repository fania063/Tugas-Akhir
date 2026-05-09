-- Migration 003: Create examinations table (Single-Tenant — Posyandu Melati)
-- Dihapus: puskesmas_id (tidak lagi multi-tenant)
-- Dihapus: tekanan_darah, riwayat_penyakit, keluhan, diagnosa, terapi, keterangan
--   (field spesifik ada di tabel detail masing-masing)

CREATE TYPE jenis_pemeriksaan_enum AS ENUM
  ('Balita', 'Ibu_Hamil', 'Ibu_Menyusui', 'Lansia');

CREATE TABLE examinations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id           UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id              UUID NOT NULL REFERENCES profiles(id),
  tanggal_pemeriksaan  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  jenis_pemeriksaan    jenis_pemeriksaan_enum NOT NULL,
  berat_badan          NUMERIC(5,2),
  tinggi_badan         NUMERIC(5,2),
  tekanan_darah        VARCHAR,   -- digunakan hanya oleh Lansia & Bumil
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
