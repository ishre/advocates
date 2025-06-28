import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Case from '@/lib/models/Case';

// Simple in-memory storage for documents (in production, you'd use a proper database model and file storage)
let documents: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const documentType = formData.get('documentType') as string;
    const date = formData.get('date') as string;
    const tags = formData.get('tags') as string;

    // Validate required fields
    if (!file || !caseId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, DOC, DOCX, TXT, JPG, PNG' },
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

    // In a real application, you would:
    // 1. Upload the file to cloud storage (AWS S3, Google Cloud Storage, etc.)
    // 2. Store the file URL and metadata in the database
    // 3. Create a proper Document model

    // For now, we'll simulate file upload
    const fileBuffer = await file.arrayBuffer();
    const fileSize = fileBuffer.byteLength;

    // Create new document record
    const newDocument = {
      id: Date.now().toString(),
      caseId,
      caseNumber: caseItem.caseNumber,
      caseTitle: caseItem.title,
      clientName: caseItem.clientId.name,
      title,
      description,
      documentType,
      fileName: file.name,
      fileSize,
      fileType: file.type,
      date: date ? new Date(date) : new Date(),
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      status: 'uploaded',
      createdBy: session.user.email,
      createdAt: new Date(),
      // In production, this would be the actual file URL
      fileUrl: `/api/documents/${Date.now()}_${file.name}`,
    };

    documents.push(newDocument);

    return NextResponse.json({
      message: 'Document uploaded successfully',
      document: newDocument,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
} 