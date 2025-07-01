import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

export async function GET() {
  try {
    await dbConnect();
    
    return NextResponse.json({
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      status: 'ok'
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      status: 'error'
    }, { status: 500 });
  }
} 