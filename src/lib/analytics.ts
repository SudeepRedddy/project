// Analytics utilities for tracking certificate interactions

import { supabase } from './supabase';

export interface AnalyticsEvent {
  certificate_id: string;
  event_type: 'download' | 'verification' | 'share';
  ip_address?: string;
  user_agent?: string;
}

export interface CertificateStats {
  total_certificates: number;
  total_downloads: number;
  total_verifications: number;
  certificates_by_course: { course: string; count: number }[];
  recent_activity: {
    date: string;
    downloads: number;
    verifications: number;
  }[];
}

export const trackAnalyticsEvent = async (event: AnalyticsEvent): Promise<void> => {
  try {
    // Get client IP and user agent
    const clientInfo = {
      ip_address: event.ip_address || await getClientIP(),
      user_agent: event.user_agent || navigator.userAgent
    };

    // Insert analytics event
    const { error } = await supabase
      .from('certificate_analytics')
      .insert({
        certificate_id: event.certificate_id,
        event_type: event.event_type,
        ...clientInfo
      });

    if (error) {
      console.error('Analytics tracking error:', error);
    }

    // Update certificate counters
    if (event.event_type === 'download') {
      await incrementCertificateCounter(event.certificate_id, 'download_count');
    } else if (event.event_type === 'verification') {
      await incrementCertificateCounter(event.certificate_id, 'verification_count');
    }
  } catch (error) {
    console.error('Failed to track analytics event:', error);
  }
};

const incrementCertificateCounter = async (certificateId: string, counterField: string): Promise<void> => {
  try {
    // Since we don't have the RPC function, we'll update directly
    const { data: currentCert, error: fetchError } = await supabase
      .from('certificates')
      .select(counterField)
      .eq('certificate_id', certificateId)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return;
    }

    const currentCount = currentCert[counterField] || 0;
    const { error } = await supabase
      .from('certificates')
      .update({ [counterField]: currentCount + 1 })
      .eq('certificate_id', certificateId);

    if (error) {
      console.error('Counter increment error:', error);
    }
  } catch (error) {
    console.error('Failed to increment counter:', error);
  }
};

export const getCertificateStats = async (universityId: string): Promise<CertificateStats> => {
  try {
    // Get total certificates
    const { count: totalCertificates } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true })
      .eq('university_id', universityId)
      .eq('revoked', false);

    // Get total downloads and verifications
    const { data: totals } = await supabase
      .from('certificates')
      .select('download_count, verification_count')
      .eq('university_id', universityId)
      .eq('revoked', false);

    const totalDownloads = totals?.reduce((sum, cert) => sum + (cert.download_count || 0), 0) || 0;
    const totalVerifications = totals?.reduce((sum, cert) => sum + (cert.verification_count || 0), 0) || 0;

    // Get certificates by course
    const { data: courseData } = await supabase
      .from('certificates')
      .select('course')
      .eq('university_id', universityId)
      .eq('revoked', false);

    const certificatesByCourse = courseData?.reduce((acc, cert) => {
      const existing = acc.find(item => item.course === cert.course);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ course: cert.course, count: 1 });
      }
      return acc;
    }, [] as { course: string; count: number }[]) || [];

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentActivity } = await supabase
      .from('certificate_analytics')
      .select('created_at, event_type')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .in('certificate_id', 
        await supabase
          .from('certificates')
          .select('certificate_id')
          .eq('university_id', universityId)
          .then(({ data }) => data?.map(c => c.certificate_id) || [])
      );

    // Group activity by date
    const activityByDate = recentActivity?.reduce((acc, event) => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { downloads: 0, verifications: 0 };
      }
      if (event.event_type === 'download') {
        acc[date].downloads++;
      } else if (event.event_type === 'verification') {
        acc[date].verifications++;
      }
      return acc;
    }, {} as Record<string, { downloads: number; verifications: number }>) || {};

    const recentActivityArray = Object.entries(activityByDate)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total_certificates: totalCertificates || 0,
      total_downloads: totalDownloads,
      total_verifications: totalVerifications,
      certificates_by_course: certificatesByCourse,
      recent_activity: recentActivityArray
    };
  } catch (error) {
    console.error('Failed to get certificate stats:', error);
    return {
      total_certificates: 0,
      total_downloads: 0,
      total_verifications: 0,
      certificates_by_course: [],
      recent_activity: []
    };
  }
};

const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
};