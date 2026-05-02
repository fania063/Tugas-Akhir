-- Migration 007: Create RLS policies
ALTER TABLE puskesmas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE puskesmas_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_balita_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_bumil_details  ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_busui_details  ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_lansia_details ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS VARCHAR LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_my_puskesmas_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER AS $$
  SELECT puskesmas_id FROM profiles WHERE id = auth.uid();
$$;

-- PUSKESMAS
CREATE POLICY "super_admin manages puskesmas"
  ON puskesmas FOR ALL TO authenticated
  USING (get_my_role() = 'super_admin');

CREATE POLICY "others read own puskesmas"
  ON puskesmas FOR SELECT TO authenticated
  USING (id = get_my_puskesmas_id());

-- PUSKESMAS_PATIENTS
CREATE POLICY "scoped puskesmas_patients"
  ON puskesmas_patients FOR ALL TO authenticated
  USING (
    get_my_role() = 'super_admin'
    OR puskesmas_id = get_my_puskesmas_id()
  );

-- PATIENTS
CREATE POLICY "read registered patients"
  ON patients FOR SELECT TO authenticated
  USING (
    get_my_role() = 'super_admin'
    OR EXISTS (
      SELECT 1 FROM puskesmas_patients
      WHERE patient_id = patients.id
      AND puskesmas_id = get_my_puskesmas_id()
    )
  );

CREATE POLICY "admin mutate patients"
  ON patients FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "admin update patients"
  ON patients FOR UPDATE TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "admin delete patients"
  ON patients FOR DELETE TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'));

-- EXAMINATIONS
CREATE POLICY "scoped examinations"
  ON examinations FOR ALL TO authenticated
  USING (
    get_my_role() = 'super_admin'
    OR puskesmas_id = get_my_puskesmas_id()
  );

-- DETAIL TABLES
CREATE POLICY "scoped balita details"
  ON examination_balita_details FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM examinations e
      WHERE e.id = examination_id
      AND (get_my_role() = 'super_admin' OR e.puskesmas_id = get_my_puskesmas_id())
    )
  );

CREATE POLICY "scoped bumil details"
  ON examination_bumil_details FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM examinations e
      WHERE e.id = examination_id
      AND (get_my_role() = 'super_admin' OR e.puskesmas_id = get_my_puskesmas_id())
    )
  );

CREATE POLICY "scoped busui details"
  ON examination_busui_details FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM examinations e
      WHERE e.id = examination_id
      AND (get_my_role() = 'super_admin' OR e.puskesmas_id = get_my_puskesmas_id())
    )
  );

CREATE POLICY "scoped lansia details"
  ON examination_lansia_details FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM examinations e
      WHERE e.id = examination_id
      AND (get_my_role() = 'super_admin' OR e.puskesmas_id = get_my_puskesmas_id())
    )
  );
