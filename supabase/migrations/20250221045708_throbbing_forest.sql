/*
  # Add unique constraint for student course combinations

  1. Changes
    - Remove duplicate certificates keeping only the latest one
    - Add unique constraint to prevent duplicate certificates for same student and course
    - Add check constraints for non-empty student_id and course fields
  
  2. Security
    - Maintains existing RLS policies
*/

-- First, create a temporary table to store the latest certificates for each student-course combination
CREATE TEMP TABLE latest_certificates AS
SELECT DISTINCT ON (student_id, course) 
  id,
  created_at
FROM certificates
ORDER BY student_id, course, created_at DESC;

-- Delete duplicate certificates keeping only the latest ones
DELETE FROM certificates
WHERE id NOT IN (SELECT id FROM latest_certificates);

-- Drop the temporary table
DROP TABLE latest_certificates;

-- Now add the unique constraint
ALTER TABLE certificates 
ADD CONSTRAINT unique_student_course 
UNIQUE (student_id, course);

-- Add check constraints
ALTER TABLE certificates
ADD CONSTRAINT check_student_id
CHECK (student_id <> '');

ALTER TABLE certificates
ADD CONSTRAINT check_course
CHECK (course <> '');