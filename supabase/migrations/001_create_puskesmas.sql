-- Migration 001: Create puskesmas table
CREATE TABLE puskesmas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama       VARCHAR NOT NULL,
  alamat     TEXT,
  kode       VARCHAR UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
