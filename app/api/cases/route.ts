import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import User from '@/lib/models/User';
import { getTenantId } from '@/lib/utils';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const caseType = searchParams.get('caseType');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const clientId = searchParams.get('clientId');

    const query: Record<string, unknown> = {
      advocateId: tenantId, // Filter by tenant/advocate
    };

    // Handle status filter (comma-separated values)
    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      if (statusArray.length === 1) {
        query.status = statusArray[0];
      } else {
        query.status = { $in: statusArray };
      }
    }

    // Handle priority filter (comma-separated values)
    if (priority) {
      const priorityArray = priority.split(',').map(p => p.trim());
      if (priorityArray.length === 1) {
        query.priority = priorityArray[0];
      } else {
        query.priority = { $in: priorityArray };
      }
    }

    if (caseType) query.caseType = caseType;
    
    // Handle date range filters
    if (dateFrom || dateTo) {
      query.createdAt = {} as Record<string, Date>;
      if (dateFrom) {
        (query.createdAt as Record<string, Date>)["$gte"] = new Date(dateFrom);
      }
      if (dateTo) {
        (query.createdAt as Record<string, Date>)["$lte"] = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    if (search) {
      query.$or = [
        { caseNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
      ];
    }

    if (clientId) query.clientId = clientId;

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
      registrationDate,
      previousDate,
      stage,
      particulars,
      year,
      clientName,
      clientEmail,
      clientPhone,
    } = body;

    // Validate required fields
    if (!caseNumber || !title || !caseType || !clientId || !registrationDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if case number already exists within the same tenant
    const existingCase = await Case.findOne({ 
      caseNumber,
      advocateId: tenantId 
    });
    if (existingCase) {
      return NextResponse.json(
        { error: 'Case number already exists' },
        { status: 400 }
      );
    }

    // Verify client user exists and has client role within the same tenant
    const clientUser = await User.findOne({ 
      _id: clientId,
      advocateId: tenantId,
      roles: 'client'
    });
    if (!clientUser) {
      return NextResponse.json(
        { error: 'Client user not found or does not have client role' },
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
      advocateId: tenantId.toString(),
      fees: {
        totalAmount: fees?.totalAmount || 0,
        paidAmount: fees?.paidAmount || 0,
        pendingAmount: (fees?.totalAmount || 0) - (fees?.paidAmount || 0),
        currency: fees?.currency || 'USD',
      },
      status: 'active',
      createdBy: currentUser._id,
      registrationDate: registrationDate ? new Date(registrationDate) : undefined,
      previousDate: previousDate ? new Date(previousDate) : undefined,
      stage,
      particulars,
      year,
      clientName,
      clientEmail,
      clientPhone,
    });

    await newCase.save();

    return NextResponse.json({
      message: 'Case created successfully',
      case: newCase,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    );
  }
} 