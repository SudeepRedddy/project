/*
  # Initial Schema Setup

  1. New Tables
    - `universities`: Stores public university profiles.
    - `students`: Stores student information, managed by universities.
    - `certificates`: Stores certificate details.

  2. Functions and Triggers
    - `handle_new_user()`: Creates a university profile when a new user signs up.
    - `on_auth_user_created`: Trigger to execute the function.
*/

-- 1. UNIVERSITIES TABLE
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT
);

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  student_roll_number TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (university_id, student_roll_number),
  UNIQUE (university_id, student_email)
);

-- 3. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id text UNIQUE NOT NULL,
  student_id text NOT NULL,
  student_name text NOT NULL,
  course text NOT NULL,
  university text NOT NULL,
  created_at timestamptz DEFAULT now(),
  pdf_url text,
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
  student_id_ref UUID REFERENCES public.students(id) ON DELETE SET NULL
);

-- 4. FUNCTION TO HANDLE NEW USER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create university profile if the user has university role metadata
  IF NEW.raw_user_meta_data->>'role' = 'university' THEN
    INSERT INTO public.universities (id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
    ON CONFLICT (id) DO NOTHING; -- Avoid conflicts if profile already exists
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the user creation
  RAISE WARNING 'Failed to create university profile: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. TRIGGER FOR NEW USER FUNCTION
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();