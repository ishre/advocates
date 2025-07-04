import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
// import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
// import clientPromise from './mongodb';
import dbConnect from './db';
import User from './models/User';
import bcrypt from 'bcryptjs';
import { Storage } from '@google-cloud/storage';
import { IUser } from './models/User';

// Utility to generate a fresh signed URL for the profile image
async function generateProfileImageUrl(profileImagePath: string): Promise<string> {
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

export const authOptions: NextAuthOptions = {
  // adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();
          
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          
          if (!user) {
            return null;
          }

          // If user has Google OAuth but no password, allow them to set one
          if (user.googleDriveConnected && !user.password) {
            return null;
          }

          if (!user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }

          if (!user.isActive) {
            return null;
          }
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            roles: user.roles,
            advocateId: user.advocateId?.toString(),
            isMainAdvocate: user.isMainAdvocate,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.roles = user.roles;
        token.id = user.id;
        token.advocateId = user.advocateId;
        token.isMainAdvocate = user.isMainAdvocate;
        // Add needsPassword flag for Google users without a password
        const u = user as any;
        if (u.oauthProvider === 'google' && !u.password) {
          token.needsPassword = true;
        } else {
          token.needsPassword = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.roles = token.roles;
        session.user.id = token.id;
        session.user.advocateId = token.advocateId;
        session.user.isMainAdvocate = token.isMainAdvocate;
        // Pass needsPassword to session
        (session.user as any).needsPassword = token.needsPassword;
        
        // Always fetch the latest user image from the database
        try {
          await dbConnect();
          const userDoc = await User.findOne({ email: session.user.email }).lean() as IUser | null;
          
          if (userDoc) {
            // If user has a profileImagePath, generate a fresh signed URL
            if (userDoc.profileImagePath) {
              try {
                const freshImageUrl = await generateProfileImageUrl(userDoc.profileImagePath);
                if (freshImageUrl) {
                  session.user.image = freshImageUrl;
                } else {
                  // If signed URL generation fails, generate UI Avatar
                  session.user.image = `https://ui-avatars.com/api/?name=${encodeURIComponent(userDoc.name)}&background=random&color=fff&size=200`;
                }
              } catch (urlError) {
                // Generate UI Avatar if signed URL generation fails
                session.user.image = `https://ui-avatars.com/api/?name=${encodeURIComponent(userDoc.name)}&background=random&color=fff&size=200`;
              }
            } else {
              // No profileImagePath, generate UI Avatar
              session.user.image = `https://ui-avatars.com/api/?name=${encodeURIComponent(userDoc.name)}&background=random&color=fff&size=200`;
            }
          } else {
            // Generate UI Avatar if user not found
            session.user.image = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || 'User')}&background=random&color=fff&size=200`;
          }
        } catch (err) {
          // Generate UI Avatar on error
          session.user.image = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || 'User')}&background=random&color=fff&size=200`;
        }
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email?.toLowerCase() });
        if (existingUser) {
          // If user exists, update their Google OAuth info and mark email as verified
          await User.findByIdAndUpdate(existingUser._id, {
            googleDriveConnected: true,
            googleDriveToken: account.access_token,
            googleDriveRefreshToken: account.refresh_token,
            image: user.image, // Update profile image if available
            emailVerified: true, // Google OAuth means email is verified
            oauthProvider: 'google',
          });
          user.id = existingUser._id.toString();
          user.roles = existingUser.roles;
          (user as any).oauthProvider = 'google';
          (user as any).password = existingUser.password;
          return true;
        } else {
          // Defensive: build user object and remove password if undefined/null
          const newUserObj: any = {
            email: user.email?.toLowerCase(),
            name: user.name,
            image: user.image,
            roles: ['advocate'],
            isMainAdvocate: true,
            googleDriveConnected: true,
            googleDriveToken: account.access_token,
            googleDriveRefreshToken: account.refresh_token,
            emailVerified: true,
            isActive: true,
            subscription: {
              plan: 'free',
              status: 'active',
              startDate: new Date(),
            },
            oauthProvider: 'google',
          };
          // Remove password if present and falsy
          if (!newUserObj.password) delete newUserObj.password;
          const newUser = await User.create(newUserObj);
          user.id = newUser._id.toString();
          user.roles = newUser.roles;
          (user as any).oauthProvider = 'google';
          (user as any).password = undefined;
          return true;
        }
      }
      // For credentials provider, just return true
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 