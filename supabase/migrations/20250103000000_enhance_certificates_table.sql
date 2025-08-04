/*
  # Enhance Certificates Table

  1. Changes
    - Add new columns: grade, blockchain_tx_hash, blockchain_verified, and storage_path.
    - Add constraints for data integrity.
    - Add indexes for performance.
    - Clean up duplicate certificates.
*/

-- 1. ADD NEW COLUMNS
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS grade text DEFAULT '' NOT NULL,
ADD COLUMN IF NOT EXISTS blockchain_tx_hash text,
ADD COLUMN IF NOT EXISTS blockchain_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS storage_path text;

-- 2. CLEAN UP DUPLICATE CERTIFICATES
CREATE TEMP TABLE latest_certificates AS
SELECT DISTINCT ON (student_id, course)
  id,
  created_at
FROM certificates
ORDER BY student_id, course, created_at DESC;

DELETE FROM certificates
WHERE id NOT IN (SELECT id FROM latest_certificates);

DROP TABLE latest_certificates;

-- 3. ADD CONSTRAINTS
ALTER TABLE certificates
ADD CONSTRAINT unique_student_course UNIQUE (student_id, course),
ADD CONSTRAINT check_student_id CHECK (student_id <> ''),
ADD CONSTRAINT check_course CHECK (course <> ''),
ADD CONSTRAINT check_grade CHECK (grade IS NOT NULL);

-- Drop conflicting constraint and make columns nullable
ALTER TABLE certificates
DROP CONSTRAINT IF EXISTS check_certificate_storage;

ALTER TABLE certificates
ALTER COLUMN storage_path DROP NOT NULL,
ALTER COLUMN pdf_url DROP NOT NULL;

-- 4. ADD INDEXES
CREATE INDEX IF NOT EXISTS idx_students_email_roll ON students(student_email, student_roll_number);
CREATE INDEX IF NOT EXISTS idx_students_university ON students(university_id);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_course ON certificates(student_id, course);
CREATE INDEX IF NOT EXISTS idx_certificates_blockchain_tx_hash ON certificates(blockchain_tx_hash);