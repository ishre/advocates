import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Client from '@/lib/models/Client';
import User from '@/lib/models/User';
import { getEmailService } from '@/lib/email-service';
import bcrypt from 'bcryptjs';

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
    const search = searchParams.get('search');

    const query: any = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      Client.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Client.countDocuments(query),
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

    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email });
    let isNewUser = false;
    let plainPassword = '';

    if (!user) {
      // Create new user with client role and random password
      plainPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      user = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        roles: ['client'],
        isActive: true,
        emailVerified: false,
      });
      await user.save();
      isNewUser = true;
    } else {
      // User exists, add client role if not present
      if (!user.roles.includes('client')) {
        user.roles.push('client');
        await user.save();
      }
    }

    // Send credentials email if new user
    if (isNewUser) {
      const emailService = getEmailService();
      if (emailService) {
        await emailService.sendEmail({
          to: email,
          subject: 'Your Client Account Credentials',
          html: `<p>Hello ${name},</p><p>Your client account has been created. You can log in with the following credentials:</p><ul><li><b>Email:</b> ${email}</li><li><b>Password:</b> ${plainPassword}</li></ul><p>Please change your password after logging in.</p>`,
          text: `Hello ${name},\nYour client account has been created.\nEmail: ${email}\nPassword: ${plainPassword}\nPlease change your password after logging in.`,
        });
      }
    }

    return NextResponse.json({
      message: isNewUser ? 'Client user created successfully' : 'Client role added to existing user',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error('Error creating client user:', error);
    return NextResponse.json(
      { error: 'Failed to create client user' },
      { status: 500 }
    );
  }
} 