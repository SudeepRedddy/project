-- 1. UNIVERSITIES TABLE
-- This table stores public profile information for each university.
CREATE TABLE universities (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT
);

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

-- Universities can see their own profile
CREATE POLICY "Universities can view their own profile"
  ON universities FOR SELECT
  USING (auth.uid() = id);

-- Universities can update their own profile
CREATE POLICY "Universities can update their own profile"
  ON universities FOR UPDATE
  USING (auth.uid() = id);

-- Function to create a university profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.universities (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function upon new user creation in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. STUDENTS TABLE
-- This table stores student information, managed by universities.
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  student_roll_number TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (university_id, student_roll_number),
  UNIQUE (university_id, student_email)
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Universities can manage their own students
CREATE POLICY "Universities can manage their own students"
  ON students FOR ALL
  USING (auth.uid() = university_id);


-- 3. UPDATE CERTIFICATES TABLE
-- Add university_id and student_id foreign keys.
ALTER TABLE certificates
  ADD COLUMN university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
  ADD COLUMN student_id_ref UUID REFERENCES public.students(id) ON DELETE SET NULL;

-- Recreate policies for the certificates table
DROP POLICY IF EXISTS "Public read access" ON certificates;
DROP POLICY IF EXISTS "Public insert access" ON certificates;

-- Universities can create certificates for their own students
CREATE POLICY "Universities can create certificates"
  ON certificates FOR INSERT
  WITH CHECK (auth.uid() = university_id);

-- Universities can see certificates they have issued
CREATE POLICY "Universities can view their own certificates"
  ON certificates FOR SELECT
  USING (auth.uid() = university_id);

-- Anyone can verify a certificate (public read access remains)
CREATE POLICY "Anyone can view any certificate"
  ON certificates FOR SELECT
  TO public
  USING (true);