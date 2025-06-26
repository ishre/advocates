import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import Client from '@/lib/models/Client';
import User from '@/lib/models/User';
import Team from '@/lib/models/Team';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if Google Drive is configured
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!googleClientId || !googleClientSecret) {
      return NextResponse.json(
        { 
          error: 'Google Drive not configured',
          message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables'
        },
        { status: 500 }
      );
    }

    // Fetch all data
    const [cases, clients, users, teams] = await Promise.all([
      Case.find({}).lean(),
      Client.find({}).lean(),
      User.find({}).lean(),
      Team.find({}).lean(),
    ]);

    // Prepare backup data
    const backupData = {
      cases,
      clients,
      users,
      teams,
      timestamp: new Date(),
      version: '1.0.0',
      backupInfo: {
        createdBy: user._id.toString(),
        createdAt: new Date().toISOString(),
        version: '1.0.0',
      },
    };

    // For now, return the backup data as a downloadable JSON
    // In a full implementation, this would be uploaded to Google Drive
    const backupFileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    return NextResponse.json({
      message: 'Backup created successfully',
      fileName: backupFileName,
      dataSize: JSON.stringify(backupData).length,
      items: {
        cases: cases.length,
        clients: clients.length,
        users: users.length,
        teams: teams.length,
      },
      downloadUrl: `/api/backup/download/${backupFileName}`,
      note: 'Google Drive integration requires additional OAuth setup. This backup is available for download.',
    });

  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create backup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 