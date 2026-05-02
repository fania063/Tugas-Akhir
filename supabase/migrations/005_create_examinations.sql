-- Migration 005: Create examinations table
CREATE TYPE jenis_pemeriksaan_enum AS ENUM
  ('Balita', 'Ibu_Hamil', 'Ibu_Menyusui', 'Lansia');

CREATE TABLE examinations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id           UUID NOT NULL REFERENCES patients(id),
  user_id              UUID NOT NULL REFERENCES profiles(id),
  puskesmas_id         UUID NOT NULL REFERENCES puskesmas(id),
  tanggal_pemeriksaan  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  jenis_pemeriksaan    jenis_pemeriksaan_enum NOT NULL,
  berat_badan          NUMERIC(5,2),
  tinggi_badan         NUMERIC(5,2),
  tekanan_darah        VARCHAR,
  riwayat_penyakit     TEXT,
  keluhan              TEXT,
  diagnosa             TEXT,
  terapi               TEXT,
  keterangan           TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
