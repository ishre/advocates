import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import Client from '@/lib/models/Client';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
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

    // Calculate statistics based on user role
    let caseQuery = {};
    let clientQuery = {};

    if (user.roles.includes('advocate')) {
      // Advocate can see all cases and clients
      caseQuery = {};
      clientQuery = {};
    } else {
      // Team members can only see assigned cases and clients
      caseQuery = { assignedTo: user._id };
      clientQuery = { assignedTo: user._id };
    }

    // Get case statistics
    const [
      totalCases,
      activeCases,
      closedCases,
      totalClients,
      activeClients,
      casesWithFees,
      upcomingHearings,
      overdueTasks,
      completedTasks
    ] = await Promise.all([
      Case.countDocuments(caseQuery),
      Case.countDocuments({ ...caseQuery, status: 'active' }),
      Case.countDocuments({ ...caseQuery, status: 'closed' }),
      Client.countDocuments(clientQuery),
      Client.countDocuments({ ...clientQuery, status: 'active' }),
      Case.find(caseQuery).select('fees'),
      Case.countDocuments({
        ...caseQuery,
        nextHearingDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
        }
      }),
      Case.countDocuments({
        ...caseQuery,
        'tasks.status': 'overdue'
      }),
      Case.countDocuments({
        ...caseQuery,
        'tasks.status': 'completed'
      })
    ]);

    // Calculate total revenue and pending fees
    const totalRevenue = casesWithFees.reduce((sum, case_) => {
      return sum + (case_.fees?.totalAmount || 0);
    }, 0);

    const pendingFees = casesWithFees.reduce((sum, case_) => {
      return sum + (case_.fees?.pendingAmount || 0);
    }, 0);

    const stats = {
      totalCases,
      activeCases,
      closedCases,
      totalClients,
      activeClients,
      totalRevenue,
      pendingFees,
      upcomingHearings,
      overdueTasks,
      completedTasks,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 