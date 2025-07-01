import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromAddress: string;

  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransport(config);
    this.fromAddress = config.auth.user;
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }

  // Send email
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.fromAddress,
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        cc: emailData.cc ? (Array.isArray(emailData.cc) ? emailData.cc.join(', ') : emailData.cc) : undefined,
        bcc: emailData.bcc ? (Array.isArray(emailData.bcc) ? emailData.bcc.join(', ') : emailData.bcc) : undefined,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        attachments: emailData.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Send case update notification
  async sendCaseUpdateNotification(
    to: string,
    caseData: {
      caseNumber: string;
      title: string;
      status: string;
      nextHearingDate?: Date;
      updates: string[];
    }
  ): Promise<boolean> {
    const subject = `Case Update: ${caseData.caseNumber} - ${caseData.title}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Legal Case Manager</h1>
          <p style="margin: 10px 0 0 0;">Case Update Notification</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0;">Case Update</h2>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">Case Details</h3>
            <p><strong>Case Number:</strong> ${caseData.caseNumber}</p>
            <p><strong>Title:</strong> ${caseData.title}</p>
            <p><strong>Status:</strong> <span style="color: #059669;">${caseData.status}</span></p>
            ${caseData.nextHearingDate ? `<p><strong>Next Hearing:</strong> ${new Date(caseData.nextHearingDate).toLocaleDateString()}</p>` : ''}
          </div>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">Recent Updates</h3>
            <ul style="margin: 0; padding-left: 20px;">
              ${caseData.updates.map(update => `<li style="margin-bottom: 8px;">${update}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">This is an automated notification from Legal Case Manager</p>
        </div>
      </div>
    `;

    const text = `
Case Update: ${caseData.caseNumber} - ${caseData.title}

Case Details:
- Case Number: ${caseData.caseNumber}
- Title: ${caseData.title}
- Status: ${caseData.status}
${caseData.nextHearingDate ? `- Next Hearing: ${new Date(caseData.nextHearingDate).toLocaleDateString()}` : ''}

Recent Updates:
${caseData.updates.map(update => `- ${update}`).join('\n')}

This is an automated notification from Legal Case Manager.
    `;

    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  // Send client welcome email
  async sendClientWelcomeEmail(
    to: string,
    clientData: {
      name: string;
      caseNumber: string;
      caseTitle: string;
    }
  ): Promise<boolean> {
    const subject = `Welcome to Legal Case Manager - Case ${clientData.caseNumber}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Legal Case Manager</h1>
          <p style="margin: 10px 0 0 0;">Welcome to Our Legal Services</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0;">Welcome, ${clientData.name}!</h2>
          
          <p>Thank you for choosing our legal services. We're committed to providing you with the best possible representation and keeping you informed every step of the way.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Your Case Information</h3>
            <p><strong>Case Number:</strong> ${clientData.caseNumber}</p>
            <p><strong>Case Title:</strong> ${clientData.caseTitle}</p>
          </div>
          
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin-top: 0;">What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>We'll review your case details thoroughly</li>
              <li>You'll receive regular updates on case progress</li>
              <li>Important documents will be shared securely</li>
              <li>We're available for any questions you may have</li>
            </ul>
          </div>
        </div>
        
        <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Thank you for trusting us with your legal matters</p>
        </div>
      </div>
    `;

    const text = `
Welcome to Legal Case Manager - Case ${clientData.caseNumber}

Dear ${clientData.name},

Thank you for choosing our legal services. We're committed to providing you with the best possible representation and keeping you informed every step of the way.

Your Case Information:
- Case Number: ${clientData.caseNumber}
- Case Title: ${clientData.caseTitle}

What's Next?
- We'll review your case details thoroughly
- You'll receive regular updates on case progress
- Important documents will be shared securely
- We're available for any questions you may have

Thank you for trusting us with your legal matters.
    `;

    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  // Send hearing reminder
  async sendHearingReminder(
    to: string,
    hearingData: {
      caseNumber: string;
      caseTitle: string;
      hearingDate: Date;
      courtName: string;
      courtLocation: string;
      hearingType: string;
    }
  ): Promise<boolean> {
    const subject = `Hearing Reminder: ${hearingData.caseNumber} - ${new Date(hearingData.hearingDate).toLocaleDateString()}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Legal Case Manager</h1>
          <p style="margin: 10px 0 0 0;">Hearing Reminder</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0;">Upcoming Hearing</h2>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 20px;">
            <h3 style="color: #dc2626; margin-top: 0;">Important Reminder</h3>
            <p style="margin: 0;">You have an upcoming hearing scheduled. Please ensure all necessary documents are prepared.</p>
          </div>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">Hearing Details</h3>
            <p><strong>Case Number:</strong> ${hearingData.caseNumber}</p>
            <p><strong>Case Title:</strong> ${hearingData.caseTitle}</p>
            <p><strong>Hearing Date:</strong> <span style="color: #dc2626; font-weight: bold;">${new Date(hearingData.hearingDate).toLocaleDateString()}</span></p>
            <p><strong>Hearing Time:</strong> <span style="color: #dc2626; font-weight: bold;">${new Date(hearingData.hearingDate).toLocaleTimeString()}</span></p>
            <p><strong>Court:</strong> ${hearingData.courtName}</p>
            <p><strong>Location:</strong> ${hearingData.courtLocation}</p>
            <p><strong>Type:</strong> ${hearingData.hearingType}</p>
          </div>
        </div>
        
        <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Please contact us if you have any questions or need assistance</p>
        </div>
      </div>
    `;

    const text = `
Hearing Reminder: ${hearingData.caseNumber} - ${new Date(hearingData.hearingDate).toLocaleDateString()}

Important Reminder: You have an upcoming hearing scheduled. Please ensure all necessary documents are prepared.

Hearing Details:
- Case Number: ${hearingData.caseNumber}
- Case Title: ${hearingData.caseTitle}
- Hearing Date: ${new Date(hearingData.hearingDate).toLocaleDateString()}
- Hearing Time: ${new Date(hearingData.hearingDate).toLocaleTimeString()}
- Court: ${hearingData.courtName}
- Location: ${hearingData.courtLocation}
- Type: ${hearingData.hearingType}

Please contact us if you have any questions or need assistance.
    `;

    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  // Send document notification
  async sendDocumentNotification(
    to: string,
    documentData: {
      caseNumber: string;
      caseTitle: string;
      documentName: string;
      documentType: string;
      uploadedBy: string;
      uploadedAt: Date;
    }
  ): Promise<boolean> {
    const subject = `New Document: ${documentData.documentName} - Case ${documentData.caseNumber}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Legal Case Manager</h1>
          <p style="margin: 10px 0 0 0;">Document Notification</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0;">New Document Available</h2>
          
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #059669; margin-bottom: 20px;">
            <h3 style="color: #059669; margin-top: 0;">Document Uploaded</h3>
            <p style="margin: 0;">A new document has been uploaded to your case file.</p>
          </div>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">Document Details</h3>
            <p><strong>Case Number:</strong> ${documentData.caseNumber}</p>
            <p><strong>Case Title:</strong> ${documentData.caseTitle}</p>
            <p><strong>Document Name:</strong> ${documentData.documentName}</p>
            <p><strong>Document Type:</strong> ${documentData.documentType}</p>
            <p><strong>Uploaded By:</strong> ${documentData.uploadedBy}</p>
            <p><strong>Uploaded At:</strong> ${new Date(documentData.uploadedAt).toLocaleString()}</p>
          </div>
        </div>
        
        <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Please log in to your account to view the document</p>
        </div>
      </div>
    `;

    const text = `
New Document: ${documentData.documentName} - Case ${documentData.caseNumber}

Document Uploaded: A new document has been uploaded to your case file.

Document Details:
- Case Number: ${documentData.caseNumber}
- Case Title: ${documentData.caseTitle}
- Document Name: ${documentData.documentName}
- Document Type: ${documentData.documentType}
- Uploaded By: ${documentData.uploadedBy}
- Uploaded At: ${new Date(documentData.uploadedAt).toLocaleString()}

Please log in to your account to view the document.
    `;

    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(
    to: string,
    resetData: {
      name: string;
      resetToken: string;
      resetUrl: string;
    }
  ): Promise<boolean> {
    const subject = 'Password Reset Request - Legal Case Manager';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Legal Case Manager</h1>
          <p style="margin: 10px 0 0 0;">Password Reset Request</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0;">Hello, ${resetData.name}</h2>
          
          <p>We received a request to reset your password for your Legal Case Manager account.</p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Reset Your Password</h3>
            <p style="margin: 0;">Click the button below to reset your password. This link will expire in 1 hour.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetData.resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">Security Notice</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>For security, this link can only be used once</li>
            </ul>
          </div>
        </div>
        
        <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">If you have any questions, please contact our support team</p>
        </div>
      </div>
    `;

    const text = `
Password Reset Request - Legal Case Manager

Hello ${resetData.name},

We received a request to reset your password for your Legal Case Manager account.

Reset Your Password:
Click the link below to reset your password. This link will expire in 1 hour.

${resetData.resetUrl}

Security Notice:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- For security, this link can only be used once

If you have any questions, please contact our support team.
    `;

    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  // Send welcome email to new client
  async sendWelcomeEmail(
    to: string,
    welcomeData: {
      name: string;
      advocateName: string;
      advocateEmail: string;
      tempPassword: string;
    }
  ): Promise<boolean> {
    const subject = 'Welcome to Legal Case Manager - Your Client Account';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Legal Case Manager</h1>
          <p style="margin: 10px 0 0 0;">Welcome to Your Client Account</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0;">Hello, ${welcomeData.name}</h2>
          
          <p>Welcome to Legal Case Manager! Your client account has been created by ${welcomeData.advocateName}.</p>
          
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">Your Login Credentials</h3>
            <p style="margin: 0;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> ${welcomeData.tempPassword}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Important Security Notice</h3>
            <p style="margin: 0;">Please change your password immediately after your first login for security purposes.</p>
          </div>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">What You Can Do</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>View your case details and updates</li>
              <li>Access important documents</li>
              <li>Track hearing schedules</li>
              <li>Communicate with your advocate</li>
            </ul>
          </div>
        </div>
        
        <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">If you have any questions, please contact ${welcomeData.advocateName} at ${welcomeData.advocateEmail}</p>
        </div>
      </div>
    `;

    const text = `
Welcome to Legal Case Manager - Your Client Account

Hello ${welcomeData.name},

Welcome to Legal Case Manager! Your client account has been created by ${welcomeData.advocateName}.

Your Login Credentials:
- Email: ${to}
- Temporary Password: ${welcomeData.tempPassword}

Important Security Notice:
Please change your password immediately after your first login for security purposes.

What You Can Do:
- View your case details and updates
- Access important documents
- Track hearing schedules
- Communicate with your advocate

If you have any questions, please contact ${welcomeData.advocateName} at ${welcomeData.advocateEmail}
    `;

    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  // Send account deletion notification
  async sendAccountDeletionEmail(
    to: string,
    deletionData: {
      name: string;
      advocateName: string;
    }
  ): Promise<boolean> {
    const subject = 'Account Deletion Notice - Legal Case Manager';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Legal Case Manager</h1>
          <p style="margin: 10px 0 0 0;">Account Deletion Notice</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0;">Hello, ${deletionData.name}</h2>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <h3 style="color: #991b1b; margin-top: 0;">Account Deletion Notice</h3>
            <p style="margin: 0;">Your client account has been deleted by ${deletionData.advocateName} because all your cases have been closed.</p>
          </div>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">What This Means</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>You will no longer be able to access your account</li>
              <li>All your case data has been archived</li>
              <li>You can contact ${deletionData.advocateName} if you need any information</li>
            </ul>
          </div>
        </div>
        
        <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">If you have any questions, please contact ${deletionData.advocateName}</p>
        </div>
      </div>
    `;

    const text = `
Account Deletion Notice - Legal Case Manager

Hello ${deletionData.name},

Account Deletion Notice:
Your client account has been deleted by ${deletionData.advocateName} because all your cases have been closed.

What This Means:
- You will no longer be able to access your account
- All your case data has been archived
- You can contact ${deletionData.advocateName} if you need any information

If you have any questions, please contact ${deletionData.advocateName}
    `;

    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }
}

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(): EmailService | null {
  return emailService;
}

export function initializeEmailService(config: EmailConfig): EmailService {
  emailService = new EmailService(config);
  return emailService;
} 