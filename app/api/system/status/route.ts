import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
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

    // Check email service configuration
    const emailServiceConfigured = !!(
      process.env.EMAIL_HOST && 
      process.env.EMAIL_PORT && 
      process.env.EMAIL_USER && 
      process.env.EMAIL_PASS
    );

    return NextResponse.json({
      mongodb: mongodbStatus,
      emailService: emailServiceConfigured,
    });
  } catch (error) {
    console.error('Error checking system status:', error);
    return NextResponse.json(
      { error: 'Failed to check system status' },
      { status: 500 }
    );
  }
} 