DROP POLICY IF EXISTS "admin delete examinations" ON examinations;

CREATE POLICY "authenticated delete examinations"
  ON examinations FOR DELETE TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin delete patients" ON patients;

CREATE POLICY "authenticated delete patients"
  ON patients FOR DELETE TO authenticated
  USING (true);
