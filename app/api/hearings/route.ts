import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import User from '@/lib/models/User';
import { getTenantId } from '@/lib/utils';

// Define Hearing type
interface Hearing {
  id: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  clientName: string;
  hearingType: string;
  dateTime: Date | string;
  duration: number;
  courtRoom?: string;
  judgeName?: string;
  description?: string;
  attendees?: string[];
  notes?: string;
  status: string;
  createdBy: string;
  createdAt: Date;
}

const hearings: Hearing[] = [];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const date = searchParams.get('date');

    let filteredHearings: Hearing[] = hearings;

    if (caseId) {
      filteredHearings = filteredHearings.filter((h: Hearing) => h.caseId === caseId);
    }

    if (date) {
      const targetDate = new Date(date);
      filteredHearings = filteredHearings.filter((h: Hearing) => {
        const hearingDate = new Date(h.dateTime);
        return hearingDate.toDateString() === targetDate.toDateString();
      });
    }

    // Sort by date
    filteredHearings.sort((a: Hearing, b: Hearing) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    return NextResponse.json({
      hearings: filteredHearings,
    });
  } catch (error) {
    console.error('Error fetching hearings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hearings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      caseId,
      hearingType,
      dateTime,
      duration,
      courtRoom,
      judgeName,
      description,
      attendees,
      notes,
    } = body;

    // Validate required fields
    if (!caseId || !hearingType || !dateTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify case exists and belongs to the tenant
    const caseItem = await Case.findOne({ _id: caseId, advocateId: tenantId }).populate('clientId', 'name email');
    if (!caseItem) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Create new hearing
    const newHearing = {
      id: Date.now().toString(),
      caseId,
      caseNumber: caseItem.caseNumber,
      caseTitle: caseItem.title,
      clientName: caseItem.clientId.name,
      hearingType,
      dateTime: new Date(dateTime),
      duration: parseInt(duration) || 60,
      courtRoom,
      judgeName,
      description,
      attendees,
      notes,
      status: 'scheduled',
      createdBy: session.user.email,
      createdAt: new Date(),
    };

    hearings.push(newHearing);

    return NextResponse.json({
      message: 'Hearing scheduled successfully',
      hearing: newHearing,
    });
  } catch (error) {
    console.error('Error scheduling hearing:', error);
    return NextResponse.json(
      { error: 'Failed to schedule hearing' },
      { status: 500 }
    );
  }
} 