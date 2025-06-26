# 🏛️ Legal Case Manager

A comprehensive Next.js SaaS application for legal case management with MongoDB, Google Drive backup, and Gmail integration.

## ✨ Features

### 🔐 Authentication & Security
- **NextAuth.js** with Google OAuth and credentials providers
- **Multi-role support** (Advocate, Team Member)
- **Password reset** functionality
- **Session management** with secure tokens

### 📊 Dashboard & Analytics
- **Real-time statistics** (cases, clients, revenue, hearings)
- **Beautiful black & white UI** using shadcn/ui
- **Responsive design** for all devices
- **Role-based access control**

### 📁 Case Management
- **Comprehensive case tracking** with detailed information
- **Document management** with file uploads
- **Task management** with deadlines and priorities
- **Notes and updates** system
- **Court information** tracking
- **Financial tracking** (fees, payments, pending amounts)

### 👥 Client Management
- **Complete client profiles** with contact information
- **Case history** tracking
- **Communication preferences**
- **Emergency contacts**
- **Document storage**

### 📅 Calendar & Scheduling
- **Hearing scheduling** and reminders
- **Deadline tracking**
- **Court appearance management**
- **Email notifications**

### ☁️ Google Drive Integration
- **Automatic daily backups** to Google Drive
- **Data restoration** functionality
- **Backup history** management
- **Secure OAuth2 authentication**

### 📧 Email Integration
- **Gmail SMTP** integration with app passwords
- **Automated notifications** for:
  - Case updates
  - Hearing reminders
  - Document uploads
  - Client welcome emails
  - Password reset emails
- **Professional email templates**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Google Cloud Console project
- Gmail account with app password

### 1. Clone and Install

```bash
git clone <repository-url>
cd advocate
npm install
```

### 2. Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/advocate-app

# NextAuth
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

### 3. Google Cloud Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable APIs**
   - Google Drive API
   - Gmail API
   - Google+ API

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google-drive`

4. **Configure Consent Screen**
   - Add your domain
   - Add required scopes:
     - `https://www.googleapis.com/auth/drive.file`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`

### 4. Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
3. **Use the generated password** in `EMAIL_PASS`

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📋 Usage Guide

### First Time Setup

1. **Sign Up/In**: Use Google OAuth or create a credentials account
2. **Create Sample Data**: Click "Sample Data" button to populate the dashboard
3. **Configure Backup**: Set up Google Drive integration for automatic backups
4. **Test Email**: Send test emails to verify Gmail integration

### Daily Operations

1. **Dashboard Overview**: Monitor key metrics and recent activities
2. **Case Management**: Create, update, and track legal cases
3. **Client Management**: Manage client relationships and information
4. **Document Upload**: Upload and organize case documents
5. **Task Management**: Create and track case-related tasks
6. **Hearing Scheduling**: Schedule and manage court appearances
7. **Email Communications**: Send professional emails to clients

### Backup & Restore

- **Automatic Backups**: Data is automatically backed up to Google Drive
- **Manual Backup**: Click "Backup" button for immediate backup
- **Restore**: Click "Restore" to restore from the latest backup
- **Backup History**: View all previous backups in Google Drive

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **NextAuth.js** for authentication

### Backend
- **Next.js API Routes** for server-side logic
- **MongoDB** with Mongoose ODM
- **Google APIs** for Drive and Gmail integration
- **Nodemailer** for email functionality

### Database Models
- **User**: Authentication and role management
- **Case**: Comprehensive case information
- **Client**: Client profiles and relationships
- **Team**: Team management and collaboration

## 🔧 Development

### Project Structure
```
advocate/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── layouts/          # Layout components
├── lib/                  # Utility libraries
│   ├── models/           # MongoDB models
│   ├── auth.ts           # NextAuth configuration
│   ├── mongodb.ts        # Database connection
│   ├── google-drive.ts   # Google Drive service
│   └── email-service.ts  # Email service
└── types/                # TypeScript type definitions
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Adding New Features

1. **Create API Route**: Add new route in `app/api/`
2. **Update Models**: Modify or create new models in `lib/models/`
3. **Add Components**: Create reusable components in `components/`
4. **Update Types**: Add TypeScript types in `types/`

## 🔒 Security Considerations

- **Environment Variables**: Never commit sensitive data
- **OAuth Scopes**: Use minimal required scopes
- **Database Security**: Use MongoDB Atlas with proper access controls
- **Email Security**: Use app passwords, not regular passwords
- **HTTPS**: Always use HTTPS in production

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add all environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically deploy on push to main branch

### Other Platforms

- **Netlify**: Similar to Vercel setup
- **Railway**: Good for full-stack applications
- **DigitalOcean**: Manual deployment with Docker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the code comments

## 🔄 Updates

Stay updated with the latest features and security patches by:
- Following the repository
- Checking release notes
- Updating dependencies regularly

---

**Built with ❤️ for the legal community**
