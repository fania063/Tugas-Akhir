-- Migration 003: Create patients table
CREATE TYPE jenis_kelamin_enum AS ENUM ('L', 'P');

CREATE TABLE patients (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nik              VARCHAR(16) UNIQUE NOT NULL,
  no_bpjs          VARCHAR,
  nama             VARCHAR NOT NULL,
  jenis_kelamin    jenis_kelamin_enum NOT NULL,
  tanggal_lahir    DATE NOT NULL,
  alamat           TEXT,
  no_hp            VARCHAR,
  nama_ayah        VARCHAR,
  nama_ibu         VARCHAR,
  nama_suami       VARCHAR,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
