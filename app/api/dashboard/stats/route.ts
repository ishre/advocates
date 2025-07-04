import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import User from '@/lib/models/User';
import { getTenantId } from '@/lib/utils';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get the current user to determine tenant ID
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tenantId = getTenantId(currentUser);
    if (!tenantId) {
      return NextResponse.json({ error: 'Invalid tenant configuration' }, { status: 400 });
    }

    // Get stats for the tenant
    const [
      totalCases,
      activeCases,
      closedCases,
      pendingCases,
      totalClients,
      activeClients,
      inactiveClients,
      recentCases,
      upcomingHearings,
    ] = await Promise.all([
      // Total cases
      Case.countDocuments({ advocateId: tenantId }),
      
      // Active cases
      Case.countDocuments({ 
        advocateId: tenantId,
        status: 'active' 
      }),
      
      // Closed cases
      Case.countDocuments({ 
        advocateId: tenantId,
        status: 'closed' 
      }),
      
      // Pending cases
      Case.countDocuments({ 
        advocateId: tenantId,
        status: 'pending' 
      }),
      
      // Total clients
      User.countDocuments({ 
        advocateId: tenantId,
        roles: 'client' 
      }),
      
      // Active clients
      User.countDocuments({ 
        advocateId: tenantId,
        roles: 'client',
        isActive: true 
      }),
      
      // Inactive clients
      User.countDocuments({ 
        advocateId: tenantId,
        roles: 'client',
        isActive: false 
      }),
      
      // Recent cases (last 5)
      Case.find({ advocateId: tenantId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('caseNumber title status createdAt')
        .lean(),
      
      // Upcoming hearings (next 7 days)
      Case.find({
        advocateId: tenantId,
        nextHearingDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        status: { $in: ['active', 'pending'] }
      })
        .sort({ nextHearingDate: 1 })
        .limit(5)
        .select('caseNumber title nextHearingDate courtName')
        .lean(),
    ]);

    // Calculate financial stats
    const financialStats = await Case.aggregate([
      { $match: { advocateId: tenantId } },
      {
        $group: {
          _id: null,
          totalFees: { $sum: '$fees.totalAmount' },
          totalPaid: { $sum: '$fees.paidAmount' },
          totalPending: { $sum: '$fees.pendingAmount' },
        }
      }
    ]);

    const stats = {
      cases: {
        total: totalCases,
        active: activeCases,
        closed: closedCases,
        pending: pendingCases,
      },
      clients: {
        total: totalClients,
        active: activeClients,
        inactive: inactiveClients,
      },
      financial: financialStats[0] || {
        totalFees: 0,
        totalPaid: 0,
        totalPending: 0,
      },
      recent: recentCases,
      upcoming: upcomingHearings,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
} 