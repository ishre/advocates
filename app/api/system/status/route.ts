import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check MongoDB connection
    let mongodbStatus = false;
    try {
      await connectToDatabase();
      mongodbStatus = true;
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      mongodbStatus = false;
    }

    // Check Google Drive configuration
    const googleDriveConfigured = !!(
      process.env.GOOGLE_CLIENT_ID && 
      process.env.GOOGLE_CLIENT_SECRET && 
      process.env.GOOGLE_REDIRECT_URI
    );

    // Check email service configuration
    const emailServiceConfigured = !!(
      process.env.EMAIL_HOST && 
      process.env.EMAIL_PORT && 
      process.env.EMAIL_USER && 
      process.env.EMAIL_PASS
    );

    // Get last backup date from available backups
    let lastBackupDate = null;
    try {
      const fs = require('fs');
      const path = require('path');
      const backupDir = path.join(process.cwd(), 'backups');
      
      if (fs.existsSync(backupDir)) {
        const files = fs.readdirSync(backupDir);
        const backupFiles = files
          .filter((file: string) => file.endsWith('.json'))
          .map((file: string) => {
            const filePath = path.join(backupDir, file);
            const stats = fs.statSync(filePath);
            return {
              filename: file,
              createdAt: stats.birthtime,
            };
          })
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (backupFiles.length > 0) {
          lastBackupDate = backupFiles[0].createdAt;
        }
      }
    } catch (error) {
      console.error('Error getting last backup date:', error);
    }

    return NextResponse.json({
      mongodb: mongodbStatus,
      googleDrive: googleDriveConfigured,
      emailService: emailServiceConfigured,
      lastBackup: lastBackupDate,
    });
  } catch (error) {
    console.error('Error checking system status:', error);
    return NextResponse.json(
      { error: 'Failed to check system status' },
      { status: 500 }
    );
  }
} 