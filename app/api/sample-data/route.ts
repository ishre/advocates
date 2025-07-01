import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Case from '@/lib/models/Case';
import Client from '@/lib/models/Client';
import User from '@/lib/models/User';

export async function POST() {
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

    // Check if data already exists
    const existingCases = await Case.countDocuments();
    const existingClients = await Client.countDocuments();

    if (existingCases > 0 || existingClients > 0) {
      return NextResponse.json(
        { error: 'Sample data already exists' },
        { status: 400 }
      );
    }

    // Create sample clients
    const sampleClients = [
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Jane Smith',
          relationship: 'Spouse',
          phone: '+1-555-0124',
          email: 'jane.smith@email.com',
        },
        clientType: 'individual',
        preferredContactMethod: 'email',
        preferredLanguage: 'English',
        timezone: 'America/New_York',
        status: 'active',
        source: 'referral',
        assignedTo: user._id,
        createdBy: user._id,
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0125',
        address: {
          street: '456 Oak Avenue',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Mike Johnson',
          relationship: 'Brother',
          phone: '+1-555-0126',
          email: 'mike.johnson@email.com',
        },
        clientType: 'individual',
        preferredContactMethod: 'phone',
        preferredLanguage: 'English',
        timezone: 'America/Los_Angeles',
        status: 'active',
        source: 'website',
        assignedTo: user._id,
        createdBy: user._id,
      },
      {
        name: 'ABC Corporation',
        email: 'legal@abccorp.com',
        phone: '+1-555-0127',
        address: {
          street: '789 Business Blvd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA',
        },
        emergencyContact: {
          name: 'David Wilson',
          relationship: 'General Counsel',
          phone: '+1-555-0128',
          email: 'david.wilson@abccorp.com',
        },
        clientType: 'corporate',
        preferredContactMethod: 'email',
        preferredLanguage: 'English',
        timezone: 'America/Chicago',
        status: 'active',
        source: 'referral',
        assignedTo: user._id,
        createdBy: user._id,
      },
    ];

    const createdClients = await Client.insertMany(sampleClients);

    // Create sample cases
    const sampleCases = [
      {
        caseNumber: 'CASE-2024-001',
        title: 'Smith vs. Johnson - Contract Dispute',
        description: 'Breach of contract case involving software development services',
        caseType: 'civil',
        status: 'active',
        priority: 'high',
        clientId: createdClients[0]._id,
        clientName: createdClients[0].name,
        clientEmail: createdClients[0].email,
        clientPhone: createdClients[0].phone,
        courtName: 'New York Supreme Court',
        courtLocation: 'New York, NY',
        judgeName: 'Hon. Robert Brown',
        opposingParty: 'Johnson Development LLC',
        opposingLawyer: 'Mary Davis, Esq.',
        filingDate: new Date('2024-01-15'),
        nextHearingDate: new Date('2024-07-15'),
        deadlineDate: new Date('2024-06-30'),
        fees: {
          totalAmount: 15000,
          paidAmount: 5000,
          pendingAmount: 10000,
          currency: 'USD',
        },
        assignedTo: [user._id],
        createdBy: user._id,
        documents: [
          {
            name: 'Complaint.pdf',
            type: 'application/pdf',
            size: 1024000,
            url: '/documents/complaint.pdf',
            uploadedAt: new Date('2024-01-15'),
            uploadedBy: user._id,
          },
        ],
        notes: [
          {
            content: 'Initial client consultation completed. Case appears strong on merits.',
            createdBy: user._id,
            createdAt: new Date('2024-01-15'),
            isPrivate: false,
          },
        ],
        tasks: [
          {
            title: 'File Motion for Summary Judgment',
            description: 'Prepare and file motion for summary judgment based on contract terms',
            assignedTo: user._id,
            dueDate: new Date('2024-06-15'),
            status: 'pending',
            priority: 'high',
            createdAt: new Date('2024-01-15'),
          },
        ],
      },
      {
        caseNumber: 'CASE-2024-002',
        title: 'Johnson - Personal Injury',
        description: 'Personal injury case resulting from automobile accident',
        caseType: 'civil',
        status: 'active',
        priority: 'medium',
        clientId: createdClients[1]._id,
        clientName: createdClients[1].name,
        clientEmail: createdClients[1].email,
        clientPhone: createdClients[1].phone,
        courtName: 'Los Angeles Superior Court',
        courtLocation: 'Los Angeles, CA',
        judgeName: 'Hon. Lisa Garcia',
        opposingParty: 'XYZ Insurance Company',
        opposingLawyer: 'Tom Anderson, Esq.',
        filingDate: new Date('2024-02-01'),
        nextHearingDate: new Date('2024-08-01'),
        deadlineDate: new Date('2024-07-15'),
        fees: {
          totalAmount: 8000,
          paidAmount: 2000,
          pendingAmount: 6000,
          currency: 'USD',
        },
        assignedTo: [user._id],
        createdBy: user._id,
        documents: [
          {
            name: 'Police Report.pdf',
            type: 'application/pdf',
            size: 512000,
            url: '/documents/police-report.pdf',
            uploadedAt: new Date('2024-02-01'),
            uploadedBy: user._id,
          },
        ],
        notes: [
          {
            content: 'Client suffered significant injuries. Medical records support claim.',
            createdBy: user._id,
            createdAt: new Date('2024-02-01'),
            isPrivate: false,
          },
        ],
        tasks: [
          {
            title: 'Obtain Medical Records',
            description: 'Request and review all medical records from treating physicians',
            assignedTo: user._id,
            dueDate: new Date('2024-06-30'),
            status: 'in_progress',
            priority: 'medium',
            createdAt: new Date('2024-02-01'),
          },
        ],
      },
      {
        caseNumber: 'CASE-2024-003',
        title: 'ABC Corp - Employment Dispute',
        description: 'Wrongful termination and discrimination case',
        caseType: 'civil',
        status: 'pending',
        priority: 'urgent',
        clientId: createdClients[2]._id,
        clientName: createdClients[2].name,
        clientEmail: createdClients[2].email,
        clientPhone: createdClients[2].phone,
        courtName: 'Illinois Circuit Court',
        courtLocation: 'Chicago, IL',
        judgeName: 'Hon. Michael Chen',
        opposingParty: 'Former Employee',
        opposingLawyer: 'Jennifer White, Esq.',
        filingDate: new Date('2024-03-01'),
        nextHearingDate: new Date('2024-09-01'),
        deadlineDate: new Date('2024-08-15'),
        fees: {
          totalAmount: 25000,
          paidAmount: 10000,
          pendingAmount: 15000,
          currency: 'USD',
        },
        assignedTo: [user._id],
        createdBy: user._id,
        documents: [
          {
            name: 'Employment Contract.pdf',
            type: 'application/pdf',
            size: 2048000,
            url: '/documents/employment-contract.pdf',
            uploadedAt: new Date('2024-03-01'),
            uploadedBy: user._id,
          },
        ],
        notes: [
          {
            content: 'Complex employment law case. Need to review all company policies.',
            createdBy: user._id,
            createdAt: new Date('2024-03-01'),
            isPrivate: false,
          },
        ],
        tasks: [
          {
            title: 'Review Company Policies',
            description: 'Analyze all company policies related to termination and discrimination',
            assignedTo: user._id,
            dueDate: new Date('2024-07-01'),
            status: 'pending',
            priority: 'high',
            createdAt: new Date('2024-03-01'),
          },
        ],
      },
    ];

    await Case.insertMany(sampleCases);

    // Update client statistics
    for (const client of createdClients) {
      const caseCount = await Case.countDocuments({ clientId: client._id });
      const activeCaseCount = await Case.countDocuments({ 
        clientId: client._id, 
        status: 'active' 
      });
      
      await Client.findByIdAndUpdate(client._id, {
        totalCases: caseCount,
        activeCases: activeCaseCount,
      });
    }

    return NextResponse.json({
      message: 'Sample data created successfully',
      clients: createdClients.length,
      cases: sampleCases.length,
    });
  } catch (error) {
    console.error('Error creating sample data:', error);
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    );
  }
} 