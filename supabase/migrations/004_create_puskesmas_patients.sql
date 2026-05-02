-- Migration 004: Create puskesmas_patients table
CREATE TABLE puskesmas_patients (
  puskesmas_id UUID NOT NULL REFERENCES puskesmas(id) ON DELETE CASCADE,
  patient_id   UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  terdaftar_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (puskesmas_id, patient_id)
);

CREATE INDEX idx_puskesmas_patients_puskesmas ON puskesmas_patients(puskesmas_id);
CREATE INDEX idx_puskesmas_patients_patient   ON puskesmas_patients(patient_id);
