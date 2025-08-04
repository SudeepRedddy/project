/*
  # Update certificates table policies

  1. Changes
    - Allow public access for inserting certificates
    - Allow public access for reading certificates
  
  2. Security
    - Enable RLS on certificates table
    - Add policies for public access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read certificates" ON certificates;
DROP POLICY IF EXISTS "Anyone can insert certificates" ON certificates;

-- Create new policies for public access
CREATE POLICY "Public read access"
  ON certificates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert access"
  ON certificates
  FOR INSERT
  TO public
  WITH CHECK (true);