/*
  # Add storage path column and update certificates table

  1. Changes
    - Add storage_path column to certificates table
    - Add indexes for better query performance
    - Update existing certificates table structure

  2. Security
    - Maintain existing RLS policies
*/

-- Add storage_path column if it doesn't exist
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS storage_path text;

-- Add index for certificate_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id 
ON certificates(certificate_id);

-- Add index for student lookup
CREATE INDEX IF NOT EXISTS idx_certificates_student_course 
ON certificates(student_id, course);

-- Add constraint to ensure storage_path or pdf_url is present
ALTER TABLE certificates
ADD CONSTRAINT check_certificate_storage
CHECK (storage_path IS NOT NULL OR pdf_url IS NOT NULL);

-- Update the certificates table to ensure proper constraints
ALTER TABLE certificates
ALTER COLUMN certificate_id SET NOT NULL,
ALTER COLUMN student_id SET NOT NULL,
ALTER COLUMN student_name SET NOT NULL,
ALTER COLUMN course SET NOT NULL,
ALTER COLUMN university SET NOT NULL;