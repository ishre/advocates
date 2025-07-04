import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { initializeEmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    // Check email configuration
    const emailHost = process.env.EMAIL_HOST || process.env.SMTP_HOST;
    const emailPort = process.env.EMAIL_PORT || process.env.SMTP_PORT;
    const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
    const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
    const emailSecure = process.env.EMAIL_SECURE || process.env.SMTP_SECURE;

    const configStatus = {
      host: emailHost ? '✅ Configured' : '❌ Missing',
      port: emailPort ? '✅ Configured' : '❌ Missing',
      user: emailUser ? '✅ Configured' : '❌ Missing',
      pass: emailPass ? '✅ Configured' : '❌ Missing',
      secure: emailSecure ? '✅ Configured' : '❌ Missing',
    };

    if (!emailHost || !emailPort || !emailUser || !emailPass) {
      return NextResponse.json({
        error: 'Email configuration incomplete',
        configStatus,
        message: 'Please configure EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS environment variables'
      }, { status: 400 });
    }

    // Test email service
    try {
      const emailService = initializeEmailService({
        host: emailHost,
        port: parseInt(emailPort),
        secure: emailSecure === 'true',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      // Test connection
      const connectionTest = await emailService.testConnection();
      
      if (!connectionTest) {
        return NextResponse.json({
          error: 'Email connection failed',
          configStatus,
          message: 'Could not connect to email server. Please check your SMTP settings.'
        }, { status: 500 });
      }

      // Send test email
      const emailSent = await emailService.sendEmail({
        to,
        subject: 'Test Email from Lexapro Case Manager',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #fff; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Lexapro Case Manager</h1>
              <p style="margin: 8px 0 0 0;">Test Email</p>
            </div>
            <div style="padding: 20px; background: #fff;">
              <h2 style="color: #1e40af;">Email Configuration Test</h2>
              <p>This is a test email to verify that your email configuration is working correctly.</p>
              <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #059669;">
                <h3 style="color: #059669; margin-top: 0;">Configuration Status</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Host: ${configStatus.host}</li>
                  <li>Port: ${configStatus.port}</li>
                  <li>User: ${configStatus.user}</li>
                  <li>Password: ${configStatus.pass}</li>
                  <li>Secure: ${configStatus.secure}</li>
                </ul>
              </div>
              <p style="margin-top: 20px; color: #6b7280; font-size: 0.9rem;">
                If you received this email, your email configuration is working correctly!
              </p>
            </div>
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #fff; padding: 15px; text-align: center; font-size: 0.9rem;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Lexapro Case Manager</p>
            </div>
          </div>
        `,
        text: `
Test Email from Lexapro Case Manager

Email Configuration Test

This is a test email to verify that your email configuration is working correctly.

Configuration Status:
- Host: ${configStatus.host}
- Port: ${configStatus.port}
- User: ${configStatus.user}
- Password: ${configStatus.pass}
- Secure: ${configStatus.secure}

If you received this email, your email configuration is working correctly!
        `
      });

      if (emailSent) {
        return NextResponse.json({
          success: true,
          message: 'Test email sent successfully',
          configStatus
        });
      } else {
        return NextResponse.json({
          error: 'Failed to send test email',
          configStatus,
          message: 'Email service returned false. Check your SMTP settings.'
        }, { status: 500 });
      }
    } catch (emailError) {
      return NextResponse.json({
        error: 'Email service error',
        configStatus,
        message: emailError instanceof Error ? emailError.message : 'Unknown email error',
        details: emailError
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 