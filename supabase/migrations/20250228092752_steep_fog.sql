/*
  # Update certificate storage constraints

  1. Changes
    - Remove the check constraint that requires storage_path or pdf_url to be present
    - Make storage_path and pdf_url nullable
  
  2. Reason
    - The current implementation doesn't store PDF files in storage, but generates them on demand
*/

-- Drop the existing constraint
ALTER TABLE certificates
DROP CONSTRAINT IF EXISTS check_certificate_storage;

-- Make sure both fields can be null
ALTER TABLE certificates
ALTER COLUMN storage_path DROP NOT NULL,
ALTER COLUMN pdf_url DROP NOT NULL;