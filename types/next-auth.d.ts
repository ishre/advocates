import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      roles: string[];
      advocateId?: string;
      isMainAdvocate?: boolean;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    roles: string[];
    advocateId?: string;
    isMainAdvocate?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roles: string[];
    advocateId?: string;
    isMainAdvocate?: boolean;
  }
} 