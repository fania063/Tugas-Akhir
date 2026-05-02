-- Migration 006: Create detail tables for examinations
-- Balita
CREATE TABLE examination_balita_details (
  examination_id UUID PRIMARY KEY REFERENCES examinations(id) ON DELETE CASCADE,
  ket_ntob    VARCHAR,
  vit_a       VARCHAR,
  is_bgm      BOOLEAN DEFAULT FALSE,
  is_bgt      BOOLEAN DEFAULT FALSE,
  hb_less_7   BOOLEAN DEFAULT FALSE,
  hb_more_7   BOOLEAN DEFAULT FALSE,
  imun_bcg    BOOLEAN DEFAULT FALSE,
  imun_dpt1   BOOLEAN DEFAULT FALSE,
  imun_dpt2   BOOLEAN DEFAULT FALSE,
  imun_dpt3   BOOLEAN DEFAULT FALSE,
  imun_polio1 BOOLEAN DEFAULT FALSE,
  imun_polio2 BOOLEAN DEFAULT FALSE,
  imun_polio3 BOOLEAN DEFAULT FALSE,
  imun_hb1    BOOLEAN DEFAULT FALSE,
  imun_hb2    BOOLEAN DEFAULT FALSE,
  imun_hb3    BOOLEAN DEFAULT FALSE,
  imun_campak BOOLEAN DEFAULT FALSE
);

-- Ibu Hamil
CREATE TABLE examination_bumil_details (
  examination_id  UUID PRIMARY KEY REFERENCES examinations(id) ON DELETE CASCADE,
  hpht            DATE,
  tp              DATE,
  gpa             VARCHAR,
  lila_cm         NUMERIC(5,2),
  tanda_bahaya    TEXT,
  obat_dikonsumsi TEXT
);

-- Ibu Menyusui
CREATE TABLE examination_busui_details (
  examination_id   UUID PRIMARY KEY REFERENCES examinations(id) ON DELETE CASCADE,
  nama_bayi        VARCHAR,
  jenis_persalinan VARCHAR,
  kondisi_asi      TEXT
);

-- Lansia
CREATE TABLE examination_lansia_details (
  examination_id UUID PRIMARY KEY REFERENCES examinations(id) ON DELETE CASCADE,
  gula_darah     NUMERIC(6,2),
  kolesterol     NUMERIC(6,2)
);
