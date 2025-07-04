import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, password, companyName, phone, roles } = body;

    // Validate required fields
    if (!name || !email || !password || !companyName || !phone || !roles) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      companyName,
      phone,
      roles,
      isMainAdvocate: true, // New advocates are main advocates
      isActive: true,
      emailVerified: false,
      subscription: {
        plan: 'free',
        status: 'active',
        startDate: new Date(),
      },
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        roles: newUser.roles,
        isMainAdvocate: newUser.isMainAdvocate,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 