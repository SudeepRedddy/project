/*
  # Setup Authentication Policies

  1. Changes
    - Enable RLS for all tables.
    - Define policies for universities, students, and certificates.
    - Ensure public read access for certificates and students for verification.
*/

-- 1. ENABLE RLS
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- 2. UNIVERSITIES POLICIES
CREATE POLICY "Users can view their own university profile"
  ON universities FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Universities can update their own profile"
  ON universities FOR UPDATE
  USING (auth.uid() = id);

-- 3. STUDENTS POLICIES
CREATE POLICY "Universities can manage their own students"
  ON students FOR ALL
  USING (auth.uid() = university_id);

CREATE POLICY "Public can read students for login verification"
  ON students FOR SELECT
  TO public
  USING (true);

-- 4. CERTIFICATES POLICIES
CREATE POLICY "Universities can create certificates"
  ON certificates FOR INSERT
  WITH CHECK (auth.uid() = university_id);

CREATE POLICY "Universities can view their own certificates"
  ON certificates FOR SELECT
  USING (auth.uid() = university_id);

CREATE POLICY "Public can view certificates"
  ON certificates FOR SELECT
  TO public
  USING (true);