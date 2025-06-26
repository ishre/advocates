import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import Client from '@/lib/models/Client';
import User from '@/lib/models/User';
import Team from '@/lib/models/Team';
import fs from 'fs';
import path from 'path';

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

    // Get the backup file from request body
    const { backupFile } = await request.json();
    
    if (!backupFile) {
      return NextResponse.json(
        { error: 'Backup file is required' },
        { status: 400 }
      );
    }

    // Read the backup file
    const backupDir = path.join(process.cwd(), 'backups');
    const backupPath = path.join(backupDir, backupFile);
    
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json(
        { error: 'Backup file not found' },
        { status: 404 }
      );
    }

    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    // Clear existing data (but preserve the current user)
    const currentUserEmail = session.user.email;
    
    await Promise.all([
      Case.deleteMany({}),
      Client.deleteMany({}),
      Team.deleteMany({}),
    ]);

    // Don't delete users to avoid losing authentication
    // Instead, update existing users with backup data
    if (backupData.users && backupData.users.length > 0) {
      for (const userData of backupData.users) {
        // Skip if this is the current user to avoid breaking authentication
        if (userData.email === currentUserEmail) {
          continue;
        }
        
        // Update or create user
        await User.findOneAndUpdate(
          { email: userData.email },
          userData,
          { upsert: true, new: true }
        );
      }
    }

    // Restore other data
    if (backupData.cases && backupData.cases.length > 0) {
      await Case.insertMany(backupData.cases);
    }
    
    if (backupData.clients && backupData.clients.length > 0) {
      await Client.insertMany(backupData.clients);
    }
    
    if (backupData.teams && backupData.teams.length > 0) {
      await Team.insertMany(backupData.teams);
    }

    return NextResponse.json({
      message: 'Data restored successfully',
      backupFile,
      restoredItems: {
        cases: backupData.cases?.length || 0,
        clients: backupData.clients?.length || 0,
        users: backupData.users?.length || 0,
        teams: backupData.teams?.length || 0,
      }
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
} 