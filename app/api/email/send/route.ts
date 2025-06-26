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
    const { to, subject, html, text, type, data } = body;

    // Check if email is configured
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailHost || !emailPort || !emailUser || !emailPass) {
      return NextResponse.json(
        { error: 'Email not configured' },
        { status: 500 }
      );
    }

    // Initialize email service
    const emailService = initializeEmailService({
      host: emailHost,
      port: parseInt(emailPort),
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    let emailSent = false;

    // Send email based on type
    switch (type) {
      case 'case_update':
        emailSent = await emailService.sendCaseUpdateNotification(to, data);
        break;
      case 'client_welcome':
        emailSent = await emailService.sendClientWelcomeEmail(to, data);
        break;
      case 'hearing_reminder':
        emailSent = await emailService.sendHearingReminder(to, data);
        break;
      case 'document_notification':
        emailSent = await emailService.sendDocumentNotification(to, data);
        break;
      case 'password_reset':
        emailSent = await emailService.sendPasswordResetEmail(to, data);
        break;
      case 'custom':
        emailSent = await emailService.sendEmail({
          to,
          subject,
          html,
          text,
        });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    if (emailSent) {
      return NextResponse.json({ message: 'Email sent successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 