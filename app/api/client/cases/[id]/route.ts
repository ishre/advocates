import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import User from '@/lib/models/User';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: caseId } = await params;
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

    // Find the case by ID and ensure it belongs to this client
    const caseDoc = await Case.findById(caseId)
      .populate('advocateId', 'name email image profileImagePath')
      .lean() as any;

    if (!caseDoc || String(caseDoc.clientId) !== String(clientUser._id)) {
      return NextResponse.json({ error: 'Case not found or access denied' }, { status: 404 });
    }

    // Format the response
    const formattedCase = {
      _id: caseDoc._id,
      caseNumber: caseDoc.caseNumber,
      title: caseDoc.title,
      description: caseDoc.description,
      status: caseDoc.status,
      priority: caseDoc.priority,
      nextHearingDate: caseDoc.nextHearingDate,
      courtName: caseDoc.courtName,
      advocate: caseDoc.advocateId
        ? {
            name: caseDoc.advocateId.name,
            email: caseDoc.advocateId.email,
            image: caseDoc.advocateId.image || caseDoc.advocateId.profileImagePath,
          }
        : null,
      documents: caseDoc.documents || [],
      caseType: caseDoc.caseType,
      filingDate: caseDoc.filingDate,
      stage: caseDoc.stage,
      particulars: caseDoc.particulars,
      year: caseDoc.year,
    };

    return NextResponse.json({ case: formattedCase });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch case details' },
      { status: 500 }
    );
  }
} 