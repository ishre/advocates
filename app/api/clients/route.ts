import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { initializeEmailService } from '@/lib/email-service';
import bcrypt from 'bcryptjs';
import Case from '@/lib/models/Case';
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
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const query: Record<string, unknown> = {
      advocateId: tenantId, // Filter by tenant/advocate
      roles: 'client', // Only get client users
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.isActive = status === 'active';
    }

    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      User.find(query)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
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
      name,
      email,
      phone,
      address,
      dateOfBirth,
      occupation,
      emergencyContact,
      clientType,
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if client already exists within the same tenant
    const existingClient = await User.findOne({
      email: email.toLowerCase(),
      advocateId: tenantId,
      roles: 'client',
    });
    if (existingClient) {
      return NextResponse.json(
        { error: 'Client with this email already exists' },
        { status: 400 }
      );
    }

    // Generate a random password for the client
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create new client user
    const newClient = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      occupation,
      emergencyContact,
      clientType: clientType || 'individual',
      roles: ['client'],
      advocateId: tenantId, // Associate with tenant
      isActive: true,
      emailVerified: false,
    });

    // Send welcome email to client
    try {
      const emailService = initializeEmailService({
        host: process.env.SMTP_HOST!,
        port: parseInt(process.env.SMTP_PORT!),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASS!,
        },
      });

      await emailService.sendWelcomeEmail({
        to: newClient.email,
        name: newClient.name,
        advocateName: currentUser.name,
        advocateEmail: currentUser.email,
        tempPassword,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'Client created successfully',
      client: {
        id: newClient._id,
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        isActive: newClient.isActive,
      },
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const clientId = searchParams.get('id');

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Verify client exists and belongs to the same tenant
    const client = await User.findOne({
      _id: clientId,
      advocateId: tenantId,
      roles: 'client',
    });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if client has any active cases
    const activeCases = await Case.findOne({
      clientId: clientId,
      advocateId: tenantId,
      status: { $in: ['active', 'pending', 'on_hold'] },
    });

    if (activeCases) {
      return NextResponse.json(
        { error: 'Cannot delete client with active cases' },
        { status: 400 }
      );
    }

    // Delete all cases associated with this client
    await Case.deleteMany({
      clientId: clientId,
      advocateId: tenantId,
    });

    // Delete the client
    await User.findByIdAndDelete(clientId);

    // Send notification email to client
    try {
      const emailService = initializeEmailService({
        host: process.env.SMTP_HOST!,
        port: parseInt(process.env.SMTP_PORT!),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASS!,
        },
      });

      await emailService.sendAccountDeletionEmail({
        to: client.email,
        name: client.name,
        advocateName: currentUser.name,
      });
    } catch (emailError) {
      console.error('Failed to send deletion email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'Client and all associated cases deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
} 