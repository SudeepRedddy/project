/*
  # Add Enhanced Features

  1. New Tables
    - `university_settings`: Store university customization settings
    - `certificate_templates`: Store custom certificate templates
    - `certificate_analytics`: Track certificate interactions
    - `certificate_revocation_requests`: Handle revocation requests
    - `batch_operations`: Track bulk operations

  2. Enhanced Tables
    - Add new columns to existing tables for enhanced functionality

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- 1. UNIVERSITY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS university_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1B365D',
  secondary_color TEXT DEFAULT '#B08D57',
  certificate_background TEXT DEFAULT '#FAF9F6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(university_id)
);

-- 2. CERTIFICATE TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CERTIFICATE ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS certificate_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id TEXT NOT NULL REFERENCES public.certificates(certificate_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('download', 'verification', 'share')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CERTIFICATE REVOCATION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS certificate_revocation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id TEXT NOT NULL REFERENCES public.certificates(certificate_id) ON DELETE CASCADE,
  student_id_ref UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BATCH OPERATIONS TABLE
CREATE TABLE IF NOT EXISTS batch_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('student_upload', 'certificate_batch')),
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_log JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ADD NEW COLUMNS TO EXISTING TABLES
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.certificate_templates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ipfs_hash TEXT,
ADD COLUMN IF NOT EXISTS public_share_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS revoked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_count INTEGER DEFAULT 0;

-- 7. ENABLE RLS ON NEW TABLES
ALTER TABLE university_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_revocation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_operations ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES FOR UNIVERSITY SETTINGS
CREATE POLICY "Universities can manage their own settings"
  ON university_settings FOR ALL
  USING (auth.uid() = university_id);

-- 9. POLICIES FOR CERTIFICATE TEMPLATES
CREATE POLICY "Universities can manage their own templates"
  ON certificate_templates FOR ALL
  USING (auth.uid() = university_id);

-- 10. POLICIES FOR CERTIFICATE ANALYTICS
CREATE POLICY "Universities can view their certificate analytics"
  ON certificate_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM certificates c 
      WHERE c.certificate_id = certificate_analytics.certificate_id 
      AND c.university_id = auth.uid()
    )
  );

CREATE POLICY "Public can insert analytics events"
  ON certificate_analytics FOR INSERT
  TO public
  WITH CHECK (true);

-- 11. POLICIES FOR REVOCATION REQUESTS
CREATE POLICY "Students can create revocation requests for their certificates"
  ON certificate_revocation_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = student_id_ref
    )
  );

CREATE POLICY "Universities can manage revocation requests for their certificates"
  ON certificate_revocation_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM certificates c 
      WHERE c.certificate_id = certificate_revocation_requests.certificate_id 
      AND c.university_id = auth.uid()
    )
  );

-- 12. POLICIES FOR BATCH OPERATIONS
CREATE POLICY "Universities can manage their own batch operations"
  ON batch_operations FOR ALL
  USING (auth.uid() = university_id);

-- 13. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_certificate_analytics_certificate_id ON certificate_analytics(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificate_analytics_event_type ON certificate_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_certificate_analytics_created_at ON certificate_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_certificates_public_share_id ON certificates(public_share_id);
CREATE INDEX IF NOT EXISTS idx_certificates_template_id ON certificates(template_id);
CREATE INDEX IF NOT EXISTS idx_revocation_requests_status ON certificate_revocation_requests(status);

-- 14. CREATE FUNCTION TO GENERATE PUBLIC SHARE ID
CREATE OR REPLACE FUNCTION generate_public_share_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'share_' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 15. CREATE FUNCTION TO UPDATE CERTIFICATE ANALYTICS
CREATE OR REPLACE FUNCTION update_certificate_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Update download count
    IF NEW.download_count > OLD.download_count THEN
      INSERT INTO certificate_analytics (certificate_id, event_type)
      VALUES (NEW.certificate_id, 'download');
    END IF;
    
    -- Update verification count
    IF NEW.verification_count > OLD.verification_count THEN
      INSERT INTO certificate_analytics (certificate_id, event_type)
      VALUES (NEW.certificate_id, 'verification');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. CREATE TRIGGER FOR ANALYTICS
CREATE TRIGGER certificate_analytics_trigger
  AFTER UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_analytics();

-- 17. CREATE FUNCTION TO AUTO-GENERATE PUBLIC SHARE ID
CREATE OR REPLACE FUNCTION auto_generate_share_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.public_share_id IS NULL THEN
    NEW.public_share_id := generate_public_share_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 18. CREATE TRIGGER FOR AUTO-GENERATING SHARE ID
CREATE TRIGGER auto_share_id_trigger
  BEFORE INSERT ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_share_id();