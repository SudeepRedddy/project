/*
  # Add grade field to certificates table

  1. Changes
    - Add `grade` column to `certificates` table
    - Set default value as empty string
    - Add check constraint to ensure grade is not null

  2. Security
    - No changes to existing RLS policies
    - Grade field will inherit existing security rules
*/

-- Add grade column to certificates table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificates' AND column_name = 'grade'
  ) THEN
    ALTER TABLE certificates ADD COLUMN grade text DEFAULT '' NOT NULL;
  END IF;
END $$;

-- Add check constraint to ensure grade is not null
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'check_grade' AND table_name = 'certificates'
  ) THEN
    ALTER TABLE certificates ADD CONSTRAINT check_grade CHECK (grade IS NOT NULL);
  END IF;
END $$;