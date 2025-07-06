export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { Storage } from '@google-cloud/storage';
import { deleteGCSFile } from '@/lib/gcs-cleanup';
import { nanoid } from 'nanoid';

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete old profile image from GCS if it exists
    if (user.profileImagePath) {
      try {
        const oldFile = bucket.file(user.profileImagePath);
        const [exists] = await oldFile.exists();
        if (exists) {
          await oldFile.delete();
        }
      } catch (gcsError) {
        // Continue with new upload even if old deletion fails
      }
    }

    // Prepare file for upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const uniqueId = nanoid(10);
    const gcsObject = `users/profile/${user._id}_${uniqueId}.${fileExtension}`;
    const gcsFile = bucket.file(gcsObject);

    try {
      // Upload to Google Cloud Storage
      await gcsFile.save(buffer, {
        contentType: file.type,
        resumable: false,
      });
      
      // Generate a signed URL valid for 24 hours
      const [signedUrl] = await gcsFile.getSignedUrl({
        action: 'read',
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });
      
      // Update user's image in MongoDB
      try {
        const updateData = {
          image: signedUrl,
          profileImagePath: gcsObject,
        };
        
        const updatedUser = await User.findOneAndUpdate(
          { email: session.user.email },
          updateData,
          { new: true, runValidators: false }
        ).select('-password');
        
        if (!updatedUser) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json({
          message: 'Avatar updated successfully',
          imageUrl: signedUrl,
        });
      } catch (dbError) {
        return NextResponse.json({ error: 'Failed to update user profile in database' }, { status: 500 });
      }
    } catch (uploadError) {
      return NextResponse.json({ error: 'Failed to upload image to cloud storage' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    // Delete from GCS if profile image exists
    if (user.profileImagePath) {
      try {
        const deleted = await deleteGCSFile(user.profileImagePath);
        if (deleted) {
          console.log(`Deleted profile image: ${user.profileImagePath}`);
        }
      } catch (gcsError) {
        console.error('Failed to delete profile image from GCS:', gcsError);
        // Continue with MongoDB update even if GCS deletion fails
      }
    }

    // Update user to remove image and profileImagePath
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $unset: {
          image: "",
          profileImagePath: ""
        }
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Clean up any stale profileImagePath references in the database
    try {
      await User.updateMany(
        { 
          email: session.user.email,
          profileImagePath: { $exists: true, $ne: null }
        },
        { $unset: { profileImagePath: "" } }
      );
    } catch (cleanupError) {
      // Don't fail the request if cleanup fails
    }

    return NextResponse.json({
      message: 'Profile image removed successfully',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 