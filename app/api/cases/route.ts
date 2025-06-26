import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import Client from '@/lib/models/Client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const caseType = searchParams.get('caseType');
    const search = searchParams.get('search');

    const query: any = {};

    if (status) query.status = status;
    if (caseType) query.caseType = caseType;
    if (search) {
      query.$or = [
        { caseNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [cases, total] = await Promise.all([
      Case.find(query)
        .populate('clientId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Case.countDocuments(query),
    ]);

    return NextResponse.json({
      cases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
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
      caseNumber,
      title,
      description,
      caseType,
      priority,
      courtName,
      courtLocation,
      judgeName,
      opposingParty,
      opposingLawyer,
      filingDate,
      nextHearingDate,
      deadlineDate,
      clientId,
      fees,
    } = body;

    // Validate required fields
    if (!caseNumber || !title || !caseType || !clientId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if case number already exists
    const existingCase = await Case.findOne({ caseNumber });
    if (existingCase) {
      return NextResponse.json(
        { error: 'Case number already exists' },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Create new case
    const newCase = new Case({
      caseNumber,
      title,
      description,
      caseType,
      priority,
      courtName,
      courtLocation,
      judgeName,
      opposingParty,
      opposingLawyer,
      filingDate: filingDate ? new Date(filingDate) : undefined,
      nextHearingDate: nextHearingDate ? new Date(nextHearingDate) : undefined,
      deadlineDate: deadlineDate ? new Date(deadlineDate) : undefined,
      clientId,
      fees: {
        totalAmount: fees?.totalAmount || 0,
        paidAmount: fees?.paidAmount || 0,
        pendingAmount: (fees?.totalAmount || 0) - (fees?.paidAmount || 0),
        currency: fees?.currency || 'USD',
      },
      status: 'active',
      createdBy: session.user.email,
    });

    await newCase.save();

    // Populate client information
    await newCase.populate('clientId', 'name email phone');

    return NextResponse.json({
      message: 'Case created successfully',
      case: newCase,
    });
  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    );
  }
} 