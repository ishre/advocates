# 🛠️ Setup Guide

## Environment Variables Configuration

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/advocate-app

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Drive (for backup)
GOOGLE_DRIVE_CLIENT_ID=your-google-drive-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-google-drive-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Gmail SMTP (for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
```

## Step-by-Step Setup

### 1. MongoDB Setup

1. **Create MongoDB Atlas Account** (recommended)
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account
   - Create a new cluster
   - Get your connection string

2. **Local MongoDB** (alternative)
   - Install MongoDB locally
   - Use connection string: `mongodb://localhost:27017/advocate-app`

### 2. Google Cloud Console Setup

1. **Create Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

2. **Enable APIs**
   - Go to "APIs & Services" > "Library"
   - Enable these APIs:
     - Google Drive API
     - Gmail API
     - Google+ API

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google-drive`

4. **Configure Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - User Type: "External"
   - Add your domain
   - Add scopes:
     - `https://www.googleapis.com/auth/drive.file`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`

### 3. Gmail App Password Setup

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Security > 2-Step Verification
   - Enable 2FA if not already enabled

2. **Generate App Password**
   - Go to Security > 2-Step Verification > App passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Legal Case Manager"
   - Copy the generated 16-character password

3. **Use in Environment**
   - Set `EMAIL_PASS` to the generated app password
   - Set `EMAIL_USER` to your Gmail address

### 4. Generate NEXTAUTH_SECRET

```bash
# Generate a secure secret
openssl rand -base64 32
```

Or use an online generator and copy the result to `NEXTAUTH_SECRET`.

## Testing Your Setup

### 1. Test Database Connection

```bash
npm run dev
```

Check the console for MongoDB connection messages.

### 2. Test Authentication

1. Visit `http://localhost:3000`
2. Try signing in with Google
3. Check if user is created in MongoDB

### 3. Test Sample Data

1. Sign in to the dashboard
2. Click "Sample Data" button
3. Verify data appears in dashboard

### 4. Test Email (Optional)

```bash
# Test email configuration
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "custom",
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "This is a test email from Legal Case Manager"
  }'
```

### 5. Test Google Drive (Optional)

1. Click "Backup" button in dashboard
2. Check your Google Drive for backup folder
3. Verify backup files are created

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check connection string format
   - Verify network access (IP whitelist for Atlas)
   - Check username/password

2. **Google OAuth Error**
   - Verify redirect URIs match exactly
   - Check client ID and secret
   - Ensure APIs are enabled

3. **Email Not Sending**
   - Verify app password (not regular password)
   - Check Gmail account settings
   - Ensure 2FA is enabled

4. **Google Drive Backup Fails**
   - Check OAuth consent screen configuration
   - Verify Drive API is enabled
   - Check scopes are added

### Debug Mode

Add to `.env.local`:
```env
DEBUG=next-auth:*
NODE_ENV=development
```

### Production Deployment

For production, update these variables:
```env
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/callback/google
```

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use strong secrets** for NEXTAUTH_SECRET
3. **Limit OAuth scopes** to minimum required
4. **Use app passwords** for email, not regular passwords
5. **Enable HTTPS** in production
6. **Regularly rotate** secrets and passwords

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Test each service individually
4. Create an issue in the repository with error details 