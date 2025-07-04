# Email Configuration Setup

This guide will help you set up email notifications for the Lexapro Case Manager.

## Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Email Configuration (choose one set)
# Option 1: Using EMAIL_ prefix
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_SECURE=false

# Option 2: Using SMTP_ prefix (alternative)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
```

## Popular Email Providers

### Gmail
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_SECURE=false
```
**Note:** For Gmail, you need to use an App Password, not your regular password.

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_SECURE=false
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
EMAIL_SECURE=false
```

### Custom SMTP Server
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASS=your-password
EMAIL_SECURE=false
```

## Testing Email Configuration

1. Start your development server
2. Make sure you're logged in to the application
3. Send a POST request to `/api/test-email` with your email address:

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

Or use the browser console:
```javascript
fetch('/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to: 'your-email@example.com' })
})
.then(res => res.json())
.then(console.log);
```

## Troubleshooting

### Common Issues

1. **Connection Refused (ECONNREFUSED)**
   - Check if the SMTP host and port are correct
   - Verify your firewall settings
   - Try using port 465 with `EMAIL_SECURE=true`

2. **Authentication Failed**
   - For Gmail: Use an App Password, not your regular password
   - Enable "Less secure app access" (not recommended for production)
   - Check if 2FA is enabled and use App Passwords

3. **Email Not Sending**
   - Check the browser console for error messages
   - Verify all environment variables are set
   - Test with the `/api/test-email` endpoint

### Gmail App Password Setup

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled
4. Go to App passwords
5. Generate a new app password for "Mail"
6. Use this password in your `EMAIL_PASS` environment variable

## Production Considerations

For production environments:

1. Use a dedicated email service like SendGrid, Mailgun, or AWS SES
2. Set up proper SPF, DKIM, and DMARC records
3. Use environment-specific configuration
4. Monitor email delivery rates and bounces
5. Implement email templates and branding

## Email Templates

The application includes professional HTML email templates for:
- Client welcome emails (with advocate details)
- Document upload notifications
- Document deletion notifications
- Case updates
- Hearing reminders
- Password reset emails

All emails include:
- Professional branding
- Advocate contact information
- Responsive design
- Fallback text versions 