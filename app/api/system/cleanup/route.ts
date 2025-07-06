import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cleanupOrphanedFiles, getStorageStats } from '@/lib/gcs-cleanup';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow advocates and admins to access cleanup functions
    const userRoles = session.user.roles || [];
    const roles = Array.isArray(userRoles) ? userRoles : [userRoles];
    const hasAccess = roles.some(role => role === 'advocate' || role === 'admin');
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Get storage statistics
      const stats = await getStorageStats();
      return NextResponse.json({
        message: 'Storage statistics retrieved successfully',
        stats,
      });
    } else if (action === 'cleanup') {
      // Clean up orphaned files
      const result = await cleanupOrphanedFiles();
      return NextResponse.json({
        message: 'Cleanup completed successfully',
        result,
      });
    } else {
      return NextResponse.json({
        error: 'Invalid action. Use "stats" or "cleanup"',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('System cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to perform system cleanup' },
      { status: 500 }
    );
  }
} 