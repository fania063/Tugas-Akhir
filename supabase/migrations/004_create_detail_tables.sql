-- Migration 004: Create detail tables for each examination type
-- Posyandu Melati — Single Tenant

-- =============================================
-- BALITA
-- Dihapus: tekanan darah, keluhan, riwayat, diagnosa, terapi
-- Imunisasi kini dicatat terpisah di tabel vaccination_records
-- =============================================
CREATE TABLE examination_balita_details (
  examination_id  UUID PRIMARY KEY REFERENCES examinations(id) ON DELETE CASCADE,
  -- Status gizi
  status_gizi     VARCHAR,        -- 'Normal', 'Gizi Kurang', 'Gizi Buruk', 'Gizi Lebih'
  -- Catatan tambahan pemeriksaan
  catatan         TEXT
);

-- Tabel terpisah untuk riwayat imunisasi balita (bisa banyak per pasien)
CREATE TABLE vaccination_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  examination_id  UUID REFERENCES examinations(id) ON DELETE SET NULL,
  jenis_vaksin    VARCHAR NOT NULL,   -- 'BCG', 'DPT1', 'DPT2', 'DPT3', 'Polio1', 'Polio2', 'Polio3', 'Polio4', 'HB0', 'HB1', 'HB2', 'HB3', 'Campak', 'Vit_A'
  tanggal         DATE NOT NULL,
  usia_bulan      SMALLINT,           -- dihitung otomatis dari tanggal lahir saat insert
  usia_hari       SMALLINT,
  catatan         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- IBU HAMIL (BUMIL)
-- Dihapus: tp, gpa, lila_cm, obat_dikonsumsi, keterangan
-- Ditambah: imunisasi TT1 & TT2
-- =============================================
CREATE TABLE examination_bumil_details (
  examination_id   UUID PRIMARY KEY REFERENCES examinations(id) ON DELETE CASCADE,
  hpht             DATE,              -- Hari Pertama Haid Terakhir (untuk hitung usia kehamilan)
  tanda_bahaya     TEXT,
  -- Imunisasi Tetanus Toksoid
  imunisasi_tt1    BOOLEAN DEFAULT FALSE,
  tanggal_tt1      DATE,
  imunisasi_tt2    BOOLEAN DEFAULT FALSE,
  tanggal_tt2      DATE
);

-- =============================================
-- IBU MENYUSUI (BUSUI)
-- Dihapus: nama_bayi, riwayat_penyakit, keterangan
-- kondisi_asi → enum terbatas + field custom
-- =============================================
CREATE TYPE kondisi_asi_enum AS ENUM (
  'eksklusif',
  'tidak_lancar',
  'campuran',
  'tidak_menyusui',
  'lainnya'
);

CREATE TABLE examination_busui_details (
  examination_id     UUID PRIMARY KEY REFERENCES examinations(id) ON DELETE CASCADE,
  jenis_persalinan   VARCHAR,
  kondisi_asi        kondisi_asi_enum,
  kondisi_asi_kustom TEXT,            -- diisi jika kondisi_asi = 'lainnya'
  catatan            TEXT
);

-- =============================================
-- LANSIA
-- Ditambah: asam_urat, keluhan, diagnosa, terapi
-- =============================================
CREATE TABLE examination_lansia_details (
  examination_id  UUID PRIMARY KEY REFERENCES examinations(id) ON DELETE CASCADE,
  gula_darah      NUMERIC(6,2),   -- mg/dl, normal < 180
  kolesterol      NUMERIC(6,2),   -- mg/dl, normal < 180
  asam_urat       NUMERIC(5,2),   -- mg/dl, normal 1-6
  keluhan         TEXT,
  diagnosa        TEXT,
  terapi          TEXT
);
