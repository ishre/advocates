import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    const users = await User.find({}).select('-password -googleDriveToken -googleDriveRefreshToken -resetPasswordToken');
    
    return NextResponse.json({
      message: 'Users retrieved successfully',
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        googleDriveConnected: user.googleDriveConnected,
        hasPassword: !!user.password,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
      }))
    });
  } catch (error) {
    console.error('Test users error:', error);
    return NextResponse.json({
      message: 'Failed to retrieve users',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 