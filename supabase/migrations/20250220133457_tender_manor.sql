/*
  # Create certificates table

  1. New Tables
    - `certificates`
      - `id` (uuid, primary key)
      - `certificate_id` (text, unique)
      - `student_id` (text)
      - `student_name` (text)
      - `course` (text)
      - `university` (text)
      - `created_at` (timestamp)
      - `pdf_url` (text)

  2. Security
    - Enable RLS on `certificates` table
    - Add policies for authenticated users to read all certificates
*/

CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id text UNIQUE NOT NULL,
  student_id text NOT NULL,
  student_name text NOT NULL,
  course text NOT NULL,
  university text NOT NULL,
  created_at timestamptz DEFAULT now(),
  pdf_url text
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read certificates"
  ON certificates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert certificates"
  ON certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);