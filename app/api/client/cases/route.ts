import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get the current user (client)
    const clientUser = await User.findOne({ email: session.user.email, roles: 'client' });
    if (!clientUser) {
      return NextResponse.json({ error: 'User not found or not a client' }, { status: 404 });
    }

    // Find all cases for this client
    const cases = await Case.find({ clientId: clientUser._id })
      .populate('advocateId', 'name email')
      .lean();

    // Format the response to include advocate name and documents
    const formattedCases = cases.map(c => ({
      _id: c._id,
      caseNumber: c.caseNumber,
      title: c.title,
      status: c.status,
      priority: c.priority,
      nextHearingDate: c.nextHearingDate,
      courtName: c.courtName,
      advocate: c.advocateId ? {
        name: c.advocateId.name,
        email: c.advocateId.email,
      } : null,
      documents: c.documents || [],
    }));

    return NextResponse.json({ cases: formattedCases });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch client cases' },
      { status: 500 }
    );
  }
} 