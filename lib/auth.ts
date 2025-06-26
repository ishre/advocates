import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
// import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
// import clientPromise from './mongodb';
import dbConnect from './db';
import User from './models/User';
import bcrypt from 'bcryptjs';

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
            console.log('User not found:', credentials.email);
            return null;
          }

          // If user has Google OAuth but no password, allow them to set one
          if (user.googleDriveConnected && !user.password) {
            console.log('User has Google OAuth but no password:', credentials.email);
            return null;
          }

          if (!user.password) {
            console.log('User has no password:', credentials.email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          if (!user.isActive) {
            console.log('User account is inactive:', credentials.email);
            return null;
          }

          console.log('User authenticated successfully:', credentials.email);
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            roles: user.roles,
          };
        } catch (error) {
          console.error('Credentials authorization error:', error);
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.roles = token.roles;
        session.user.id = token.id;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
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
          });
          console.log('Updated existing user with Google OAuth:', user.email);
          
          // Update the user object with our custom data
          user.id = existingUser._id.toString();
          user.roles = existingUser.roles;
          return true;
        } else {
          // Create new user with Google profile
          const newUser = await User.create({
            email: user.email?.toLowerCase(),
            name: user.name,
            image: user.image,
            roles: ['advocate'], // Default role for new users
            googleDriveConnected: true,
            googleDriveToken: account.access_token,
            googleDriveRefreshToken: account.refresh_token,
            emailVerified: true, // Google OAuth means email is verified
            isActive: true,
            subscription: {
              plan: 'free',
              status: 'active',
              startDate: new Date(),
            },
          });
          console.log('Created new user with Google OAuth:', user.email);
          
          // Update the user object with our custom data
          user.id = newUser._id.toString();
          user.roles = newUser.roles;
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