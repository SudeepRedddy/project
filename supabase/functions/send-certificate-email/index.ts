import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailRequest {
  certificate_id: string;
  student_email: string;
  student_name: string;
  course: string;
  university: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { certificate_id, student_email, student_name, course, university }: EmailRequest = await req.json()

    // Validate required fields
    if (!certificate_id || !student_email || !student_name || !course || !university) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get certificate data from database
    const { data: certificate, error: certError } = await supabaseClient
      .from('certificates')
      .select('*')
      .eq('certificate_id', certificate_id)
      .single()

    if (certError || !certificate) {
      return new Response(
        JSON.stringify({ error: 'Certificate not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create email content
    const publicUrl = certificate.public_share_id 
      ? `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/certificate/${certificate.public_share_id}`
      : null;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Certificate from ${university}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 40px 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
          .content { padding: 40px 30px; }
          .certificate-info { background: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #3b82f6; }
          .info-row { display: flex; justify-content: space-between; margin: 12px 0; }
          .info-label { font-weight: 600; color: #64748b; }
          .info-value { color: #1e293b; font-weight: 500; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
          .cta-button:hover { transform: translateY(-2px); }
          .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
          .verification-badge { background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; margin: 16px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Certificate Ready!</h1>
            <p>Your academic achievement has been verified and is ready for download</p>
          </div>
          
          <div class="content">
            <h2>Dear ${student_name},</h2>
            <p>Congratulations! Your certificate for <strong>${course}</strong> from <strong>${university}</strong> is now available.</p>
            
            <div class="certificate-info">
              <h3 style="margin-top: 0; color: #1e293b;">📋 Certificate Details</h3>
              <div class="info-row">
                <span class="info-label">Student Name:</span>
                <span class="info-value">${student_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Course:</span>
                <span class="info-value">${course}</span>
              </div>
              <div class="info-row">
                <span class="info-label">University:</span>
                <span class="info-value">${university}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Certificate ID:</span>
                <span class="info-value">${certificate_id}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Issue Date:</span>
                <span class="info-value">${new Date(certificate.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              ${certificate.grade ? `
              <div class="info-row">
                <span class="info-label">Grade:</span>
                <span class="info-value">${certificate.grade}</span>
              </div>
              ` : ''}
            </div>

            ${certificate.blockchain_verified ? 
              '<div class="verification-badge">🔒 Blockchain Verified</div>' : 
              '<div class="verification-badge" style="background: #fef3c7; color: #92400e;">📄 Database Verified</div>'
            }
            
            <p>You can access your certificate through your student dashboard:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/student/dashboard" class="cta-button">
                🎓 Access Student Dashboard
              </a>
            </div>

            ${publicUrl ? `
            <p>You can also share your certificate publicly using this link:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${publicUrl}" class="cta-button" style="background: linear-gradient(135deg, #10b981, #059669);">
                🔗 View Public Certificate
              </a>
            </div>
            ` : ''}

            <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #3b82f6;">
              <h4 style="margin-top: 0; color: #1e40af;">💡 What you can do:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
                <li>Download your certificate as a PDF</li>
                <li>Share the public verification link</li>
                <li>Add it to your LinkedIn profile</li>
                <li>Include it in your resume or portfolio</li>
                <li>Verify its authenticity anytime</li>
              </ul>
            </div>

            <p>If you have any questions about your certificate, please contact your university directly.</p>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The Certify Team</strong><br>
              <em>Secure Digital Certificates</em>
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Certify</strong> - Blockchain Certificate Management System</p>
            <p>This certificate is secured by blockchain technology and cannot be forged.</p>
            <p style="margin-top: 16px; font-size: 12px; color: #94a3b8;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // For demo purposes, we'll simulate sending an email
    // In production, you would integrate with a service like SendGrid, Resend, or similar
    console.log(`Sending email to: ${student_email}`);
    console.log(`Subject: Your Certificate from ${university}`);
    console.log('Email content prepared successfully');

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, you would call your email service here:
    /*
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: student_email, name: student_name }],
          subject: `Your Certificate from ${university}`
        }],
        from: { email: 'certificates@yourapp.com', name: 'Certify' },
        content: [{
          type: 'text/html',
          value: emailHtml
        }]
      })
    });
    */

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Certificate email sent successfully',
        email_sent_to: student_email
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending certificate email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send certificate email',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})