/*
  # Add RPC Functions for Enhanced Features

  1. Functions
    - `increment_certificate_counter`: Safely increment certificate counters
    - `get_university_analytics`: Get comprehensive analytics for universities
    - `batch_issue_certificates`: Handle batch certificate operations
*/

-- 1. FUNCTION TO INCREMENT CERTIFICATE COUNTERS
CREATE OR REPLACE FUNCTION increment_certificate_counter(
  cert_id TEXT,
  counter_field TEXT
)
RETURNS VOID AS $$
BEGIN
  IF counter_field = 'download_count' THEN
    UPDATE certificates 
    SET download_count = COALESCE(download_count, 0) + 1
    WHERE certificate_id = cert_id;
  ELSIF counter_field = 'verification_count' THEN
    UPDATE certificates 
    SET verification_count = COALESCE(verification_count, 0) + 1
    WHERE certificate_id = cert_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FUNCTION TO GET UNIVERSITY ANALYTICS
CREATE OR REPLACE FUNCTION get_university_analytics(
  university_uuid UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH analytics_data AS (
    SELECT 
      COUNT(*) as total_certificates,
      SUM(COALESCE(download_count, 0)) as total_downloads,
      SUM(COALESCE(verification_count, 0)) as total_verifications,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'course', course,
          'count', 1
        )
      ) as courses
    FROM certificates 
    WHERE university_id = university_uuid 
    AND revoked = false
  ),
  recent_activity AS (
    SELECT 
      DATE(ca.created_at) as activity_date,
      ca.event_type,
      COUNT(*) as event_count
    FROM certificate_analytics ca
    JOIN certificates c ON c.certificate_id = ca.certificate_id
    WHERE c.university_id = university_uuid
    AND ca.created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY DATE(ca.created_at), ca.event_type
    ORDER BY activity_date
  )
  SELECT JSON_BUILD_OBJECT(
    'total_certificates', COALESCE(ad.total_certificates, 0),
    'total_downloads', COALESCE(ad.total_downloads, 0),
    'total_verifications', COALESCE(ad.total_verifications, 0),
    'recent_activity', COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'date', ra.activity_date,
          'event_type', ra.event_type,
          'count', ra.event_count
        )
      ) FILTER (WHERE ra.activity_date IS NOT NULL),
      '[]'::json
    )
  ) INTO result
  FROM analytics_data ad
  LEFT JOIN recent_activity ra ON true
  GROUP BY ad.total_certificates, ad.total_downloads, ad.total_verifications;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNCTION TO HANDLE BATCH CERTIFICATE OPERATIONS
CREATE OR REPLACE FUNCTION process_batch_certificates(
  batch_id UUID,
  certificate_data JSON[]
)
RETURNS JSON AS $$
DECLARE
  success_count INTEGER := 0;
  error_count INTEGER := 0;
  errors TEXT[] := ARRAY[]::TEXT[];
  cert_record JSON;
BEGIN
  -- Process each certificate in the batch
  FOREACH cert_record IN ARRAY certificate_data
  LOOP
    BEGIN
      INSERT INTO certificates (
        certificate_id,
        student_id,
        student_name,
        course,
        university,
        grade,
        university_id,
        student_id_ref,
        blockchain_verified,
        blockchain_tx_hash
      ) VALUES (
        cert_record->>'certificate_id',
        cert_record->>'student_id',
        cert_record->>'student_name',
        cert_record->>'course',
        cert_record->>'university',
        cert_record->>'grade',
        (cert_record->>'university_id')::UUID,
        (cert_record->>'student_id_ref')::UUID,
        COALESCE((cert_record->>'blockchain_verified')::BOOLEAN, false),
        cert_record->>'blockchain_tx_hash'
      );
      
      success_count := success_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      errors := array_append(errors, SQLERRM);
    END;
  END LOOP;
  
  -- Update batch operation status
  UPDATE batch_operations 
  SET 
    processed_records = success_count + error_count,
    failed_records = error_count,
    error_log = CASE WHEN array_length(errors, 1) > 0 THEN to_json(errors) ELSE NULL END,
    status = CASE WHEN error_count = 0 THEN 'completed' ELSE 'completed' END,
    updated_at = NOW()
  WHERE id = batch_id;
  
  RETURN JSON_BUILD_OBJECT(
    'success_count', success_count,
    'error_count', error_count,
    'errors', errors
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNCTION TO GENERATE CERTIFICATE SHARE LINKS
CREATE OR REPLACE FUNCTION generate_share_links()
RETURNS VOID AS $$
BEGIN
  UPDATE certificates 
  SET public_share_id = generate_public_share_id()
  WHERE public_share_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RUN INITIAL SHARE LINK GENERATION
SELECT generate_share_links();