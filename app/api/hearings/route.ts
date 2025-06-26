import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Case from '@/lib/models/Case';

// Simple in-memory storage for hearings (in production, you'd use a proper database model)
let hearings: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const date = searchParams.get('date');

    let filteredHearings = hearings;

    if (caseId) {
      filteredHearings = filteredHearings.filter(h => h.caseId === caseId);
    }

    if (date) {
      const targetDate = new Date(date);
      filteredHearings = filteredHearings.filter(h => {
        const hearingDate = new Date(h.dateTime);
        return hearingDate.toDateString() === targetDate.toDateString();
      });
    }

    // Sort by date
    filteredHearings.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

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

    // Verify case exists
    const caseItem = await Case.findById(caseId).populate('clientId', 'name email');
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