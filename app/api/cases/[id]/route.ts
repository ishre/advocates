import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import User from '@/lib/models/User';
import { getTenantId } from '@/lib/utils';
import { deleteCaseFiles } from '@/lib/gcs-cleanup';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Filter by tenant ID to ensure data isolation
    const caseData = await Case.findOne({ _id: id, advocateId: tenantId })
      .populate('clientId', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('documents.uploadedBy', 'name')
      .populate('notes.createdBy', 'name')
      .populate('tasks.assignedTo', 'name')
      .lean();

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json({ case: caseData });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch case' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const body = await request.json();
    const {
      caseNumber,
      title,
      description,
      caseType,
      status,
      priority,
      courtName,
      courtLocation,
      judgeName,
      opposingParty,
      opposingLawyer,
      filingDate,
      nextHearingDate,
      deadlineDate,
      closedDate,
      clientId,
      clientName,
      clientEmail,
      clientPhone,
      fees,
      assignedTo,
      registrationDate,
      previousDate,
      stage,
      particulars,
      year,
      googleDriveFolderId,
    } = body;

    // Check if case exists and belongs to the tenant
    const existingCase = await Case.findOne({ _id: id, advocateId: tenantId });
    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Check if case number is being changed and if it already exists within the same tenant
    if (caseNumber && caseNumber !== existingCase.caseNumber) {
      const duplicateCase = await Case.findOne({ 
        caseNumber, 
        advocateId: tenantId,
        _id: { $ne: id } 
      });
      if (duplicateCase) {
        return NextResponse.json(
          { error: 'Case number already exists' },
          { status: 400 }
        );
      }
    }

    // Update case
    const updatedCase = await Case.findByIdAndUpdate(
      id,
      {
        caseNumber,
        title,
        description,
        caseType,
        status,
        priority,
        courtName,
        courtLocation,
        judgeName,
        opposingParty,
        opposingLawyer,
        filingDate: filingDate ? new Date(filingDate) : undefined,
        nextHearingDate: nextHearingDate ? new Date(nextHearingDate) : undefined,
        deadlineDate: deadlineDate ? new Date(deadlineDate) : undefined,
        closedDate: closedDate ? new Date(closedDate) : undefined,
        clientId,
        clientName,
        clientEmail,
        clientPhone,
        fees,
        assignedTo,
        registrationDate: registrationDate ? new Date(registrationDate) : undefined,
        previousDate: previousDate ? new Date(previousDate) : undefined,
        stage,
        particulars,
        year,
        googleDriveFolderId,
      },
      { new: true }
    )
      .populate('clientId', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return NextResponse.json({
      message: 'Case updated successfully',
      case: updatedCase,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if case exists and belongs to the tenant
    const caseData = await Case.findOne({ _id: id, advocateId: tenantId });
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Delete all files associated with this case from GCS
    let deletedFilesCount = 0;
    try {
      deletedFilesCount = await deleteCaseFiles(id);
      console.log(`Deleted ${deletedFilesCount} files from GCS for case ${id}`);
    } catch (gcsError) {
      console.error('Failed to delete case files from GCS:', gcsError);
      // Continue with case deletion even if GCS cleanup fails
    }

    // Delete the case from database
    await Case.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Case deleted successfully',
      deletedFiles: deletedFilesCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete case' },
      { status: 500 }
    );
  }
} 