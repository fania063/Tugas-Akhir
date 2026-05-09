-- Migration: Add medical fields
ALTER TABLE examination_busui_details 
  ADD COLUMN keluhan TEXT, 
  ADD COLUMN diagnosa TEXT, 
  ADD COLUMN terapi TEXT;

ALTER TABLE examination_bumil_details 
  ADD COLUMN keluhan TEXT, 
  ADD COLUMN diagnosa TEXT, 
  ADD COLUMN riwayat_penyakit TEXT, 
  ADD COLUMN terapi TEXT;

ALTER TABLE examination_lansia_details 
  ADD COLUMN keterangan TEXT;
