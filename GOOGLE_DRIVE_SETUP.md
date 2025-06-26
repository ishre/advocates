# 🔧 Google Drive Backup Setup Guide

## Current Status

The backup system is currently working with **local JSON downloads**. To enable full Google Drive integration, follow the steps below.

## 🚀 Quick Setup (Current Working Version)

### What Works Now:
✅ **Create Backup** - Downloads JSON file with all data  
✅ **Download Backup** - Save backup to your computer  
✅ **Data Export** - Complete export of cases, clients, users, teams  

### How to Use Current Backup:
1. Click **"Backup"** button in dashboard
2. Click **"Download Backup"** to save JSON file
3. Store the JSON file securely (Google Drive, Dropbox, etc.)

## 🔄 Full Google Drive Integration Setup

### Step 1: Google Cloud Console Configuration

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing one
3. **Enable APIs**:
   - Go to "APIs & Services" > "Library"
   - Search and enable:
     - **Google Drive API**
     - **Gmail API** (for email integration)

### Step 2: Create OAuth 2.0 Credentials

1. **Go to "APIs & Services" > "Credentials"**
2. **Click "Create Credentials" > "OAuth 2.0 Client IDs"**
3. **Configure OAuth consent screen**:
   ```
   User Type: External
   App name: Legal Case Manager
   User support email: your-email@gmail.com
   Developer contact information: your-email@gmail.com
   ```

4. **Add scopes**:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

5. **Create OAuth 2.0 Client ID**:
   ```
   Application type: Web application
   Name: Legal Case Manager Web Client
   Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google
   - http://localhost:3000/api/auth/callback/google-drive
   ```

6. **Copy credentials**:
   - Client ID
   - Client Secret

### Step 3: Environment Variables

Add to your `.env.local`:

```env
# Google OAuth (for authentication)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Drive (for backup) - Use same credentials
GOOGLE_DRIVE_CLIENT_ID=your-google-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### Step 4: Enable Full Google Drive Integration

To enable automatic Google Drive uploads, you'll need to:

1. **Set up OAuth flow** for Google Drive
2. **Store refresh tokens** securely
3. **Implement automatic upload** to Google Drive

## 🔧 Advanced Google Drive Setup

### Option 1: Service Account (Recommended for Production)

1. **Create Service Account**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Download JSON key file

2. **Share Google Drive folder** with service account email

3. **Use service account credentials** in environment variables

### Option 2: OAuth 2.0 with Refresh Tokens

1. **Implement OAuth flow** for Google Drive
2. **Store refresh tokens** in database
3. **Use refresh tokens** for automatic backups

## 📁 Backup File Structure

The backup JSON file contains:

```json
{
  "cases": [...],
  "clients": [...],
  "users": [...],
  "teams": [...],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "backupInfo": {
    "createdBy": "user-id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

## 🔒 Security Considerations

1. **Never commit credentials** to version control
2. **Use environment variables** for all secrets
3. **Limit OAuth scopes** to minimum required
4. **Regularly rotate** credentials
5. **Use service accounts** for production

## 🚨 Troubleshooting

### Common Issues:

1. **"Google Drive not configured"**
   - Check environment variables
   - Verify Google Cloud Console setup

2. **"OAuth consent screen" errors**
   - Add your domain to authorized domains
   - Verify scopes are added

3. **"API not enabled" errors**
   - Enable Google Drive API in Google Cloud Console

4. **"Redirect URI mismatch"**
   - Check redirect URIs in OAuth credentials
   - Ensure exact match with environment variables

### Debug Mode:

Add to `.env.local`:
```env
DEBUG=next-auth:*
NODE_ENV=development
```

## 📋 Testing Checklist

- [ ] Google Cloud Console project created
- [ ] Google Drive API enabled
- [ ] OAuth 2.0 credentials created
- [ ] Environment variables configured
- [ ] Backup button works
- [ ] Download backup works
- [ ] Backup file contains all data

## 🔄 Next Steps

1. **Test current backup system** (JSON download)
2. **Set up Google Cloud Console** if needed
3. **Configure environment variables**
4. **Test full Google Drive integration**
5. **Deploy to production**

## 💡 Alternative Backup Solutions

If Google Drive integration is complex, consider:

1. **Local file system** backups
2. **Cloud storage** (AWS S3, Azure Blob)
3. **Database dumps** (MongoDB Atlas backups)
4. **Email backups** (send backup files via email)

## 🆘 Support

For issues with Google Drive setup:
1. Check Google Cloud Console documentation
2. Verify all environment variables
3. Test OAuth flow step by step
4. Create issue in repository with error details

---

**Current Status**: ✅ Working with JSON downloads  
**Next Goal**: 🔄 Full Google Drive integration 