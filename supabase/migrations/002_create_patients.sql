-- Migration 002: Create patients table (Single-Tenant — Posyandu Melati)
-- Tambahan: kolom id_ibu untuk relasi Balita → Ibu

CREATE TYPE jenis_kelamin_enum AS ENUM ('L', 'P');

CREATE TABLE patients (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nik            VARCHAR(16) UNIQUE NOT NULL,
  no_bpjs        VARCHAR,
  nama           VARCHAR NOT NULL,
  jenis_kelamin  jenis_kelamin_enum NOT NULL,
  tanggal_lahir  DATE NOT NULL,
  alamat         TEXT,
  no_hp          VARCHAR,
  nama_ayah      VARCHAR,
  nama_ibu       VARCHAR,
  nama_suami     VARCHAR,
  -- Relasi opsional: jika pasien ini adalah Balita, isi dengan UUID pasien Ibu-nya
  id_ibu         UUID REFERENCES patients(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
