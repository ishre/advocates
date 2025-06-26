import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { name, email, password, companyName, phone, roles } = await request.json();

    console.log('Signup attempt for:', email);

    // Validation
    if (!name || !email || !password || !companyName || !phone) {
      console.log('Missing required fields for:', email);
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 8) {
      console.log('Password too short for:', email);
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      console.log('Password complexity requirements not met for:', email);
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Validate roles
    const validRoles = ['advocate', 'team_member', 'admin'];
    const userRoles = roles && Array.isArray(roles) 
      ? roles.filter(role => validRoles.includes(role))
      : ['advocate'];

    if (userRoles.length === 0) {
      userRoles.push('advocate'); // Default role
    }

    // Create user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      roles: userRoles,
      companyName,
      phone,
      isActive: true,
      emailVerified: false, // Will be verified via email or Google OAuth
    });

    console.log('User created successfully:', email);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 