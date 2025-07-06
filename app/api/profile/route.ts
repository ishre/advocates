import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { Storage } from '@google-cloud/storage';

const bucketName = process.env.GCLOUD_STORAGE_BUCKET!;
const storage = new Storage(
  process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? undefined
    : {
        projectId: process.env.GCLOUD_PROJECT_ID,
        credentials: {
          client_email: process.env.GCLOUD_CLIENT_EMAIL,
          private_key: process.env.GCLOUD_PRIVATE_KEY?.replace(/\n/g, "\n"),
        },
      }
);
const bucket = storage.bucket(bucketName);

// Utility function to generate fresh signed URL for profile image
async function generateProfileImageUrl(profileImagePath: string): Promise<string> {
  try {
    const file = bucket.file(profileImagePath);
    const [exists] = await file.exists();
    if (!exists) {
      return '';
    }
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    return signedUrl;
  } catch (error) {
    return '';
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has a password set
    const hasPassword = !!user.password;
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Generate fresh signed URL for profile image if it exists
    if (userResponse.profileImagePath) {
      try {
        const freshImageUrl = await generateProfileImageUrl(userResponse.profileImagePath);
        userResponse.image = freshImageUrl;
      } catch (error) {
        // Generate UI Avatar if generation fails
        const initials = userResponse.name
          .split(' ')
          .map((n: string) => n.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2);
        userResponse.image = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=200`;
        // Also clear the profileImagePath since the file doesn't exist
        userResponse.profileImagePath = undefined;
        
        // Clean up the stale reference in the database
        try {
          await User.updateOne(
            { email: userResponse.email },
            { $unset: { profileImagePath: "" } }
          );
        } catch (cleanupError) {
          // Don't fail the request if cleanup fails
        }
      }
    } else {
      // No profile image, generate UI Avatar
      const initials = userResponse.name
        .split(' ')
        .map((n: string) => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
      userResponse.image = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=200`;
    }

    // Add hasPassword field to response
    userResponse.hasPassword = hasPassword;

    return NextResponse.json(userResponse);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { name, email, phone, companyName } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email is being changed and if it already exists
    if (email !== session.user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        name,
        email: email.toLowerCase(),
        phone,
        companyName,
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 